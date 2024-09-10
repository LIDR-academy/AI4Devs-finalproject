import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const Header: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  return (
    <header>
      <h1>IkiGoo</h1>
      {isAuthenticated ? (
        <p>Welcome, {user?.username}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </header>
  );
};

export default Header;