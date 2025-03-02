import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';

const App = () => {
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return <div>Error: Google Client ID not configured</div>;
  }

  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
};

export default App;