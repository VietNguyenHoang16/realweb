import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { getAuthUser } from '@/lib/auth';
import { z } from 'zod';

const loanSchema = z.object({
  book_id: z.number().int(),
  user_id: z.number().int().optional(),
  due_date: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authError = requireAuth(request);
    if (authError) return authError;

    const user = getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const userId = searchParams.get('user_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        l.*,
        u.username,
        u.full_name as user_name,
        b.title as book_title,
        b.author as book_author
      FROM loans l
      JOIN users u ON l.user_id = u.id
      JOIN books b ON l.book_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    // Nếu không phải admin, chỉ xem được loans của mình
    if (user && user.role !== 'admin' && user.role !== 'librarian') {
      paramCount++;
      query += ` AND l.user_id = $${paramCount}`;
      params.push(user.userId);
    } else if (userId) {
      paramCount++;
      query += ` AND l.user_id = $${paramCount}`;
      params.push(userId);
    }

    if (status) {
      paramCount++;
      query += ` AND l.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY l.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query('SELECT COUNT(*) FROM loans');
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      loans: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get loans error:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = requireAuth(request);
    if (authError) return authError;

    const user = getAuthUser(request);
    const body = await request.json();
    const validatedData = loanSchema.parse(body);

    // Xác định user_id (admin có thể mượn cho người khác)
    const loanUserId = validatedData.user_id || (user ? user.userId : null);
    if (!loanUserId) {
      return NextResponse.json(
        { error: 'User ID không hợp lệ' },
        { status: 400 }
      );
    }

    // Kiểm tra sách có sẵn không
    const bookResult = await pool.query('SELECT * FROM books WHERE id = $1', [validatedData.book_id]);
    if (bookResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy sách' },
        { status: 404 }
      );
    }

    const book = bookResult.rows[0];
    if (book.available_copies < 1) {
      return NextResponse.json(
        { error: 'Sách không còn sẵn có' },
        { status: 400 }
      );
    }

    // Tính due_date (mặc định 14 ngày)
    const dueDate = validatedData.due_date 
      ? new Date(validatedData.due_date)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Tạo loan
    const loanResult = await pool.query(
      `INSERT INTO loans (user_id, book_id, due_date, status)
       VALUES ($1, $2, $3, 'borrowed')
       RETURNING *`,
      [loanUserId, validatedData.book_id, dueDate]
    );

    // Cập nhật available_copies
    await pool.query(
      'UPDATE books SET available_copies = available_copies - 1 WHERE id = $1',
      [validatedData.book_id]
    );

    // Ghi lịch sử
    await pool.query(
      `INSERT INTO loan_history (loan_id, user_id, book_id, action)
       VALUES ($1, $2, $3, 'borrowed')`,
      [loanResult.rows[0].id, loanUserId, validatedData.book_id]
    );

    return NextResponse.json({
      message: 'Mượn sách thành công',
      loan: loanResult.rows[0],
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create loan error:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

