// frontend/src/context/AuthContext.jsx
// Stores login state globally so any component can access it
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken]       = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));

  const loginUser = (token, username) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    setToken(token);
    setUsername(username);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, username, loginUser, logoutUser, logout: logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component
export const useAuth = () => useContext(AuthContext);