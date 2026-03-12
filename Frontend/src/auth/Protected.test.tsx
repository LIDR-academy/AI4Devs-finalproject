import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Protected } from './Protected';
import * as AuthMod from './AuthProvider';

jest.mock('./AuthProvider');

describe('Protected', () => {
  it('calls login when not authenticated', () => {
    const login = jest.fn();
    (AuthMod.useAuth as unknown as jest.Mock).mockReturnValue({ initialized: true, authenticated: false, login });
    render(
      <MemoryRouter>
        <Protected>
          <div>secret</div>
        </Protected>
      </MemoryRouter>
    );
    expect(login).toHaveBeenCalled();
  });
});


