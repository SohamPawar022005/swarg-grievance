// ---- USERS & ROLES ----
export interface User {
  id: string;
  name: string;
  role: 'citizen' | 'local' | 'district' | 'state' | 'compliance';
  phone: string;
  location: string;
  department?: string;
  ward?: string;
  district?: string;
  complianceRole?: 'audit' | 'vigilance' | 'legal';
}

export const users: User[] = [
  { id: 'C001', name: 'Rajesh Kumar', role: 'citizen', phone: '9876543210', location: 'Ward 5, Varanasi' },
  { id: 'C002', name: 'Priya Sharma', role: 'citizen', phone: '9876543211', location: 'Ward 12, Lucknow' },
  { id: 'C003', name: 'Amit Verma', role: 'citizen', phone: '9876543212', location: 'Ward 3, Kanpur' },
  { id: 'L001', name: 'Suresh Yadav', role: 'local', phone: '9800000001', location: 'Ward 5, Varanasi', ward: 'Ward 5', department: 'Water Supply' },
  { id: 'L002', name: 'Meena Devi', role: 'local', phone: '9800000002', location: 'Ward 12, Lucknow', ward: 'Ward 12', department: 'Roads & Infrastructure' },
  { id: 'D001', name: 'Dr. R.K. Singh', role: 'district', phone: '9700000001', location: 'Varanasi', district: 'Varanasi', department: 'Public Works' },
  { id: 'D002', name: 'Smt. Kavita Mishra', role: 'district', phone: '9700000002', location: 'Lucknow', district: 'Lucknow', department: 'Health' },
  { id: 'S001', name: 'Shri A.K. Pandey (IAS)', role: 'state', phone: '9600000001', location: 'Lucknow', department: 'Urban Development' },
  { id: 'S002', name: 'Shri B.N. Gupta (IAS)', role: 'state', phone: '9600000002', location: 'Lucknow', department: 'Public Health' },
  { id: 'CO001', name: 'Shri V.K. Tripathi', role: 'compliance', phone: '9500000001', location: 'Lucknow', complianceRole: 'audit' },
  { id: 'CO002', name: 'Smt. Nandini Rao', role: 'compliance', phone: '9500000002', location: 'Lucknow', complianceRole: 'vigilance' },
  { id: 'CO003', name: 'Shri P.S. Chauhan', role: 'compliance', phone: '9500000003', location: 'Lucknow', complianceRole: 'legal' },
];

// ---- COMPLAINTS ----
export type Priority = 'low' | 'medium' | 'high' | 'emergency';
export type Status = 'pending' | 'assigned' | 'resolved' | 'escalated';
export type Level = 'local' | 'district' | 'state' | 'compliance';
export type Category = 'water' | 'roads' | 'health' | 'sanitation' | 'electricity' | 'education';

export interface EscalationEntry {
  from: Level;
  to: Level;
  timestamp: string;
  reason: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: Category;
  location: { area: string; district: string; state: string };
  priority: Priority;
  status: Status;
  currentLevel: Level;
  assignedTo: string;
  citizenId: string;
  createdAt: string;
  slaDeadline: string;
  escalationHistory: EscalationEntry[];
}

export const complaints: Complaint[] = [
  {
    id: 'GRV-2025-001',
    title: 'Water supply disruption in Ward 5',
    description: 'No water supply for 3 days in Sector B, Ward 5.',
    category: 'water',
    location: { area: 'Ward 5, Sector B', district: 'Varanasi', state: 'Uttar Pradesh' },
    priority: 'high',
    status: 'assigned',
    currentLevel: 'local',
    assignedTo: 'L001',
    citizenId: 'C001',
    createdAt: '2025-03-20T09:00:00Z',
    slaDeadline: '2025-03-23T09:00:00Z',
    escalationHistory: [],
  },
  {
    id: 'GRV-2025-002',
    title: 'Pothole on main road near market',
    description: 'Large pothole causing accidents near Aminabad market.',
    category: 'roads',
    location: { area: 'Aminabad', district: 'Lucknow', state: 'Uttar Pradesh' },
    priority: 'medium',
    status: 'escalated',
    currentLevel: 'district',
    assignedTo: 'D002',
    citizenId: 'C002',
    createdAt: '2025-03-15T11:30:00Z',
    slaDeadline: '2025-03-20T11:30:00Z',
    escalationHistory: [
      { from: 'local', to: 'district', timestamp: '2025-03-18T14:00:00Z', reason: 'SLA breach - no action taken at local level' },
    ],
  },
  {
    id: 'GRV-2025-003',
    title: 'Dengue outbreak in Ward 12',
    description: 'Multiple dengue cases reported. Fogging not done.',
    category: 'health',
    location: { area: 'Ward 12', district: 'Lucknow', state: 'Uttar Pradesh' },
    priority: 'emergency',
    status: 'escalated',
    currentLevel: 'state',
    assignedTo: 'S002',
    citizenId: 'C002',
    createdAt: '2025-03-10T08:00:00Z',
    slaDeadline: '2025-03-12T08:00:00Z',
    escalationHistory: [
      { from: 'local', to: 'district', timestamp: '2025-03-11T10:00:00Z', reason: 'Health emergency - immediate escalation' },
      { from: 'district', to: 'state', timestamp: '2025-03-12T09:00:00Z', reason: 'Outbreak spreading - state intervention required' },
    ],
  },
  {
    id: 'GRV-2025-004',
    title: 'Blocked drainage in residential area',
    description: 'Sewage overflow in Block C residential colony.',
    category: 'sanitation',
    location: { area: 'Block C, Kidwai Nagar', district: 'Kanpur', state: 'Uttar Pradesh' },
    priority: 'high',
    status: 'pending',
    currentLevel: 'local',
    assignedTo: '',
    citizenId: 'C003',
    createdAt: '2025-03-22T07:30:00Z',
    slaDeadline: '2025-03-25T07:30:00Z',
    escalationHistory: [],
  },
  {
    id: 'GRV-2025-005',
    title: 'Street lights not working',
    description: 'Street lights in entire ward are off for 1 week.',
    category: 'electricity',
    location: { area: 'Ward 8', district: 'Varanasi', state: 'Uttar Pradesh' },
    priority: 'medium',
    status: 'resolved',
    currentLevel: 'local',
    assignedTo: 'L001',
    citizenId: 'C001',
    createdAt: '2025-03-05T16:00:00Z',
    slaDeadline: '2025-03-08T16:00:00Z',
    escalationHistory: [],
  },
  {
    id: 'GRV-2025-006',
    title: 'School building roof leaking',
    description: 'Government primary school roof damaged, classes disrupted.',
    category: 'education',
    location: { area: 'Gomti Nagar', district: 'Lucknow', state: 'Uttar Pradesh' },
    priority: 'high',
    status: 'assigned',
    currentLevel: 'district',
    assignedTo: 'D002',
    citizenId: 'C002',
    createdAt: '2025-03-18T10:00:00Z',
    slaDeadline: '2025-03-22T10:00:00Z',
    escalationHistory: [
      { from: 'local', to: 'district', timestamp: '2025-03-19T12:00:00Z', reason: 'Requires district-level PWD intervention' },
    ],
  },
  {
    id: 'GRV-2025-007',
    title: 'Contaminated water supply',
    description: 'Yellow/brownish water being supplied through municipal pipes.',
    category: 'water',
    location: { area: 'Civil Lines', district: 'Varanasi', state: 'Uttar Pradesh' },
    priority: 'emergency',
    status: 'escalated',
    currentLevel: 'compliance',
    assignedTo: 'CO001',
    citizenId: 'C001',
    createdAt: '2025-03-01T06:00:00Z',
    slaDeadline: '2025-03-03T06:00:00Z',
    escalationHistory: [
      { from: 'local', to: 'district', timestamp: '2025-03-02T08:00:00Z', reason: 'Public health risk' },
      { from: 'district', to: 'state', timestamp: '2025-03-03T10:00:00Z', reason: 'No resolution at district level' },
      { from: 'state', to: 'compliance', timestamp: '2025-03-05T09:00:00Z', reason: 'SLA breach + public health violation' },
    ],
  },
  {
    id: 'GRV-2025-008',
    title: 'Garbage not collected for 10 days',
    description: 'No garbage collection in Ward 3 for over 10 days.',
    category: 'sanitation',
    location: { area: 'Ward 3', district: 'Kanpur', state: 'Uttar Pradesh' },
    priority: 'medium',
    status: 'assigned',
    currentLevel: 'local',
    assignedTo: 'L001',
    citizenId: 'C003',
    createdAt: '2025-03-21T09:00:00Z',
    slaDeadline: '2025-03-24T09:00:00Z',
    escalationHistory: [],
  },
];

// ---- AUDIT LOGS ----
export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorName: string;
  action: 'assigned' | 'escalated' | 'resolved' | 'flagged' | 'investigated';
  complaintId: string;
  result: string;
}

export const auditLogs: AuditLog[] = [
  { id: 'AUD-001', timestamp: '2025-03-20T09:30:00Z', actor: 'L001', actorName: 'Suresh Yadav', action: 'assigned', complaintId: 'GRV-2025-001', result: 'Assigned to local water supply team' },
  { id: 'AUD-002', timestamp: '2025-03-18T14:00:00Z', actor: 'L002', actorName: 'Meena Devi', action: 'escalated', complaintId: 'GRV-2025-002', result: 'Escalated to District - SLA breach' },
  { id: 'AUD-003', timestamp: '2025-03-11T10:00:00Z', actor: 'D002', actorName: 'Smt. Kavita Mishra', action: 'escalated', complaintId: 'GRV-2025-003', result: 'Escalated to State - health emergency' },
  { id: 'AUD-004', timestamp: '2025-03-08T15:00:00Z', actor: 'L001', actorName: 'Suresh Yadav', action: 'resolved', complaintId: 'GRV-2025-005', result: 'Street lights restored' },
  { id: 'AUD-005', timestamp: '2025-03-05T09:00:00Z', actor: 'S001', actorName: 'Shri A.K. Pandey (IAS)', action: 'escalated', complaintId: 'GRV-2025-007', result: 'Escalated to Compliance - SLA breach + health violation' },
  { id: 'AUD-006', timestamp: '2025-03-19T12:00:00Z', actor: 'L002', actorName: 'Meena Devi', action: 'escalated', complaintId: 'GRV-2025-006', result: 'Escalated to District - requires PWD' },
  { id: 'AUD-007', timestamp: '2025-03-22T11:00:00Z', actor: 'CO001', actorName: 'Shri V.K. Tripathi', action: 'flagged', complaintId: 'GRV-2025-007', result: 'Officer flagged for negligence' },
  { id: 'AUD-008', timestamp: '2025-03-23T08:00:00Z', actor: 'CO002', actorName: 'Smt. Nandini Rao', action: 'investigated', complaintId: 'GRV-2025-007', result: 'Vigilance investigation initiated' },
];

// ---- AI INSIGHTS ----
export const aiInsights: string[] = [
  'Water-related complaints increased 30% in Ward 5, Varanasi over the last 30 days.',
  '3 officers flagged for SLA violations in Lucknow district this month.',
  'Sanitation complaints in Kanpur are 45% above the state average.',
  'Health emergencies in Ward 12, Lucknow require immediate dengue control measures.',
  'Average response time for high-priority complaints: 52 hours (target: 24 hours).',
  'Road infrastructure complaints show seasonal pattern — peak during monsoon months.',
  'Compliance score for Varanasi district dropped to 68% from 82% last quarter.',
];

// ---- ANNOUNCEMENTS ----
export const announcements = [
  { id: 1, title: 'Swachh Bharat Abhiyan — Ward-level cleanliness drive on 28th March', date: '2025-03-24' },
  { id: 2, title: 'Jal Jeevan Mission — New pipeline installation in Ward 5', date: '2025-03-22' },
  { id: 3, title: 'PM Awas Yojana — Last date for application: 31st March 2025', date: '2025-03-20' },
];

// ---- IMPORTANT LINKS ----
export const importantLinks = [
  { title: 'Right to Information (RTI)', url: '#' },
  { title: 'National Portal of India', url: '#' },
  { title: 'Digital India', url: '#' },
  { title: 'MyGov.in', url: '#' },
  { title: 'Grievance Redressal Policy', url: '#' },
];

// ---- HELPER FUNCTIONS ----
export const getUserById = (id: string) => users.find(u => u.id === id);

export const getStatusBadgeClass = (status: Status) => {
  const map: Record<Status, string> = {
    pending: 'gov-badge-pending',
    assigned: 'gov-badge-assigned',
    resolved: 'gov-badge-resolved',
    escalated: 'gov-badge-escalated',
  };
  return map[status];
};

export const getPriorityBadgeClass = (priority: Priority) => {
  const map: Record<Priority, string> = {
    low: 'gov-badge-low',
    medium: 'gov-badge-medium',
    high: 'gov-badge-high',
    emergency: 'gov-badge-emergency',
  };
  return map[priority];
};

export const getLevelLabel = (level: Level) => {
  const map: Record<Level, string> = {
    local: 'Local Authority',
    district: 'District Authority',
    state: 'State Authority',
    compliance: 'Compliance Authority',
  };
  return map[level];
};
