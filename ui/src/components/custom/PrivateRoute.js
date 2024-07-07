import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";

const PrivateRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();



  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/" replace state={{ from: location }} />;
};

export default PrivateRoute;
