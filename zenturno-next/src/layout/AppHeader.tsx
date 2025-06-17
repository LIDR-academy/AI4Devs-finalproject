"use client";

import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState } from "react";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";

export default function AppHeader() {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { userProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-30 flex w-full bg-white border-b border-gray-200">
      <div className="flex items-center justify-between w-full px-4 py-4 shadow-sm md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* Mobile hamburger button */}
          <button
            onClick={toggleMobileSidebar}
            aria-controls="sidebar"
            className="z-50 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="absolute right-0 w-full h-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out ${
                    !mobileMenuOpen && "!w-full delay-300"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out ${
                    !mobileMenuOpen && "!w-full delay-400"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out ${
                    !mobileMenuOpen && "!w-full delay-500"
                  }`}
                ></span>
              </span>
              <span className="absolute right-0 w-full h-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out ${
                    mobileMenuOpen && "!h-full delay-[0]"
                  }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out ${
                    mobileMenuOpen && "!h-0.5 delay-200"
                  }`}
                ></span>
              </span>
            </span>
          </button>
          {/* Logo for mobile */}
          <Link href="/dashboard" className="flex-shrink-0 text-xl font-bold">
            ZenTurno
          </Link>
        </div>

        <div className="hidden sm:block">
          <div className="relative">
            {/* Desktop search - can be implemented later */}
          </div>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          {/* Notification dropdown */}
          <NotificationDropdown />
          
          {/* User dropdown */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
