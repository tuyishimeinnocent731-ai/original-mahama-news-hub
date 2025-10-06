import React, { useState } from 'react';
import Modal from './Modal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string) => void;
  onRegister: (email: string) => void;
}

type AuthMode = 'login' | 'register';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onRegister }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login' && email && password) {
      onLogin(email);
    } else if (mode === 'register' && email && password && password === confirmPassword) {
      onRegister(email);
    }
  };

  const socialLogins = [
      { name: 'Google', icon: 'M4.75 6.5h14.5c.41 0 .75.34.75.75v9.5c0 .41-.34.75-.75.75H4.75a.75.75 0 01-.75-.75v-9.5c0-.41.34-.75.75-.75zm.5 1.5v8h13v-8h-13z M12 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' },
      { name: 'Facebook', icon: 'M13.5 8.5H11V7c0-.55.45-1 1-1h1V4h-2.5C9.12 4 8 5.12 8 6.5v2H6.5v2.5h1.5V16h3v-5h1.5l.5-2.5z' },
      { name: 'Twitter', icon: 'M20 7.29c-.5.22-1.04.37-1.61.44.57-.34 1-.89 1.21-1.55-.54.32-1.13.55-1.77.67-.5-.54-1.22-.87-2-.87-1.52 0-2.75 1.23-2.75 2.75 0 .22.02.43.07.64-2.28-.11-4.31-1.21-5.67-2.87-.24.41-.37.88-.37 1.39 0 .95.49 1.8 1.22 2.29-.45-.01-.88-.14-1.25-.34v.03c0 1.33.95 2.44 2.2 2.69-.23.06-.47.1-.72.1-.18 0-.35-.02-.52-.05.35 1.1 1.37 1.9 2.58 1.91-1 .78-2.23 1.25-3.58 1.25-.23 0-.46-.01-.69-.04 1.28.82 2.8 1.3 4.42 1.3 5.3 0 8.2-4.39 8.2-8.2v-.37c.56-.4.98-.9 1.35-1.5z' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button onClick={() => setMode('login')} className={`w-1/2 py-4 text-center font-medium ${mode === 'login' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                Login
            </button>
            <button onClick={() => setMode('register')} className={`w-1/2 py-4 text-center font-medium ${mode === 'register' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                Register
            </button>
        </div>
      <div className="pt-6">
        <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-4">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label htmlFor="email-auth" className="sr-only">Email</label>
            <input type="email" name="email" id="email-auth" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="name@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
            <label htmlFor="password-auth" className="sr-only">Password</label>
            <input type="password" name="password" id="password-auth" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {mode === 'register' && (
                <div>
                    <label htmlFor="confirm-password-auth" className="sr-only">Confirm Password</label>
                    <input type="password" name="confirm-password" id="confirm-password-auth" placeholder="Confirm Password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
            )}
            <button type="submit" className="w-full text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-3 text-center">
                {mode === 'login' ? 'Login' : 'Create Account'}
            </button>
        </form>
        <div className="text-center my-4 text-gray-500 dark:text-gray-400 text-sm">OR</div>
        <div className="flex items-center justify-center space-x-2">
            {socialLogins.map(s => (
                <button key={s.name} aria-label={`Login with ${s.name}`} className="p-3 border border-gray-200 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d={s.icon}></path></svg>
                </button>
            ))}
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;