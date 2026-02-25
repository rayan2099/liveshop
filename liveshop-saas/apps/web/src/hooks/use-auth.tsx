'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, userApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      console.log('[useAuth] Fetching user...');
      const response = await authApi.me();
      console.log('[useAuth] User fetched:', response.data.data.user);
      setUser(response.data.data.user);
    } catch (error: any) {
      console.error('[useAuth] Fetch user failed:', error.response?.data || error.message);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    const { user, tokens } = response.data.data;

    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);

    setUser(user);

    // Redirect based on role
    redirectBasedOnRole(user.role);
  };

  const register = async (data: RegisterData) => {
    const response = await authApi.register(data);
    const { user, tokens } = response.data.data;

    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);

    setUser(user);
    redirectBasedOnRole(user.role);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch (error) {
        // Ignore error
      }
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/login');
  };

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case 'store_owner':
      case 'store_staff':
        router.push('/dashboard');
        break;
      case 'driver':
        router.push('/driver');
        break;
      case 'admin':
      case 'super_admin':
        router.push('/admin');
        break;
      default:
        router.push('/');
    }
  };

  const refetchUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected route wrapper
export function ProtectedRoute({
  children,
  allowedRoles = []
}: {
  children: ReactNode;
  allowedRoles?: string[];
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }

    if (!isLoading && isAuthenticated && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user?.role || '')) {
        router.push('/unauthorized');
      }
    }
  }, [isLoading, isAuthenticated, user, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-void">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink mb-4"></div>
        <p className="text-white/60 animate-pulse font-medium">Verifying your session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role || '')) {
    return null;
  }

  return <>{children}</>;
}
