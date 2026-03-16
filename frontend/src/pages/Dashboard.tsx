import SplashModal from '@/components/dashboard/SplashModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ArrowRight,
    FileText,
    HelpCircle,
    MessageCircle,
    Package,
    Server,
    Settings,
    ShoppingBag,
    TrendingUp,
    User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { faqApi } from '../api/faqApi';
import { productApi } from '../api/productApi';
import { serviceApi } from '../api/serviceApi';
import { documentService } from '../services/documentService';

const Dashboard: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [stats, setStats] = useState({
    products: 0,
    faqs: 0,
    services: 0,
    documents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Fetch data from APIs
        const [productsResult, faqsResult, servicesResult, documentsResult] = await Promise.all([
          productApi.getProducts(),
          faqApi.getFAQs(),
          serviceApi.getServices(),
          documentService.getDocumentStats()
        ]);
        
        // Update stats
        setStats({
          products: productsResult.data.length,
          faqs: faqsResult.data.length,
          services: servicesResult.data.length,
          documents: documentsResult.totalDocuments
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-shopmefy-50 to-green-50 rounded-xl p-6 border border-shopmefy-100 animate-slide-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-shopmefy-600 rounded-lg flex items-center justify-center shadow-lg">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome to ShopMefy, your Italian food e-commerce solution.</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 animate-scale-in hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Products</CardTitle>
                <CardDescription className="text-sm text-gray-500">Total products in catalog</CardDescription>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center shadow-sm">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{stats.products}</p>
                <TrendingUp className="w-4 h-4 text-green-500 animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 animate-scale-in hover:-translate-y-1" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">FAQs</CardTitle>
                <CardDescription className="text-sm text-gray-500">Questions and answers</CardDescription>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center shadow-sm">
                <HelpCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{stats.faqs}</p>
                <MessageCircle className="w-4 h-4 text-green-500 animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 animate-scale-in hover:-translate-y-1" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Services</CardTitle>
                <CardDescription className="text-sm text-gray-500">Available delivery services</CardDescription>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center shadow-sm">
                <Server className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{stats.services}</p>
                <TrendingUp className="w-4 h-4 text-green-500 animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 animate-scale-in hover:-translate-y-1" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Documents</CardTitle>
                <CardDescription className="text-sm text-gray-500">PDF documents uploaded</CardDescription>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center shadow-sm">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{stats.documents}</p>
                <TrendingUp className="w-4 h-4 text-green-500 animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Link to="/products" className="group">
            <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold">Manage Products</CardTitle>
                <CardDescription className="text-sm">Add, edit or remove products</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button variant="ghost" className="w-full justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200">
                  Open Products <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          </Link>

          <Link to="/faqs" className="group">
            <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold">Manage FAQs</CardTitle>
                <CardDescription className="text-sm">Create and organize FAQs</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button variant="ghost" className="w-full justify-center text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200">
                  Open FAQs <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          </Link>

          <Link to="/services" className="group">
            <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:from-green-600 group-hover:to-green-700 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <Server className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold">Manage Services</CardTitle>
                <CardDescription className="text-sm">Create and manage services</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button variant="ghost" className="w-full justify-center text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200">
                  Open Services <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          </Link>

          <Link to="/documents" className="group">
            <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:from-red-600 group-hover:to-red-700 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold">Manage Documents</CardTitle>
                <CardDescription className="text-sm">Upload and organize PDF documents</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button variant="ghost" className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200">
                  Open Documents <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        </div>
      </div>

      {/* Settings */}
      <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/profile" className="group">
            <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:from-orange-600 group-hover:to-orange-700 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <User className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold">Company Profile</CardTitle>
                <CardDescription className="text-sm">Manage company information and branding</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button variant="ghost" className="w-full justify-center text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-all duration-200">
                  Edit Profile <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          </Link>

          <Link to="/agent-config" className="group">
            <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-shopmefy-500 to-shopmefy-600 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:from-shopmefy-600 group-hover:to-shopmefy-700 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold">Agent Settings</CardTitle>
                <CardDescription className="text-sm">Configure AI chatbot behavior and responses</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button variant="ghost" className="w-full justify-center text-shopmefy-600 hover:text-shopmefy-700 hover:bg-shopmefy-50 transition-all duration-200">
                  Configure Agent <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        </div>
      </div>

      {/* Splash modal for first-time visitors */}
      <SplashModal isOpen={showSplash} onClose={() => setShowSplash(false)} />
    </div>
  );
};

export default Dashboard;
