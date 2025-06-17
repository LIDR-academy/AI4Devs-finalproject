"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useAuth } from "@/context/AuthContext";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { userProfile, signOut, session } = useAuth();
  const router = useRouter();

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown} 
        className="flex items-center text-gray-700 dropdown-toggle"
      >
        <div className="flex items-center justify-center w-11 h-11 overflow-hidden rounded-full bg-primary text-white">
          {userProfile?.first_name?.[0]?.toUpperCase() || userProfile?.last_name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'U'}
        </div>

        <span className="hidden mr-1 font-medium text-sm ml-3 lg:block">
          {(userProfile?.first_name && userProfile?.last_name)
            ? `${userProfile.first_name} ${userProfile.last_name}`
            : userProfile?.first_name || userProfile?.last_name || session?.user?.email?.split('@')[0] || 'User'}
        </span>

        <svg
          className={`stroke-gray-500 transition-transform duration-200 hidden lg:block ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="mt-4 w-[260px] flex flex-col rounded-xl p-3"
      >
        <div>
          <span className="block font-medium text-gray-800 text-sm">
            {(userProfile?.first_name && userProfile?.last_name)
              ? `${userProfile.first_name} ${userProfile.last_name}`
              : userProfile?.first_name || userProfile?.last_name || session?.user?.email?.split('@')[0] || 'User'}
          </span>
          <span className="mt-0.5 block text-xs text-gray-500">
            {userProfile?.email || session?.user?.email || 'user@example.com'}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200">
          <li>
            <DropdownItem
              onItemClick={() => {
                closeDropdown();
                router.push('/dashboard/profile');
              }}
              href="/dashboard/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-sm hover:bg-gray-100 hover:text-gray-700"
            >
              <svg
                className="fill-gray-500 group-hover:fill-gray-700"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z"
                  fill="currentColor"
                />
              </svg>
              My Profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-sm hover:bg-gray-100 hover:text-gray-700"
            >
              <svg
                className="fill-gray-500 group-hover:fill-gray-700"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M11.9999 2.75C11.5857 2.75 11.2499 3.08579 11.2499 3.5V4.33856C9.28161 4.61066 7.61066 5.78078 6.65092 7.43631L5.89979 7.06207C5.52514 6.87582 5.07017 7.02064 4.88392 7.39529C4.69767 7.76994 4.84249 8.22491 5.21714 8.41116L5.96827 8.7854C5.67391 9.55284 5.51442 10.3887 5.51442 11.2591C5.51442 12.1295 5.67391 12.9654 5.96827 13.7328L5.21714 14.107C4.84249 14.2933 4.69767 14.7483 4.88392 15.1229C5.07017 15.4976 5.52514 15.6424 5.89979 15.4561L6.65092 15.0819C7.61066 16.7374 9.28161 17.9075 11.2499 18.1796V19.018C11.2499 19.4323 11.5857 19.768 11.9999 19.768C12.4142 19.768 12.7499 19.4323 12.7499 19.018V18.1796C14.7182 17.9075 16.3892 16.7374 17.3489 15.0819L18.1 15.4561C18.4747 15.6424 18.9297 15.4976 19.1159 15.1229C19.3022 14.7483 19.1573 14.2933 18.7827 14.107L18.0316 13.7328C18.3259 12.9654 18.4854 12.1295 18.4854 11.2591C18.4854 10.3887 18.3259 9.55284 18.0316 8.7854L18.7827 8.41116C19.1573 8.22491 19.3022 7.76994 19.1159 7.39529C18.9297 7.02064 18.4747 6.87582 18.1 7.06207L17.3489 7.43631C16.3892 5.78078 14.7182 4.61066 12.7499 4.33856V3.5C12.7499 3.08579 12.4142 2.75 11.9999 2.75ZM11.9999 6C9.23849 6 6.99994 8.23858 6.99994 11C6.99994 13.7614 9.23849 16 11.9999 16C14.7614 16 16.9999 13.7614 16.9999 11C16.9999 8.23858 14.7614 6 11.9999 6ZM11.9999 7.5C13.933 7.5 15.4999 9.067 15.4999 11C15.4999 12.933 13.933 14.5 11.9999 14.5C10.0669 14.5 8.49994 12.933 8.49994 11C8.49994 9.067 10.0669 7.5 11.9999 7.5Z"
                  fill="currentColor"
                />
              </svg>
              Account Settings
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              href="/dashboard/support"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-sm hover:bg-gray-100 hover:text-gray-700"
            >
              <svg
                className="fill-gray-500 group-hover:fill-gray-700"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12ZM12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM11.0991 7.52507C11.0991 8.02213 11.5021 8.42507 11.9991 8.42507H12.0001C12.4972 8.42507 12.9001 8.02213 12.9001 7.52507C12.9001 7.02802 12.4972 6.62507 12.0001 6.62507H11.9991C11.5021 6.62507 11.0991 7.02802 11.0991 7.52507ZM12.0001 17.3714C11.5859 17.3714 11.2501 17.0356 11.2501 16.6214V10.9449C11.2501 10.5307 11.5859 10.1949 12.0001 10.1949C12.4143 10.1949 12.7501 10.5307 12.7501 10.9449V16.6214C12.7501 17.0356 12.4143 17.3714 12.0001 17.3714Z"
                  fill="currentColor"
                />
              </svg>
              Support
            </DropdownItem>
          </li>
        </ul>
        <button
          onClick={async () => {
            try {
              closeDropdown();
              await signOut();
              // No need for router.push here as signOut already handles redirection
            } catch (error) {
              console.error('Error signing out:', error);
            }
          }}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-sm hover:bg-gray-100 hover:text-gray-700"
        >
          <svg
            className="fill-gray-500 group-hover:fill-gray-700"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
              fill="currentColor"
            />
          </svg>
          Sign Out
        </button>
      </Dropdown>
    </div>
  );
}
