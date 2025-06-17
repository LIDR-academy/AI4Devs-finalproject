import Link from 'next/link';
import { useState } from 'react';

interface TailAdminHeaderProps {
  transparent?: boolean;
}

const TailAdminHeader = ({ transparent = false }: TailAdminHeaderProps) => {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={`header left-0 top-0 z-40 flex w-full items-center ${
        transparent
          ? 'bg-transparent'
          : 'bg-white shadow-md'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="header-logo block"
            >
              <div className="flex items-center">
                <svg 
                  className="h-8 w-8 mr-2" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" 
                    fill="currentColor" 
                    className="text-primary-600"
                  />
                </svg>
                <span className="text-xl font-bold text-primary-600">ZenTurno</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => setOpen(!open)}
                id="navbarToggler"
                className={`block rounded-lg px-3 py-2 ring-primary focus:ring-2 lg:hidden ${
                  open && 'navbarTogglerActive'
                }`}
              >
                <span className="relative my-[6px] block h-[2px] w-[30px] bg-black"></span>
                <span className="relative my-[6px] block h-[2px] w-[30px] bg-black"></span>
                <span className="relative my-[6px] block h-[2px] w-[30px] bg-black"></span>
              </button>
              <nav
                className={`absolute right-4 top-16 z-50 w-full max-w-[250px] rounded-lg bg-white px-6 py-5 shadow lg:static lg:block lg:w-full lg:max-w-full lg:shadow-none ${
                  !open && 'hidden'
                }`}
              >
                <ul className="block lg:flex">
                  <ListItem NavLink="/">Home</ListItem>
                  <ListItem NavLink="/#features">Features</ListItem>
                  <ListItem NavLink="/#contact">Contact</ListItem>
                </ul>
              </nav>
            </div>
            <div className="hidden justify-end sm:flex">
              <Link
                href="/login"
                className="px-7 py-3 text-base font-medium text-dark hover:text-primary"
              >
                Sign In
              </Link>

              <Link
                href="/signup"
                className="rounded-md bg-primary-600 px-7 py-3 text-base font-medium text-white hover:bg-opacity-90"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const ListItem = ({ children, NavLink }: { children: React.ReactNode; NavLink: string }) => {
  return (
    <li>
      <Link
        href={NavLink}
        className="flex py-2 text-base font-medium text-dark hover:text-primary lg:ml-8 lg:inline-flex"
      >
        {children}
      </Link>
    </li>
  );
};

export default TailAdminHeader;
