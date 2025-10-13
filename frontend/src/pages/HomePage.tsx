import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';

const HomePage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              Welcome to Your App
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              A modern React application built with Vite, TypeScript, and Tailwind CSS
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="primary">
                Get Started
              </Button>
              <Link to="/login">
                <Button variant="secondary">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;