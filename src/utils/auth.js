export const USERS = {
  Lecsovi: { password: 'admin123', role: 'admin' },
  PM: { password: 'group123', role: 'groupEditor' }
};

export function authenticate(username, password) {
  const user = USERS[username];
  if (user && user.password === password) {
    return { username, role: user.role };
  }
  return null;
}