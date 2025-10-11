import React from 'react';

const Register: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Register</h1>
        <p className="mb-8 text-lg text-gray-600">Create your account</p>
        <div className="space-y-4">
          <p className="text-gray-500">
            This is the register page placeholder.
          </p>
          <p className="text-sm text-gray-400">Route: /register</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
