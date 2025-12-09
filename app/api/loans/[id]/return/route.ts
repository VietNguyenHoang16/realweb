import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { getAuthUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = requireAuth(request);
    if (authError) return authError;

    const { id } = await params;
    const user = getAuthUser(request);

    // Lấy thông tin loan
    const loanResult = await pool.query(
      `SELECT l.*, b.id as book_id FROM loans l
       JOIN books b ON l.book_id = b.id
       WHERE l.id = $1`,
      [id]
    );

    if (loanResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy phiếu mượn' },
        { status: 404 }
      );
    }

    const loan = loanResult.rows[0];

    // Kiểm tra quyền (user chỉ có thể trả sách của mình, admin/librarian có thể trả bất kỳ)
    if (user && user.role !== 'admin' && user.role !== 'librarian' && loan.user_id !== user.userId) {
      return NextResponse.json(
        { error: 'Không có quyền thực hiện hành động này' },
        { status: 403 }
      );
    }

    if (loan.status === 'returned') {
      return NextResponse.json(
        { error: 'Sách đã được trả rồi' },
        { status: 400 }
      );
    }

    // Cập nhật loan
    const returnDate = new Date();
    const status = returnDate > new Date(loan.due_date) ? 'overdue' : 'returned';

    await pool.query(
      `UPDATE loans 
       SET return_date = $1, status = $2
       WHERE id = $3`,
      [returnDate, status, id]
    );

    // Cập nhật available_copies
    await pool.query(
      'UPDATE books SET available_copies = available_copies + 1 WHERE id = $1',
      [loan.book_id]
    );

    // Ghi lịch sử
    await pool.query(
      `INSERT INTO loan_history (loan_id, user_id, book_id, action)
       VALUES ($1, $2, $3, 'returned')`,
      [id, loan.user_id, loan.book_id]
    );

    return NextResponse.json({
      message: 'Trả sách thành công',
    });
  } catch (error) {
    console.error('Return book error:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

