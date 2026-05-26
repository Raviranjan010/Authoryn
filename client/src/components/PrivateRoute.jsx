import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const PrivateRoute = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-6 h-6 border-t-2 border-r-2 border-[#111111] animate-spin"></div>
          <div className="text-xs font-semibold uppercase tracking-widest text-[#111111]">
            Loading Authoryn
          </div>
        </div>
      </div>
    );
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
