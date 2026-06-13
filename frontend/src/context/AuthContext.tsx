"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export const API_URL = 'http://localhost:5000/api';

// Create axios instance with default configurations
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface UserProfile {
  skills: string[];
  targetRole: string;
  experience: Array<{
    _id?: string;
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    _id?: string;
    school: string;
    degree: string;
    fieldOfStudy: string;
    year: string;
  }>;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profile: UserProfile;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<UserProfile> & { password?: string }) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadStoredUser = async () => {
      const storedToken = localStorage.getItem('careerai_token');
      if (storedToken) {
        setToken(storedToken);
        // Set default auth header for axios
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error("Auth me check failed:", error);
          localStorage.removeItem('careerai_token');
          setUser(null);
          setToken(null);
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    loadStoredUser();
  }, []);

  // Axios interceptor for handling 401s globally
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('careerai_token');
          setUser(null);
          setToken(null);
          delete api.defaults.headers.common['Authorization'];
          router.push('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [router]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: userToken, ...userData } = response.data;
      
      localStorage.setItem('careerai_token', userToken);
      setToken(userToken);
      setUser(response.data);
      api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      
      // Fetch full user profile
      const userMe = await api.get('/auth/me');
      setUser(userMe.data);
      
      router.push('/dashboard');
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.response?.data?.message || 'Login failed. Please check credentials.');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token: userToken } = response.data;
      
      localStorage.setItem('careerai_token', userToken);
      setToken(userToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      
      // Fetch full user profile
      const userMe = await api.get('/auth/me');
      setUser(userMe.data);
      
      router.push('/dashboard');
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.response?.data?.message || 'Registration failed.');
    }
  };

  const logout = () => {
    localStorage.removeItem('careerai_token');
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    router.push('/');
  };

  const updateProfile = async (profileData: Partial<UserProfile> & { password?: string }) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      setUser(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile.');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
