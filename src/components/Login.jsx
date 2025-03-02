import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        // Navigate to the attempted url or home
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[rgb(17,17,17)]">
      <div className="bg-[rgb(23,23,23)] p-8 rounded-xl border border-stone-50/10 shadow-lg w-96">
        <h1 className="text-2xl text-white font-semibold text-center mb-8">Welcome to GPTStir</h1>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Login Failed')}
            theme="filled_black"
            size="large"
            width="100%"
            useOneTap
          />
      </div>
    </div>
  );
};

export default Login; 