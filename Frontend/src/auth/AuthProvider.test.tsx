import React from 'react';
import { render, screen, act } from '@testing-library/react';

// Mock env redirect URI implicitly via window.location
Object.defineProperty(window, 'location', {
  value: { origin: 'http://localhost:3000' },
});

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  // Flush and clear any scheduled intervals from AuthProvider
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  jest.clearAllMocks();
});

describe('AuthProvider', () => {
  const setupProvider = async () => {
    const mod = await import('./AuthProvider');
    const { AuthProvider, useAuth } = mod;
    function TestProbe() {
      const { initialized, authenticated, token, login, logout } = useAuth();
      return (
        <div>
          <span data-testid="initialized">{String(initialized)}</span>
          <span data-testid="authenticated">{String(authenticated)}</span>
          <span data-testid="token">{token ?? ''}</span>
          <button onClick={login}>login</button>
          <button onClick={logout}>logout</button>
        </div>
      );
    }
    return { AuthProvider, TestProbe };
  };

  it.skip('initializes with Keycloak, sets auth state and refreshes token', async () => {
    const updateToken = jest.fn().mockResolvedValue(true);
    const init = jest.fn().mockResolvedValue(true);
    const login = jest.fn();
    const logout = jest.fn();

    jest.doMock('./keycloak', () => ({
      getKeycloak: () => ({
        init,
        updateToken,
        login,
        logout,
        token: 't1',
      }),
    }));
    // Re-require after mocking
    const { AuthProvider: Provider, TestProbe } = await setupProvider();

    await act(async () => {
      render(
        <Provider>
          <TestProbe />
        </Provider>
      );
    });

    expect(await screen.findByTestId('initialized')).toHaveTextContent('true');
    expect(await screen.findByTestId('authenticated')).toHaveTextContent('true');
    expect(await screen.findByTestId('token')).toHaveTextContent('t1');

    // advance timers to trigger scheduled refresh (~30s)
    await act(async () => {
      jest.advanceTimersByTime(31000);
    });
    expect(updateToken).toHaveBeenCalled();
  });

  it.skip('login/logout delegate to keycloak methods', async () => {
    const updateToken = jest.fn().mockResolvedValue(false);
    const init = jest.fn().mockResolvedValue(true);
    const login = jest.fn();
    const logout = jest.fn();

    jest.doMock('./keycloak', () => ({
      getKeycloak: () => ({
        init,
        updateToken,
        login,
        logout,
        token: 't1',
      }),
    }));
    const mod = await import('./AuthProvider');
    const { AuthProvider: Provider, useAuth: useAuthHook } = mod;
    function Buttons() {
      const { login: doLogin, logout: doLogout } = useAuthHook();
      return (
        <>
          <button onClick={doLogin}>login</button>
          <button onClick={doLogout}>logout</button>
        </>
      );
    }

    await act(async () => {
      render(
        <Provider>
          <Buttons />
        </Provider>
      );
    });
    // wait a microtask to allow provider init promise
    await act(async () => {});

    await act(async () => {
      screen.getByText('login').click();
    });
    
    await act(async () => {
      screen.getByText('logout').click();
    });
    
    expect(login).toHaveBeenCalled();
    expect(logout).toHaveBeenCalled();
  });
});


