import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="mb-8 text-lg text-gray-600">Your financial overview</p>
        <div className="space-y-4">
          <p className="text-gray-500">
            This is the dashboard page placeholder.
          </p>
          <p className="text-sm text-gray-400">Route: /dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
