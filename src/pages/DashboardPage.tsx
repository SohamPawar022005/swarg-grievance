import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import LocalDashboard from '@/components/dashboards/LocalDashboard';
import DistrictDashboard from '@/components/dashboards/DistrictDashboard';
import StateDashboard from '@/components/dashboards/StateDashboard';
import ComplianceDashboard from '@/components/dashboards/ComplianceDashboard';

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'local':
      return <LocalDashboard />;
    case 'district':
      return <DistrictDashboard />;
    case 'state':
      return <StateDashboard />;
    case 'compliance':
      return <ComplianceDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default DashboardPage;
