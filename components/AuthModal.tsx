import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';

declare const google: any;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password?: string) => void;
  onRegister: (email: string, password?: string) => void;
  onGoogleLogin: (token: string) => void;
}

type AuthMode = 'login' | 'register';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onRegister, onGoogleLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && google) {
      google.accounts.id.initialize({
        client_id: process.env.GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          onGoogleLogin(response.credential);
        },
      });
      if (googleButtonRef.current) {
        google.accounts.id.renderButton(
          googleButtonRef.current,
          { theme: 'outline', size: 'large', width: '300' }
        );
      }
    }
  }, [isOpen, onGoogleLogin]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login' && email && password) {
      onLogin(email, password);
    } else if (mode === 'register' && email && password && password === confirmPassword) {
      onRegister(email, password);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        <div className="flex flex-col md:flex-row md:min-h-[500px] w-full">
             {/* Left Panel (Branding) */}
            <div className="hidden md:flex w-2/5 bg-blue-800 p-8 text-white rounded-l-lg flex-col justify-center">
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">Mahama News Hub</h2>
                <p>Your daily source of reliable news, now personalized for you.</p>
                <p className="mt-4 text-sm text-blue-200">Join our community to save articles, customize your feed, and access exclusive features.</p>
            </div>

            {/* Right Panel (Form) */}
            <div className="w-full md:w-3/5 p-8 flex flex-col justify-center bg-white dark:bg-gray-800 rounded-r-lg">
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button onClick={() => setMode('login')} className={`w-1/2 pb-3 text-center font-semibold transition-colors ${mode === 'login' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                        Login
                    </button>
                    <button onClick={() => setMode('register')} className={`w-1/2 pb-3 text-center font-semibold transition-colors ${mode === 'register' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                        Register
                    </button>
                </div>
                
                <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-4">
                    {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email-auth" className="sr-only">Email</label>
                        <input type="email" name="email" id="email-auth" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="name@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="password-auth" className="sr-only">Password</label>
                        <input type="password" name="password" id="password-auth" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    {mode === 'register' && (
                        <div>
                            <label htmlFor="confirm-password-auth" className="sr-only">Confirm Password</label>
                            <input type="password" name="confirm-password" id="confirm-password-auth" placeholder="Confirm Password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                    )}
                    <button type="submit" className="w-full text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-3 text-center transition-colors">
                        {mode === 'login' ? 'Login' : 'Create Account'}
                    </button>
                </form>
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">OR</span>
                    </div>
                </div>
                <div className="flex items-center justify-center">
                   <div ref={googleButtonRef}></div>
                </div>
            </div>
        </div>
    </Modal>
  );
};

export default AuthModal;