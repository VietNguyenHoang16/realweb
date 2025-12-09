'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { loansAPI, booksAPI } from '@/lib/api-client';

interface Loan {
  id: number;
  user_id: number;
  book_id: number;
  loan_date: string;
  due_date: string;
  return_date?: string;
  status: string;
  username?: string;
  user_name?: string;
  book_title?: string;
  book_author?: string;
}

interface Book {
  id: number;
  title: string;
  available_copies: number;
}

export default function LoansPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadLoans();
      loadBooks();
    }
  }, [user, statusFilter]);

  const loadLoans = async () => {
    try {
      const params: any = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      const data = await loansAPI.getAll(params);
      setLoans(data.loans || []);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    try {
      const data = await booksAPI.getAll({ limit: 1000 });
      setBooks(data.books?.filter((b: any) => b.available_copies > 0) || []);
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId) return;

    try {
      await loansAPI.create({ book_id: parseInt(selectedBookId) });
      setShowBorrowModal(false);
      setSelectedBookId('');
      loadLoans();
      loadBooks();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleReturn = async (loanId: number) => {
    if (!confirm('Bạn có chắc chắn muốn trả sách này?')) return;

    try {
      await loansAPI.return(loanId);
      loadLoans();
      loadBooks();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'borrowed':
        return 'bg-blue-100 text-blue-800';
      case 'returned':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'borrowed':
        return 'Đang mượn';
      case 'returned':
        return 'Đã trả';
      case 'overdue':
        return 'Quá hạn';
      default:
        return status;
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Mượn/Trả sách</h1>
          <button
            onClick={() => setShowBorrowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Mượn sách
          </button>
        </div>

        <div className="mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả</option>
            <option value="borrowed">Đang mượn</option>
            <option value="returned">Đã trả</option>
            <option value="overdue">Quá hạn</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sách</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người mượn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày mượn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn trả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày trả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loans.map((loan) => (
                <tr key={loan.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{loan.book_title}</div>
                      <div className="text-sm text-gray-500">{loan.book_author}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {loan.user_name || loan.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(loan.loan_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(loan.due_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {loan.return_date ? formatDate(loan.return_date) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                      {getStatusText(loan.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {loan.status === 'borrowed' && (
                      <button
                        onClick={() => handleReturn(loan.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Trả sách
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showBorrowModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Mượn sách</h2>
              <form onSubmit={handleBorrow}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Chọn sách *</label>
                  <select
                    required
                    value={selectedBookId}
                    onChange={(e) => setSelectedBookId(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">-- Chọn sách --</option>
                    {books.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title} ({book.available_copies} cuốn có sẵn)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Mượn sách
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBorrowModal(false);
                      setSelectedBookId('');
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

