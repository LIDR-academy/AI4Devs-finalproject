import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoginForm from '@/features/auth/components/LoginForm';

const LoginPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md px-4">
          <LoginForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;