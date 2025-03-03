import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import VoucherTable from '@/components/dashboard/VoucherTable';
import { getDashboardData, Order } from '@/services/dashboard';

// Icons for the stat cards
const ProductIcon = () => (
  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const OrderIcon = () => (
  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const VoucherActiveIcon = () => (
  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const VoucherRedeemedIcon = () => (
  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // Redirect to login page if not authenticated
      console.log('User is not authenticated, redirecting to login');
      router.push('/login');
    },
  });
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    activeVouchers: 0,
    redeemedVouchers: 0,
  });
  
  const [recentVouchers, setRecentVouchers] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardData();
        setStats(data.stats);
        setRecentVouchers(data.recentVouchers);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (session) {
      fetchDashboardData();
    }
  }, [session]);
  
  return (
    <DashboardLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Products" 
          value={stats.totalProducts} 
          icon={<ProductIcon />} 
          description="Total products" 
        />
        <StatCard 
          title="Orders" 
          value={stats.totalOrders} 
          icon={<OrderIcon />} 
          description="Total orders" 
        />
        <StatCard 
          title="Active Vouchers" 
          value={stats.activeVouchers} 
          icon={<VoucherActiveIcon />} 
          description="Vouchers available for redemption" 
        />
        <StatCard 
          title="Redeemed Vouchers" 
          value={stats.redeemedVouchers} 
          icon={<VoucherRedeemedIcon />} 
          description="Vouchers that have been used" 
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <VoucherTable 
          vouchers={recentVouchers} 
          title="Recent Orders with Vouchers" 
          loading={loading} 
        />
      </div>
    </DashboardLayout>
  );
} 