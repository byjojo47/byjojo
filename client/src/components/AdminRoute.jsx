import { Navigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) return <LoadingSpinner label={t('checkingAdminAccess')} />;
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />;

  return children;
}