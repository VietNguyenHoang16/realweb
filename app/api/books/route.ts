import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { z } from 'zod';

const bookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  publication_year: z.number().int().optional(),
  category: z.string().optional(),
  total_copies: z.number().int().min(1).default(1),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM books WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (title ILIKE $${paramCount} OR author ILIKE $${paramCount} OR isbn ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query('SELECT COUNT(*) FROM books');
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      books: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get books error:', error);
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

    const body = await request.json();
    const validatedData = bookSchema.parse(body);

    const result = await pool.query(
      `INSERT INTO books (title, author, isbn, publisher, publication_year, category, total_copies, available_copies, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8)
       RETURNING *`,
      [
        validatedData.title,
        validatedData.author,
        validatedData.isbn || null,
        validatedData.publisher || null,
        validatedData.publication_year || null,
        validatedData.category || null,
        validatedData.total_copies,
        validatedData.description || null,
      ]
    );

    return NextResponse.json({
      message: 'Thêm sách thành công',
      book: result.rows[0],
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create book error:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}

