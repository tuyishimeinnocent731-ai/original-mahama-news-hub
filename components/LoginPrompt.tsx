import React from 'react';
import { LoginIcon } from './icons/LoginIcon';

interface LoginPromptProps {
    onLoginClick: () => void;
    message: string;
    subMessage?: string;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ onLoginClick, message, subMessage }) => {
    return (
        <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <LoginIcon className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{message}</h3>
            {subMessage && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {subMessage}
                </p>
            )}
            <button
                onClick={onLoginClick}
                className="mt-2 px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-semibold"
            >
                Login or Sign Up
            </button>
        </div>
    );
};

export default LoginPrompt;
