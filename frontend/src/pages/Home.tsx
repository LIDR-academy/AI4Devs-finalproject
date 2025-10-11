import React from 'react';
import { Button } from '../components';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Welcome to LiDR
          </h1>
          <p className="mb-8 text-lg text-gray-600">
            Your personal finance management solution
          </p>
        </div>

        {/* Button Component Showcase */}
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Button Component Library
          </h2>

          {/* Variants Section */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">
              Variants
            </h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>

          {/* Sizes Section */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          {/* States Section */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">States</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button isLoading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>

          {/* With Icons Section */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">
              With Icons
            </h3>
            <div className="flex flex-wrap gap-4">
              <Button
                leftIcon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                }
              >
                Add Item
              </Button>
              <Button
                variant="secondary"
                rightIcon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                }
              >
                Next
              </Button>
            </div>
          </div>

          {/* Full Width Section */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">
              Full Width
            </h3>
            <Button fullWidth>Full Width Button</Button>
          </div>

          {/* Interactive Example */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-700">
              Interactive
            </h3>
            <Button variant="primary" onClick={() => alert('Button clicked!')}>
              Click Me
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
