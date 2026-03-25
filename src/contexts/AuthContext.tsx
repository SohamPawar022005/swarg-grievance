import { createContext, useContext, useState, ReactNode } from 'react';

export type Role = 'local' | 'district' | 'state' | 'compliance';

export interface AuthUser {
  username: string;
  name: string;
  role: Role;
  location: string;
  department: string;
}

const mockUsers: Record<string, { password: string; user: AuthUser }> = {
  local_officer: {
    password: 'pass123',
    user: {
      username: 'local_officer',
      name: 'Suresh Yadav',
      role: 'local',
      location: 'Ward 5, Varanasi',
      department: 'Water Supply',
    },
  },
  district_officer: {
    password: 'pass123',
    user: {
      username: 'district_officer',
      name: 'Dr. R.K. Singh',
      role: 'district',
      location: 'Varanasi',
      department: 'Public Works',
    },
  },
  state_officer: {
    password: 'pass123',
    user: {
      username: 'state_officer',
      name: 'Shri A.K. Pandey (IAS)',
      role: 'state',
      location: 'Lucknow',
      department: 'Urban Development',
    },
  },
  compliance_officer: {
    password: 'pass123',
    user: {
      username: 'compliance_officer',
      name: 'Shri V.K. Tripathi',
      role: 'compliance',
      location: 'Lucknow',
      department: 'Audit & Compliance',
    },
  },
};

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (username: string, password: string) => {
    const entry = mockUsers[username];
    if (entry && entry.password === password) {
      setUser(entry.user);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
