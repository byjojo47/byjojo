import { Navigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) return <LoadingSpinner label={t('checkingAccount')} />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}