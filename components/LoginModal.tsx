import React, { useState } from 'react';
import Modal from './Modal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<boolean> | void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email||!password) return;
    try {
      await onLogin(email,password);
      onClose && onClose();
    } catch(err) { console.error('Login error', err); }
  };
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Login">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div><label>Your email</label><input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
        <div><label>Your password</label><input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
        <button type="submit" className="btn-primary">Login</button>
      </form>
    </Modal>
  );
};

export default LoginModal;
