import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import type { Complaint } from '@/data/mockData';

const COLORS = {
  navy: '#1a3a5c',
  saffron: '#e8751a',
  green: '#2e7d32',
  blue: '#3b82f6',
  red: '#dc2626',
  yellow: '#f59e0b',
  purple: '#7c3aed',
  teal: '#0d9488',
};

export const CategoryBarChart = ({ data }: { data: Complaint[] }) => {
  const categories = ['water', 'roads', 'health', 'sanitation', 'electricity', 'education'];
  const chartData = categories.map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    Total: data.filter(c => c.category === cat).length,
    Pending: data.filter(c => c.category === cat && c.status === 'pending').length,
    Resolved: data.filter(c => c.category === cat && c.status === 'resolved').length,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis fontSize={12} allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Total" fill={COLORS.navy} />
        <Bar dataKey="Pending" fill={COLORS.yellow} />
        <Bar dataKey="Resolved" fill={COLORS.green} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const StatusPieChart = ({ data }: { data: Complaint[] }) => {
  const statusData = [
    { name: 'Pending', value: data.filter(c => c.status === 'pending').length, color: COLORS.yellow },
    { name: 'Assigned', value: data.filter(c => c.status === 'assigned').length, color: COLORS.blue },
    { name: 'Resolved', value: data.filter(c => c.status === 'resolved').length, color: COLORS.green },
    { name: 'Escalated', value: data.filter(c => c.status === 'escalated').length, color: COLORS.red },
  ].filter(d => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
          {statusData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const DistrictComparisonChart = ({ data }: { data: Complaint[] }) => {
  const districts = ['Varanasi', 'Lucknow', 'Kanpur'];
  const chartData = districts.map(d => ({
    name: d,
    Total: data.filter(c => c.location.district === d).length,
    Pending: data.filter(c => c.location.district === d && c.status === 'pending').length,
    Escalated: data.filter(c => c.location.district === d && c.status === 'escalated').length,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis fontSize={12} allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Total" fill={COLORS.navy} />
        <Bar dataKey="Pending" fill={COLORS.saffron} />
        <Bar dataKey="Escalated" fill={COLORS.red} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const TrendAreaChart = () => {
  const trendData = [
    { month: 'Oct', Filed: 12, Resolved: 8 },
    { month: 'Nov', Filed: 18, Resolved: 14 },
    { month: 'Dec', Filed: 15, Resolved: 11 },
    { month: 'Jan', Filed: 22, Resolved: 16 },
    { month: 'Feb', Filed: 28, Resolved: 19 },
    { month: 'Mar', Filed: 24, Resolved: 15 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={trendData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" fontSize={12} />
        <YAxis fontSize={12} allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="Filed" stroke={COLORS.navy} fill={COLORS.navy} fillOpacity={0.1} />
        <Area type="monotone" dataKey="Resolved" stroke={COLORS.green} fill={COLORS.green} fillOpacity={0.1} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const PriorityPieChart = ({ data }: { data: Complaint[] }) => {
  const priorityData = [
    { name: 'Low', value: data.filter(c => c.priority === 'low').length, color: COLORS.green },
    { name: 'Medium', value: data.filter(c => c.priority === 'medium').length, color: COLORS.yellow },
    { name: 'High', value: data.filter(c => c.priority === 'high').length, color: COLORS.saffron },
    { name: 'Emergency', value: data.filter(c => c.priority === 'emergency').length, color: COLORS.red },
  ].filter(d => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={priorityData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
          {priorityData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const OfficerWorkloadChart = () => {
  const workloadData = [
    { name: 'Suresh Yadav', Assigned: 3, Resolved: 1, Pending: 2 },
    { name: 'Meena Devi', Assigned: 2, Resolved: 0, Pending: 2 },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={workloadData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" fontSize={12} allowDecimals={false} />
        <YAxis type="category" dataKey="name" fontSize={12} width={120} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Assigned" fill={COLORS.blue} />
        <Bar dataKey="Resolved" fill={COLORS.green} />
        <Bar dataKey="Pending" fill={COLORS.yellow} />
      </BarChart>
    </ResponsiveContainer>
  );
};
