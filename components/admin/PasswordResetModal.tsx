import React from 'react';
import Modal from '../Modal';
import { useToast } from '../../contexts/ToastContext';
import { ClipboardCopyIcon } from '../icons/ClipboardCopyIcon';
import { ShieldExclamationIcon } from '../icons/ShieldExclamationIcon';

interface PasswordResetModalProps {
    password: string;
    onClose: () => void;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ password, onClose }) => {
    const { addToast } = useToast();
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(password);
        addToast('Password copied to clipboard!', 'success');
    };
    
    return (
        <Modal isOpen={true} onClose={onClose} title="Temporary Password">
            <div className="p-6">
                 <div className="p-4 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg text-yellow-800 dark:text-yellow-200 flex items-start gap-3">
                    <ShieldExclamationIcon className="w-8 h-8 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold">Important Security Notice</h4>
                        <p className="text-sm">
                            Share this temporary password with the user through a secure channel.
                            They should be instructed to change it immediately upon their next login.
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2 p-3 bg-secondary rounded-md">
                    <pre className="text-lg font-mono overflow-x-auto"><code>{password}</code></pre>
                    <button onClick={copyToClipboard} className="p-2 rounded-md hover:bg-muted" title="Copy password">
                        <ClipboardCopyIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-6 text-right">
                    <button onClick={onClose} className="px-5 py-2.5 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-semibold">
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PasswordResetModal;
