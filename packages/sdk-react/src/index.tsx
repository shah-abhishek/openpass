import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as widgetLogin, type LoginOptions } from '@openpass/sdk-js';

type User = { sub?: string; email?: string; roles?: string[]; permissions?: string[] } | null;

type AuthContextType = {
  isAuthenticated: boolean;
  user: User;
  login: (opts: LoginOptions) => Promise<void>;
};

const AuthCtx = createContext<AuthContextType>({ isAuthenticated: false, user: null, login: async ()=>{} });

export const OpenPassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  useEffect(() => {
    // TODO: call /api/me once backend wired
  }, []);
  return (
    <AuthCtx.Provider value={{ isAuthenticated: !!user, user, login: widgetLogin }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
