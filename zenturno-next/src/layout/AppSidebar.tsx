"use client";

import { useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";

// SVG Icon components
const DashboardIcon = () => (
  <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.10322 0.956299H2.53135C1.5751 0.956299 0.787598 1.7438 0.787598 2.70005V6.27192C0.787598 7.22817 1.5751 8.01567 2.53135 8.01567H6.10322C7.05947 8.01567 7.84697 7.22817 7.84697 6.27192V2.72817C7.8751 1.7438 7.0876 0.956299 6.10322 0.956299ZM6.60947 6.30005C6.60947 6.5813 6.38447 6.8063 6.10322 6.8063H2.53135C2.2501 6.8063 2.0251 6.5813 2.0251 6.30005V2.72817C2.0251 2.44692 2.2501 2.22192 2.53135 2.22192H6.10322C6.38447 2.22192 6.60947 2.44692 6.60947 2.72817V6.30005Z" fill=""></path>
    <path d="M15.4689 0.956299H11.8971C10.9408 0.956299 10.1533 1.7438 10.1533 2.70005V6.27192C10.1533 7.22817 10.9408 8.01567 11.8971 8.01567H15.4689C16.4252 8.01567 17.2127 7.22817 17.2127 6.27192V2.72817C17.2127 1.7438 16.4252 0.956299 15.4689 0.956299ZM15.9752 6.30005C15.9752 6.5813 15.7502 6.8063 15.4689 6.8063H11.8971C11.6158 6.8063 11.3908 6.5813 11.3908 6.30005V2.72817C11.3908 2.44692 11.6158 2.22192 11.8971 2.22192H15.4689C15.7502 2.22192 15.9752 2.44692 15.9752 2.72817V6.30005Z" fill=""></path>
    <path d="M6.10322 9.92822H2.53135C1.5751 9.92822 0.787598 10.7157 0.787598 11.672V15.2438C0.787598 16.2001 1.5751 16.9876 2.53135 16.9876H6.10322C7.05947 16.9876 7.84697 16.2001 7.84697 15.2438V11.7001C7.8751 10.7157 7.0876 9.92822 6.10322 9.92822ZM6.60947 15.272C6.60947 15.5532 6.38447 15.7782 6.10322 15.7782H2.53135C2.2501 15.7782 2.0251 15.5532 2.0251 15.272V11.7001C2.0251 11.4188 2.2501 11.1938 2.53135 11.1938H6.10322C6.38447 11.1938 6.60947 11.4188 6.60947 11.7001V15.272Z" fill=""></path>
    <path d="M15.4689 9.92822H11.8971C10.9408 9.92822 10.1533 10.7157 10.1533 11.672V15.2438C10.1533 16.2001 10.9408 16.9876 11.8971 16.9876H15.4689C16.4252 16.9876 17.2127 16.2001 17.2127 15.2438V11.7001C17.2127 10.7157 16.4252 9.92822 15.4689 9.92822ZM15.9752 15.272C15.9752 15.5532 15.7502 15.7782 15.4689 15.7782H11.8971C11.6158 15.7782 11.3908 15.5532 11.3908 15.272V11.7001C11.3908 11.4188 11.6158 11.1938 11.8971 11.1938H15.4689C15.7502 11.1938 15.9752 11.4188 15.9752 11.7001V15.272Z" fill=""></path>
  </svg>
);

const ProfileIcon = () => (
  <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.0002 7.79065C11.0814 7.79065 12.7689 6.1594 12.7689 4.1344C12.7689 2.1094 11.0814 0.478149 9.0002 0.478149C6.91895 0.478149 5.23145 2.1094 5.23145 4.1344C5.23145 6.1594 6.91895 7.79065 9.0002 7.79065ZM9.0002 1.7719C10.3783 1.7719 11.5033 2.84065 11.5033 4.16252C11.5033 5.4844 10.3783 6.55315 9.0002 6.55315C7.62207 6.55315 6.49707 5.4844 6.49707 4.16252C6.49707 2.84065 7.62207 1.7719 9.0002 1.7719Z" fill=""></path>
    <path d="M10.8283 9.05627H7.17207C4.16269 9.05627 1.71582 11.5313 1.71582 14.5406V16.875C1.71582 17.2125 1.99707 17.5219 2.3627 17.5219C2.72832 17.5219 3.00957 17.2407 3.00957 16.875V14.5406C3.00957 12.2344 4.89394 10.3219 7.22832 10.3219H10.8564C13.1627 10.3219 15.0752 12.2063 15.0752 14.5406V16.875C15.0752 17.2125 15.3564 17.5219 15.7221 17.5219C16.0877 17.5219 16.3689 17.2407 16.3689 16.875V14.5406C16.2846 11.5313 13.8377 9.05627 10.8283 9.05627Z" fill=""></path>
  </svg>
);

const AppointmentsIcon = () => (
  <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.7501 2.9812H14.2879V2.36245C14.2879 2.02495 14.0066 1.71558 13.6691 1.71558C13.3316 1.71558 13.0504 1.99683 13.0504 2.36245V2.9812H4.94973V2.36245C4.94973 2.02495 4.66848 1.71558 4.33098 1.71558C3.99348 1.71558 3.71223 1.99683 3.71223 2.36245V2.9812H2.2499C1.29365 2.9812 0.478149 3.7687 0.478149 4.75308V14.5406C0.478149 15.4968 1.26553 16.3125 2.2499 16.3125H15.7501C16.7063 16.3125 17.5219 15.525 17.5219 14.5406V4.72495C17.5219 3.7687 16.7063 2.9812 15.7501 2.9812ZM1.71553 8.21245H4.33098V11.039H1.71553V8.21245ZM5.56848 8.21245H8.40036V11.039H5.56848V8.21245ZM8.40036 12.2765V15.0765H5.56848V12.2765H8.40036ZM9.63786 12.2765H12.4697V15.0765H9.63786V12.2765ZM9.63786 11.039V8.21245H12.4697V11.039H9.63786ZM13.7072 8.21245H16.2563V11.039H13.7072V8.21245ZM2.2499 4.21558H3.71223V4.83433C3.71223 5.17183 3.99348 5.48433 4.33098 5.48433C4.66848 5.48433 4.94973 5.20308 4.94973 4.83433V4.21558H13.0504V4.83433C13.0504 5.17183 13.3316 5.48433 13.6691 5.48433C14.0066 5.48433 14.2879 5.20308 14.2879 4.83433V4.21558H15.7501C16.0313 4.21558 16.2563 4.44058 16.2563 4.72183V7.00308H1.71553V4.72183C1.71553 4.44058 1.94053 4.21558 2.2499 4.21558ZM1.71553 12.2765H4.33098V15.0765H2.2499C1.96865 15.0765 1.74365 14.8515 1.74365 14.5703V12.2765H1.71553ZM15.7501 15.0765H13.7072V12.2765H16.2563V14.5703C16.2563 14.8515 16.0313 15.0765 15.7501 15.0765Z" fill=""></path>
  </svg>
);

const ServicesIcon = () => (
  <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.7812 0.478149H1.21875C0.6 0.478149 0.0937505 0.984399 0.0937505 1.60315V6.3094C0.0937505 6.9281 0.6 7.4344 1.21875 7.4344H16.7812C17.4 7.4344 17.9062 6.9281 17.9062 6.3094V1.60315C17.9062 0.984399 17.4 0.478149 16.7812 0.478149ZM16.5938 6.1094H1.40625V1.80315H16.5938V6.1094Z" fill=""></path>
    <path d="M16.7812 9.67504H1.21875C0.6 9.67504 0.0937505 10.1813 0.0937505 10.8V15.5063C0.0937505 16.125 0.6 16.6313 1.21875 16.6313H16.7812C17.4 16.6313 17.9062 16.125 17.9062 15.5063V10.8C17.9062 10.1813 17.4 9.67504 16.7812 9.67504ZM16.5938 15.3063H1.40625V11.0063H16.5938V15.3063Z" fill=""></path>
  </svg>
);

const UsersIcon = () => (
  <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.0002 7.79065C11.0814 7.79065 12.7689 6.1594 12.7689 4.1344C12.7689 2.1094 11.0814 0.478149 9.0002 0.478149C6.91895 0.478149 5.23145 2.1094 5.23145 4.1344C5.23145 6.1594 6.91895 7.79065 9.0002 7.79065ZM9.0002 1.7719C10.3783 1.7719 11.5033 2.84065 11.5033 4.16252C11.5033 5.4844 10.3783 6.55315 9.0002 6.55315C7.62207 6.55315 6.49707 5.4844 6.49707 4.16252C6.49707 2.84065 7.62207 1.7719 9.0002 1.7719Z" fill=""></path>
    <path d="M10.8283 9.05627H7.17207C4.16269 9.05627 1.71582 11.5313 1.71582 14.5406V16.875C1.71582 17.2125 1.99707 17.5219 2.3627 17.5219C2.72832 17.5219 3.00957 17.2407 3.00957 16.875V14.5406C3.00957 12.2344 4.89394 10.3219 7.22832 10.3219H10.8564C13.1627 10.3219 15.0752 12.2063 15.0752 14.5406V16.875C15.0752 17.2125 15.3564 17.5219 15.7221 17.5219C16.0877 17.5219 16.3689 17.2407 16.3689 16.875V14.5406C16.2846 11.5313 13.8377 9.05627 10.8283 9.05627Z" fill=""></path>
  </svg>
);

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, setIsHovered, toggleSubmenu, openSubmenu, activeItem, setActiveItem } = useSidebar();
  const { role } = useAuth();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);
  
  // Navigation items based on user role
  const navItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      path: "/dashboard",
      icon: <DashboardIcon />,
      roles: ['admin', 'client', 'professional'],
    },
    {
      id: "profile",
      title: "My Profile",
      path: "/dashboard/profile",
      icon: <ProfileIcon />,
      roles: ['admin', 'client', 'professional'],
    },
    {
      id: "appointments",
      title: "Appointments",
      path: "/dashboard/appointments",
      icon: <AppointmentsIcon />,
      roles: ['admin', 'client', 'professional'],
    },
    {
      id: "services",
      title: "Services",
      path: "/services",
      icon: <ServicesIcon />,
      roles: ['admin'],
    },
    {
      id: "users",
      title: "Users",
      path: "/users",
      icon: <UsersIcon />,
      roles: ['admin'],
    },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = useMemo(() => {
    return navItems.filter((item) => role && item.roles.includes(role));
  }, [role, navItems]);

  // Set active menu item based on current path
  useEffect(() => {
    // Find the navigation item that best matches the current path
    const matchingItem = filteredNavItems
      .filter(item => pathname.startsWith(item.path))
      .sort((a, b) => b.path.length - a.path.length)[0];
    
    if (matchingItem) {
      setActiveItem(matchingItem.id);
    } else {
      // Fallback to dashboard if no match found
      setActiveItem("dashboard");
    }
  }, [pathname, setActiveItem, filteredNavItems]);

  // Navigation items are defined above and filtered by user role

  return (
    <aside
      ref={sidebarRef}
      className={`absolute left-0 top-0 z-50 flex h-screen w-[290px] flex-col overflow-y-hidden bg-black duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isExpanded ? "w-[290px]" : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sidebar header with logo */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <Link href="/dashboard">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">ZenTurno</span>
          </div>
        </Link>
      </div>

      {/* Sidebar menu */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-in-out">
        <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
          <div>
            <h3 className="mb-4 ml-4 text-sm font-medium text-gray-400">MENU</h3>
            <ul className="mb-6 flex flex-col gap-1.5">
              {filteredNavItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium duration-300 ease-in-out hover:bg-primary ${
                      activeItem === item.id ? "bg-primary text-white" : "text-gray-300"
                    }`}
                    onClick={() => setActiveItem(item.id)}
                  >
                    <span className="text-white">{item.icon}</span>
                    <span className={`whitespace-nowrap ${!isExpanded && "lg:hidden"}`}>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
}
