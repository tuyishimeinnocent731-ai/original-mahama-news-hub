
import React, { useState, useEffect } from 'react';
import * as userService from '../services/userService';
import { useToast } from '../contexts/ToastContext';
import { KeyIcon } from '../components/icons/KeyIcon';

interface ResetPasswordPageProps {
    onSuccess: () => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onSuccess }) => {
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        // Extract token from URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            addToast('Passwords do not match.', 'error');
            return;
        }
        if (!token) {
            addToast('Invalid or missing reset token.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const res = await userService.resetPassword(token, password);
            addToast(res.message, 'success');
            onSuccess();
        } catch (error: any) {
            addToast(error.message || 'Failed to reset password.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto my-10 animate-fade-in">
             <div className="text-center mb-8">
                <KeyIcon className="mx-auto h-12 w-12 text-accent" />
                <h1 className="text-3xl font-extrabold tracking-tight mt-4">Set a New Password</h1>
                <p className="mt-2 text-muted-foreground">
                    Please choose a strong, new password for your account.
                </p>
            </div>
            <div className="bg-card p-8 rounded-lg shadow-xl border border-border">
                <form onSubmit={handleSubmit} className="space-y-6">
                     <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-1">New Password</label>
                        <input type="password" name="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 border rounded-md bg-card border-border focus:ring-accent focus:border-accent" />
                    </div>
                     <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm New Password</label>
                        <input type="password" name="confirmPassword" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full p-2 border rounded-md bg-card border-border focus:ring-accent focus:border-accent" />
                    </div>
                    <button type="submit" disabled={isLoading || !token} className="w-full px-6 py-3 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-semibold disabled:bg-muted">
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                    {!token && <p className="text-sm text-center text-destructive">No reset token found in URL. Please use the link from your email.</p>}
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
