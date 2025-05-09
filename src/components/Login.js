'use client';

import { useState, useEffect } from 'react';
import { authenticate } from '../utils/auth';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = authenticate(username.trim(), password.trim());
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      onLogin(user);
    } else {
      setError('Invalid username or password');
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      onLogin(JSON.parse(savedUser));
    }
  }, [onLogin]);

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded text-center">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
        <div className="w-1/2">
          <label className="block text-sm font-medium text-left">Username</label>
          <input
            type="text"
            className="w-full p-2 border rounded text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="w-1/2">
          <label className="block text-sm font-medium text-left">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-1/2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
        >
          Login
        </button>
      </form>
    </div>
  );
}