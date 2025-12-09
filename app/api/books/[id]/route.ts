import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { z } from 'zod';

const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  publication_year: z.number().int().optional(),
  category: z.string().optional(),
  total_copies: z.number().int().min(1).optional(),
  description: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [params.id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy sách' },
        { status: 404 }
      );
    }

    return NextResponse.json({ book: result.rows[0] });
  } catch (error) {
    console.error('Get book error:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const validatedData = updateBookSchema.parse(body);

    // Lấy thông tin sách hiện tại
    const currentBook = await pool.query('SELECT * FROM books WHERE id = $1', [params.id]);
    if (currentBook.rows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy sách' },
        { status: 404 }
      );
    }

    const book = currentBook.rows[0];
    const newTotalCopies = validatedData.total_copies || book.total_copies;
    const currentBorrowed = book.total_copies - book.available_copies;
    const newAvailableCopies = Math.max(0, newTotalCopies - currentBorrowed);

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (validatedData.title) {
      paramCount++;
      updateFields.push(`title = $${paramCount}`);
      values.push(validatedData.title);
    }
    if (validatedData.author) {
      paramCount++;
      updateFields.push(`author = $${paramCount}`);
      values.push(validatedData.author);
    }
    if (validatedData.isbn !== undefined) {
      paramCount++;
      updateFields.push(`isbn = $${paramCount}`);
      values.push(validatedData.isbn || null);
    }
    if (validatedData.publisher !== undefined) {
      paramCount++;
      updateFields.push(`publisher = $${paramCount}`);
      values.push(validatedData.publisher || null);
    }
    if (validatedData.publication_year !== undefined) {
      paramCount++;
      updateFields.push(`publication_year = $${paramCount}`);
      values.push(validatedData.publication_year || null);
    }
    if (validatedData.category !== undefined) {
      paramCount++;
      updateFields.push(`category = $${paramCount}`);
      values.push(validatedData.category || null);
    }
    if (validatedData.total_copies) {
      paramCount++;
      updateFields.push(`total_copies = $${paramCount}`);
      values.push(newTotalCopies);
      paramCount++;
      updateFields.push(`available_copies = $${paramCount}`);
      values.push(newAvailableCopies);
    }
    if (validatedData.description !== undefined) {
      paramCount++;
      updateFields.push(`description = $${paramCount}`);
      values.push(validatedData.description || null);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'Không có trường nào để cập nhật' },
        { status: 400 }
      );
    }

    paramCount++;
    values.push(params.id);

    const result = await pool.query(
      `UPDATE books SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return NextResponse.json({
      message: 'Cập nhật sách thành công',
      book: result.rows[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update book error:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = requireAuth(request);
    if (authError) return authError;

    const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [params.id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy sách' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Xóa sách thành công',
    });
  } catch (error) {
    console.error('Delete book error:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

