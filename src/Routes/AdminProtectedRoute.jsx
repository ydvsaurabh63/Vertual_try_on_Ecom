import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminStore } from '../store/useAdminStore';
import Loader from '../Components/Admin/Loader';

export const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, adminUser, checkTokenValidity } = useAdminStore();
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verify = async () => {
      await checkTokenValidity();
      setChecking(false);
    };
    verify();
  }, [checkTokenValidity]);

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader message="Verifying admin credentials..." />
      </div>
    );
  }

  if (!isAuthenticated || adminUser?.role !== 'admin') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;
