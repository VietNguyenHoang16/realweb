'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { booksAPI, loansAPI } from '@/lib/api-client';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    totalLoans: 0,
    activeLoans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const [booksData, loansData] = await Promise.all([
        booksAPI.getAll({ limit: 1000 }),
        loansAPI.getAll({ limit: 1000 }),
      ]);

      const totalBooks = booksData.books?.length || 0;
      const availableBooks = booksData.books?.reduce((sum: number, book: any) => sum + book.available_copies, 0) || 0;
      const totalLoans = loansData.loans?.length || 0;
      const activeLoans = loansData.loans?.filter((loan: any) => loan.status === 'borrowed').length || 0;

      setStats({
        totalBooks,
        availableBooks,
        totalLoans,
        activeLoans,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Tổng số sách</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalBooks}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Sách có sẵn</h3>
            <p className="text-3xl font-bold text-green-600">{stats.availableBooks}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Tổng lượt mượn</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalLoans}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Đang mượn</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.activeLoans}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin tài khoản</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Tên đăng nhập:</span> {user.username}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            {user.full_name && (
              <p><span className="font-medium">Họ và tên:</span> {user.full_name}</p>
            )}
            <p><span className="font-medium">Vai trò:</span> {user.role === 'admin' ? 'Quản trị viên' : user.role === 'librarian' ? 'Thủ thư' : 'Người dùng'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

