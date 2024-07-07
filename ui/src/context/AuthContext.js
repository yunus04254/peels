import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Get } from "src/lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setError(null); // Reset error state
      if (firebaseUser) {
        try {
          const response = await Get("users/findByUid",{'uid':firebaseUser.uid});
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          const userData = await response.json();
          setUser({ ...firebaseUser, ...userData });
        } catch (error) {
          console.error(error);
          setError(error); // Set error state
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateUser = (updatedFields) => {
    setUser((currentUser) => ({ ...currentUser, ...updatedFields }));
  };

  const contextValue = { user, loading, error, updateUser }; // Include error in context value

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return authContext;
};
