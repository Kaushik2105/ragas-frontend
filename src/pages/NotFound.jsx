import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const NotFound = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return null;
};

export default NotFound;
