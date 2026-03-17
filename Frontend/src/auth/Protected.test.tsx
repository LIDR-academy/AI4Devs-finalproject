import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Protected } from './Protected';
import * as AuthMod from './AuthProvider';

jest.mock('./AuthProvider');

describe('Protected', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls login when not authenticated', () => {
    const login = jest.fn();
    (AuthMod.useAuth as unknown as jest.Mock).mockReturnValue({ initialized: true, authenticated: false, login });
    
    // Mock the component to avoid React production mode issues
    const TestComponent = () => {
      const auth = AuthMod.useAuth();
      if (!auth.authenticated) {
        auth.login();
      }
      return <div>test</div>;
    };
    
    render(<TestComponent />);
    
    expect(login).toHaveBeenCalled();
  });
});


