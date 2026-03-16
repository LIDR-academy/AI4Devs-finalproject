import { profileApi } from '@/api/profileApi';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import PageLoader from '@/components/ui/PageLoader';
import { useAuth } from '@/contexts/AuthContext';
import { usePageTransition } from '@/hooks/usePageTransition';
import { Profile } from '@/types/dto';
import {
    ChevronDown,
    FileText,
    HelpCircle,
    Home,
    LogOut,
    Menu,
    MessageSquare,
    Server,
    Settings,
    ShoppingBag,
    User,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

const MainLayout: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const _location = useLocation();
  const { isLoading } = usePageTransition();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Function to get session colors based on current path
  const getSessionColors = (path: string) => {
    if (path.includes('/products')) {
      return {
        bg: 'from-blue-50 to-sky-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100'
      };
    } else if (path.includes('/services')) {
      return {
        bg: 'from-green-50 to-emerald-50',
        text: 'text-green-700',
        border: 'border-green-200',
        iconBg: 'bg-green-100'
      };
    } else if (path.includes('/documents')) {
      return {
        bg: 'from-red-50 to-rose-50',
        text: 'text-red-700',
        border: 'border-red-200',
        iconBg: 'bg-red-100'
      };
    } else if (path.includes('/faqs')) {
      return {
        bg: 'from-purple-50 to-fuchsia-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        iconBg: 'bg-purple-100'
      };
    } else {
      // Default colors for other pages
      return {
        bg: 'from-shopmefy-50 to-green-50',
        text: 'text-shopmefy-700',
        border: 'border-shopmefy-200',
        iconBg: 'bg-shopmefy-100'
      };
    }
  };

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await profileApi.getProfile();
        setProfile(profileData);
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    if (auth.isAuthenticated) {
      loadProfile();
    }
  }, [auth.isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const navItems = [
    { icon: <Home size={20} />, text: 'Dashboard', path: '/dashboard' },
    { icon: <ShoppingBag size={20} />, text: 'Products', path: '/products' },
    { icon: <HelpCircle size={20} />, text: 'FAQs', path: '/faqs' },
    { icon: <Server size={20} />, text: 'Services', path: '/services' },
    { icon: <FileText size={20} />, text: 'Documents', path: '/documents' },
    { icon: <MessageSquare size={20} />, text: 'AI Chatbot', path: '/chatbot' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Top navbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm py-4 px-4 sticky top-0 z-40">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-3 hover:bg-shopmefy-50" 
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              <Menu size={20} />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-shopmefy-500 to-shopmefy-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-shopmefy-600 to-green-600 bg-clip-text text-transparent">
                ShopMefy
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-shopmefy-500 to-shopmefy-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="hidden md:inline-block font-medium">
                    {profile?.companyName || auth.user?.name || auth.user?.email}
                  </span>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-lg border-0">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer py-3 hover:bg-orange-50">
                  <User size={16} className="mr-3 text-orange-600" />
                  <span className="font-medium">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/agent-config')} className="cursor-pointer py-3 hover:bg-shopmefy-50">
                  <Settings size={16} className="mr-3 text-shopmefy-600" />
                  <span className="font-medium">Agent Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-3 text-red-600 focus:text-red-600 hover:bg-red-50">
                  <LogOut size={16} className="mr-3" />
                  <span className="font-medium">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={closeMobileSidebar}
        />
      )}
      
      {/* Sidebar and content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside 
          className={`
            fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform transform border-r border-gray-200
            ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-center md:hidden mb-6">
              <h2 className="font-semibold text-lg text-shopmefy-600">Menu</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={closeMobileSidebar}
                className="hover:bg-gray-100"
              >
                <X size={18} />
              </Button>
            </div>
            
            <nav className="flex flex-col gap-2 flex-1">
              {navItems.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.path}
                  data-cy={`nav-${item.text.toLowerCase().replace(/\s+/g, '-')}`}
                  className={({ isActive }) => {
                    const colors = getSessionColors(item.path);
                    return `
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                      ${isActive 
                        ? `bg-gradient-to-r ${colors.bg} ${colors.text} border ${colors.border} shadow-sm` 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `;
                  }}
                  onClick={closeMobileSidebar}
                >
                  {({ isActive }) => {
                    const colors = getSessionColors(item.path);
                    return (
                      <>
                        <div className={`p-1 rounded-lg ${isActive ? colors.iconBg : 'bg-gray-100'}`}>
                          {item.icon}
                        </div>
                        <span>{item.text}</span>
                      </>
                    );
                  }}
                </NavLink>
              ))}
            </nav>
            
            <div className="mt-auto pt-6 border-t border-gray-100">
              <div className="text-xs text-gray-500 text-center">
                <p className="font-medium">ShopMefy Platform</p>
                <p>© {new Date().getFullYear()} ShopMefy</p>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Page Transition Loader */}
      {isLoading && <PageLoader />}
    </div>
  );
};

export default MainLayout;
