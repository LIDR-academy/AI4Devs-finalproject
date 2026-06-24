import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const push = vi.fn();
let pathname = '/';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname,
}));

import { NavigationBar } from './NavigationBar';

describe('NavigationBar', () => {
  beforeEach(() => {
    push.mockClear();
    pathname = '/';
    localStorage.clear();
  });

  it('shows Log in and Sign up when logged out', () => {
    render(<NavigationBar />);
    expect(screen.getByTestId('nav-login')).toBeInTheDocument();
    expect(screen.getByTestId('nav-register')).toBeInTheDocument();
    expect(screen.queryByTestId('nav-trips')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nav-logout')).not.toBeInTheDocument();
  });

  it('shows My Trips and Log out when logged in', () => {
    localStorage.setItem('auth_token', 'jwt');
    render(<NavigationBar />);
    expect(screen.getByTestId('nav-trips')).toBeInTheDocument();
    expect(screen.getByTestId('nav-logout')).toBeInTheDocument();
    expect(screen.queryByTestId('nav-login')).not.toBeInTheDocument();
  });

  it('logs out: clears the token and navigates home', async () => {
    const user = userEvent.setup();
    localStorage.setItem('auth_token', 'jwt');
    render(<NavigationBar />);
    await user.click(screen.getByTestId('nav-logout'));
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(push).toHaveBeenCalledWith('/');
  });

  it('marks My Trips active on /trips', () => {
    pathname = '/trips';
    localStorage.setItem('auth_token', 'jwt');
    render(<NavigationBar />);
    expect(screen.getByTestId('nav-trips')).toHaveAttribute('aria-current', 'page');
  });

  it('toggles the mobile menu', async () => {
    const user = userEvent.setup();
    render(<NavigationBar />);
    expect(screen.queryByTestId('nav-mobile-menu')).not.toBeInTheDocument();
    await user.click(screen.getByTestId('nav-mobile-toggle'));
    expect(screen.getByTestId('nav-mobile-menu')).toBeInTheDocument();
  });

  it('renders the StayHub logo in the serif editorial font', () => {
    render(<NavigationBar />);
    expect(screen.getByTestId('nav-home').className).toContain('font-serif');
  });

  it('styles the signed-out Sign up CTA with the terracotta accent', () => {
    render(<NavigationBar />);
    expect(screen.getByTestId('nav-register').className).toContain('bg-terracotta');
  });
});
