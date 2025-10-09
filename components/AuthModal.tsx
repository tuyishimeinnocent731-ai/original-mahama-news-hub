
import React, { useState } from 'react';
import Modal from './Modal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (name: string, email: string, password: string) => Promise<boolean>;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onRegister }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onLogin(loginEmail, loginPassword);
    if (success) {
      onClose();
    }
  };
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onRegister(registerName, registerEmail, registerPassword);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-4 text-center font-semibold ${activeTab === 'login' ? 'text-accent border-b-2 border-accent' : 'text-gray-500'}`}
            >
                Login
            </button>
            <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-4 text-center font-semibold ${activeTab === 'register' ? 'text-accent border-b-2 border-accent' : 'text-gray-500'}`}
            >
                Create Account
            </button>
        </div>
      
        <div className="p-6">
            {activeTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="login-email" className="block mb-2 text-sm font-medium">Your email</label>
                        <input type="email" id="login-email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500" placeholder="name@company.com" required />
                    </div>
                    <div>
                        <label htmlFor="login-password" className="block mb-2 text-sm font-medium">Your password</label>
                        <input type="password" id="login-password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500" placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="w-full text-white bg-accent hover:bg-accent/90 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Login to your account</button>
                </form>
            ) : (
                 <form onSubmit={handleRegisterSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="register-name" className="block mb-2 text-sm font-medium">Your name</label>
                        <input type="text" id="register-name" value={registerName} onChange={(e) => setRegisterName(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500" placeholder="John Doe" required />
                    </div>
                    <div>
                        <label htmlFor="register-email" className="block mb-2 text-sm font-medium">Your email</label>
                        <input type="email" id="register-email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500" placeholder="name@company.com" required />
                    </div>
                    <div>
                        <label htmlFor="register-password" className="block mb-2 text-sm font-medium">Your password</label>
                        <input type="password" id="register-password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500" placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="w-full text-white bg-accent hover:bg-accent/90 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Create account</button>
                </form>
            )}
        </div>
    </Modal>
  );
};

export default AuthModal;
