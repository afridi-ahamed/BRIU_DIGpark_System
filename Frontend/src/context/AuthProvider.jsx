import { useMemo, useState } from 'react';
import { loginUser } from '../services/api';
import { AuthContext } from './auth';

const readStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('parkingUser');
    const storedToken = localStorage.getItem('parkingToken');
    if (!storedUser || !storedToken) return null;
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);

  const login = async (username, password) => {
    try {
      const result = await loginUser(username, password);
      const userData = {
        id: result.user.id,
        username: result.user.username,
        name: result.user.full_name || result.user.username,
        role: result.user.role,
        universityId: result.user.university_id,
        category: result.user.category,
      };
      localStorage.setItem('parkingToken', result.token);
      localStorage.setItem('parkingUser', JSON.stringify(userData));
      setUser(userData);
      return { success: true, role: result.user.role };
    } catch (err) {
      return { success: false, error: err?.data?.error || 'Invalid credentials' };
    }
  };

  const logout = () => {
    localStorage.removeItem('parkingToken');
    localStorage.removeItem('parkingUser');
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

