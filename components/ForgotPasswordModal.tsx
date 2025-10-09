
import React, { useState } from 'react';
import Modal from './Modal';
import * as userService from '../services/userService';
import { useToast } from '../contexts/ToastContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const res = await userService.forgotPassword(email);
        addToast(res.message, 'success');
        onSuccess();
    } catch (error: any) {
        addToast(error.message || 'Failed to send reset link.', 'error');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reset Your Password">
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-sm text-muted-foreground">
            Enter the email address associated with your account and we'll send you a link to reset your password.
        </p>
        <div>
          <label htmlFor="reset-email" className="block mb-2 text-sm font-medium">
            Email Address
          </label>
          <input
            type="email"
            id="reset-email"
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500"
            placeholder="name@company.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white bg-accent hover:bg-accent/90 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-muted"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </Modal>
  );
};

export default ForgotPasswordModal;
