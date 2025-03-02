import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        // Navigate to the attempted url or home
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      if (error.name === 'AbortError') {
        setError('Login request timed out. Please try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-[100dvh] bg-[rgb(17,17,17)]">
      <div className="flex flex-col items-center justify-center bg-[rgb(23,23,23)] p-8 sm:p-16 sm:px-30 rounded-xl border border-stone-50/10">
        <h1 className="text-2xl text-white font-semibold text-center mb-8">Welcome to GPTStir</h1>
        
        {error && (
          <div className="text-red-500 mb-4 text-center">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="text-white text-center">
            Logging in...
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.log('Login Failed');
              setError('Google login failed. Please try again.');
            }}
            theme="filled_black"
            size="large"
            width="100%"
            useOneTap
          />
        )}
      </div>
    </div>
  );
};

export default Login; 