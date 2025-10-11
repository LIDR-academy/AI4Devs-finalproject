import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-700">
          Page Not Found
        </h2>
        <p className="mb-8 text-lg text-gray-600">
          The page you're looking for doesn't exist.
        </p>
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-block rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition-colors duration-200 hover:bg-blue-600"
          >
            Go Home
          </Link>
          <p className="text-sm text-gray-400">
            This is the 404 page for unknown routes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
