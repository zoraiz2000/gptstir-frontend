import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        // Verify token with backend
        const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.valid) {
            setUser(JSON.parse(userData));
          } else {
            // Token invalid, clear everything
            await logout();
          }
        } else {
          await logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear all auth-related data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      // Navigate to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle OAuth callback
  const handleOAuthCallback = async (provider, code) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/${provider}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('OAuth callback failed:', error);
      navigate('/login', { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[rgb(17,17,17)]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, handleOAuthCallback }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 