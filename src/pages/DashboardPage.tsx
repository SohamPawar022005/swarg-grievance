import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import DatabaseComplaintsDashboard from '@/components/DatabaseComplaintsDashboard';

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'local':
      return <DatabaseComplaintsDashboard supervisorLevel="local" />;
    case 'district':
      return <DatabaseComplaintsDashboard supervisorLevel="district" />;
    case 'state':
      return <DatabaseComplaintsDashboard supervisorLevel="state" />;
    case 'compliance':
      return <DatabaseComplaintsDashboard supervisorLevel="compliance" />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default DashboardPage;
