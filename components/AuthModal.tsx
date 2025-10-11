



import React, { useState } from 'react';
import Modal from './Modal';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { LockIcon } from './icons/LockIcon';
import { UserIcon } from './icons/UserIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { GoogleIcon } from './icons/GoogleIcon';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (name: string, email: string, password: string) => Promise<boolean>;
  onForgotPasswordClick: () => void;
  onGoogleLogin: () => void;
}

const InputWithIcon: React.FC<{
    id: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    required: boolean;
    children: React.ReactNode;
    toggleVisibility?: () => void;
    showPassword?: boolean;
}> = ({ id, type, value, onChange, placeholder, required, children, toggleVisibility, showPassword }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
        {children}
      </div>
      <input 
        type={type} 
        id={id} 
        value={value} 
        onChange={onChange} 
        className="w-full pl-10 pr-10 p-2.5 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent" 
        placeholder={placeholder} 
        required={required} 
      />
      {toggleVisibility && (
        <button 
          type="button" 
          onClick={toggleVisibility} 
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
        </button>
      )}
    </div>
);


const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onRegister, onForgotPasswordClick, onGoogleLogin }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);


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
        <div className="flex border-b border-border">
            <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-4 text-center font-semibold transition-colors ${activeTab === 'login' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground hover:text-card-foreground'}`}
            >
                Login
            </button>
            <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-4 text-center font-semibold transition-colors ${activeTab === 'register' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground hover:text-card-foreground'}`}
            >
                Create Account
            </button>
        </div>
      
        <div className="p-6">
            {activeTab === 'login' ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-center">Welcome Back!</h2>
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <InputWithIcon id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="name@company.com" required>
                          <EnvelopeIcon className="w-5 h-5"/>
                        </InputWithIcon>
                        <InputWithIcon id="login-password" type={showLoginPassword ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" required toggleVisibility={() => setShowLoginPassword(!showLoginPassword)} showPassword={showLoginPassword}>
                          <LockIcon className="w-5 h-5"/>
                        </InputWithIcon>
                        <div className="text-right">
                          <button type="button" onClick={onForgotPasswordClick} className="text-sm text-accent hover:underline font-medium">Forgot Password?</button>
                        </div>
                        <button type="submit" className="w-full text-white bg-accent hover:bg-accent/90 font-medium rounded-lg text-sm px-5 py-3 text-center transition-transform transform active:scale-95">Login</button>
                    </form>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>
                    <button type="button" onClick={onGoogleLogin} className="w-full flex items-center justify-center gap-3 border border-border rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-secondary">
                      <GoogleIcon />
                      Sign in with Google
                    </button>
                </div>
            ) : (
                 <div className="space-y-4">
                  <h2 className="text-xl font-bold text-center">Create an Account</h2>
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <InputWithIcon id="register-name" type="text" value={registerName} onChange={(e) => setRegisterName(e.target.value)} placeholder="John Doe" required>
                      <UserIcon className="w-5 h-5"/>
                    </InputWithIcon>
                    <InputWithIcon id="register-email" type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} placeholder="name@company.com" required>
                      <EnvelopeIcon className="w-5 h-5"/>
                    </InputWithIcon>
                    <InputWithIcon id="register-password" type={showRegisterPassword ? 'text' : 'password'} value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} placeholder="••••••••" required toggleVisibility={() => setShowRegisterPassword(!showRegisterPassword)} showPassword={showRegisterPassword}>
                      <LockIcon className="w-5 h-5"/>
                    </InputWithIcon>
                    <button type="submit" className="w-full text-white bg-accent hover:bg-accent/90 font-medium rounded-lg text-sm px-5 py-3 text-center transition-transform transform active:scale-95">Create account</button>
                  </form>
                </div>
            )}
        </div>
    </Modal>
  );
};

export default AuthModal;