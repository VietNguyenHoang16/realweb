import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = requireAuth(request);
    if (authError) return authError;

    const user = getAuthUser(request);

    const result = await pool.query(
      `SELECT 
        l.*,
        u.username,
        u.full_name as user_name,
        b.title as book_title,
        b.author as book_author,
        b.isbn
      FROM loans l
      JOIN users u ON l.user_id = u.id
      JOIN books b ON l.book_id = b.id
      WHERE l.id = $1`,
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy phiếu mượn' },
        { status: 404 }
      );
    }

    const loan = result.rows[0];

    // Kiểm tra quyền
    if (user && user.role !== 'admin' && user.role !== 'librarian' && loan.user_id !== user.userId) {
      return NextResponse.json(
        { error: 'Không có quyền xem phiếu mượn này' },
        { status: 403 }
      );
    }

    return NextResponse.json({ loan: result.rows[0] });
  } catch (error) {
    console.error('Get loan error:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

