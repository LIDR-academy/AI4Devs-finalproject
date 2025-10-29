import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Protected } from './auth/Protected';
import Home from './pages/Home';
import Trips from './pages/Trips';
import Matches from './pages/Matches';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import { History } from './pages/History';
import { TrustProfilePage } from './pages/TrustProfile';
import Callback from './pages/Callback';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/callback" element={<Callback />} />
        <Route
          path="/trips"
          element={
            <Protected>
              <Trips />
            </Protected>
          }
        />
        <Route
          path="/matches"
          element={
            <Protected>
              <Matches />
            </Protected>
          }
        />
        <Route
          path="/bookings"
          element={
            <Protected>
              <Bookings />
            </Protected>
          }
        />
        <Route
          path="/me"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />
        <Route
          path="/history"
          element={
            <Protected>
              <History />
            </Protected>
          }
        />
        <Route
          path="/trust/:userId"
          element={
            <Protected>
              <TrustProfilePage />
            </Protected>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default App;

