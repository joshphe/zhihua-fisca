import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const UserContext = createContext(null);

const USERS_KEY = 'zhihuaFisca_users';
const RESULTS_PREFIX = 'zhihuaFisca_results_';
const CURRENT_USER_KEY = 'zhihuaFisca_current_user';

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function loadResults(username) {
  try { return JSON.parse(localStorage.getItem(RESULTS_PREFIX + username)) || []; } catch { return []; }
}
function saveResults(username, results) {
  localStorage.setItem(RESULTS_PREFIX + username, JSON.stringify(results));
}

function generateAvatarSeed(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function avatarColors(seed) {
  const palettes = [
    ['#C67B5C', '#E8988A'],
    ['#87A7C7', '#A8C8D8'],
    ['#8CB896', '#A8C8A8'],
    ['#D4956B', '#C8A898'],
    ['#B088A0', '#C8A8B8'],
    ['#8BA4C7', '#A8B8C8'],
  ];
  return palettes[seed % palettes.length];
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) {
      const users = loadUsers();
      if (users.includes(saved)) return saved;
    }
    return null;
  });

  const login = useCallback((username) => {
    const trimmed = username.trim();
    if (!trimmed) return false;
    const users = loadUsers();
    if (!users.includes(trimmed)) {
      users.push(trimmed);
      saveUsers(users);
      saveResults(trimmed, []);
    }
    setUser(trimmed);
    localStorage.setItem(CURRENT_USER_KEY, trimmed);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  }, []);

  const switchUser = useCallback((username) => {
    setUser(username);
    localStorage.setItem(CURRENT_USER_KEY, username);
  }, []);

  const getUsers = useCallback(() => loadUsers(), []);

  const getAvatar = useCallback((username) => {
    const seed = generateAvatarSeed(username || user || '');
    const [c1, c2] = avatarColors(seed);
    return {
      gradient: `linear-gradient(135deg, ${c1}, ${c2})`,
      initial: (username || user || '?')[0].toUpperCase(),
    };
  }, [user]);

  const saveUserResult = useCallback((username, result) => {
    const results = loadResults(username);
    results.unshift(result);
    saveResults(username, results);
  }, []);

  const deleteUserResult = useCallback((username, resultId) => {
    const results = loadResults(username);
    const filtered = results.filter((r) => r.id !== resultId);
    saveResults(username, filtered);
  }, []);

  const getUserResults = useCallback((username) => loadResults(username), []);

  return (
    <UserContext.Provider value={{
      user, login, logout, switchUser, getUsers,
      getAvatar, saveUserResult, deleteUserResult, getUserResults,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
