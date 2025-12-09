'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { booksAPI } from '@/lib/api-client';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publication_year?: number;
  category?: string;
  total_copies: number;
  available_copies: number;
  description?: string;
}

export default function BooksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publication_year: '',
    category: '',
    total_copies: '1',
    description: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [user, search]);

  const loadBooks = async () => {
    try {
      const data = await booksAPI.getAll({ search, limit: 100 });
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bookData = {
        ...formData,
        publication_year: formData.publication_year ? parseInt(formData.publication_year) : undefined,
        total_copies: parseInt(formData.total_copies),
      };

      if (editingBook) {
        await booksAPI.update(editingBook.id, bookData);
      } else {
        await booksAPI.create(bookData);
      }

      setShowModal(false);
      setEditingBook(null);
      resetForm();
      loadBooks();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      publication_year: book.publication_year?.toString() || '',
      category: book.category || '',
      total_copies: book.total_copies.toString(),
      description: book.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sách này?')) return;

    try {
      await booksAPI.delete(id);
      loadBooks();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      publication_year: '',
      category: '',
      total_copies: '1',
      description: '',
    });
  };

  const openAddModal = () => {
    setEditingBook(null);
    resetForm();
    setShowModal(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const canEdit = user.role === 'admin' || user.role === 'librarian';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Sách</h1>
          {canEdit && (
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Thêm sách mới
            </button>
          )}
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm sách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-2">{book.title}</h3>
              <p className="text-gray-600 mb-2">Tác giả: {book.author}</p>
              {book.isbn && <p className="text-sm text-gray-500 mb-2">ISBN: {book.isbn}</p>}
              {book.category && <p className="text-sm text-gray-500 mb-2">Thể loại: {book.category}</p>}
              <p className="text-sm mb-4">
                <span className="font-medium">Số lượng:</span> {book.available_copies}/{book.total_copies} cuốn
              </p>
              {canEdit && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(book)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingBook ? 'Sửa sách' : 'Thêm sách mới'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tác giả *</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">ISBN</label>
                    <input
                      type="text"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Năm xuất bản</label>
                    <input
                      type="number"
                      value={formData.publication_year}
                      onChange={(e) => setFormData({ ...formData, publication_year: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nhà xuất bản</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Thể loại</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Số lượng *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.total_copies}
                    onChange={(e) => setFormData({ ...formData, total_copies: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingBook ? 'Cập nhật' : 'Thêm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBook(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

