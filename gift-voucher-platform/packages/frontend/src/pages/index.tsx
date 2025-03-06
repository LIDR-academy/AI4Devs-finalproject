import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Card from '@/components/ui/Card';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      console.log('User is authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Gifty - Gift Voucher Platform</title>
        <meta name="description" content="Buy and manage gift vouchers with Gifty" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Gifty - Gift Voucher Platform
        </h1>
        
        <div className="max-w-3xl mx-auto">
          <Card title="About Gifty">
            <p className="text-lg text-gray-700">
              Gifty is a platform for buying, managing, and redeeming gift vouchers from your favorite stores.
              Our simplified interface makes it easy to purchase and track your vouchers.
            </p>
          </Card>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/login" className="flex-1">
              <div className="bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-md transition-colors">
                Sign In
              </div>
            </Link>
            <Link href="/register" className="flex-1">
              <div className="bg-gray-800 hover:bg-gray-900 text-white text-center py-3 px-4 rounded-md transition-colors">
                Create Account
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}