import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, LogIn, Mail, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('ShopMefy2024');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-shopmefy-50 via-green-50 to-blue-50 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-shopmefy-200 to-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-shopmefy-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo and Brand */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-shopmefy-500 to-shopmefy-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-shopmefy-600 to-green-600 bg-clip-text text-transparent mb-2">
            ShopMeFy
          </h1>
          <p className="text-gray-600 text-lg">Turn WhatsApp into your complete sales channel</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Sparkles className="w-4 h-4 text-shopmefy-500" />
            <span className="text-sm text-shopmefy-600 font-medium">AI-Powered E-commerce</span>
            <Sparkles className="w-4 h-4 text-shopmefy-500" />
          </div>
        </div>
        
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 animate-scale-in backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <LogIn className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
            </div>
            <CardDescription className="text-gray-600">
              Enter your credentials to access your Italian food store
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-cy="email-input"
                  className="h-12 border-gray-200 focus:border-shopmefy-500 focus:ring-shopmefy-500 transition-colors"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Lock className="w-4 h-4 text-gray-400" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-cy="password-input"
                  className="h-12 border-gray-200 focus:border-shopmefy-500 focus:ring-shopmefy-500 transition-colors"
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="pt-6">
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-shopmefy-500 to-shopmefy-600 hover:from-shopmefy-600 hover:to-shopmefy-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                disabled={isSubmitting}
                data-cy="login-button"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Signing in...' : 'Sign in to ShopMefy'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {/* Demo credentials info */}
        <div className="text-center mt-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-shopmefy-100 shadow-sm">
            <p className="text-sm text-gray-600 font-medium mb-2">🚀 Demo Credentials</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p><strong>Email:</strong> test@example.com</p>
                              <p><strong>Password:</strong> ShopMefy2024</p>
            </div>
            <p className="text-xs text-shopmefy-600 mt-2">Ready to explore your Italian food store!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
