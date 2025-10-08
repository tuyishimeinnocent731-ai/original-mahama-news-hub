import React, { useState, useEffect } from 'react';
import { ApiKey } from '../../types';
import * as userService from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ClipboardCopyIcon } from '../icons/ClipboardCopyIcon';
import LoadingSpinner from '../LoadingSpinner';
import Modal from '../Modal';

const NewApiKeyModal: React.FC<{ apiKey: string; onClose: () => void }> = ({ apiKey, onClose }) => {
    const { addToast } = useToast();
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiKey);
        addToast('API Key copied to clipboard!', 'success');
    };
    
    return (
        <Modal isOpen={true} onClose={onClose} title="New API Key Generated">
            <div className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                    Please copy your new API key now. You won’t be able to see it again!
                </p>
                <div className="flex items-center gap-2 p-3 bg-secondary rounded-md">
                    <pre className="text-sm font-mono overflow-x-auto"><code>{apiKey}</code></pre>
                    <button onClick={copyToClipboard} className="p-2 rounded-md hover:bg-muted">
                        <ClipboardCopyIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-6 text-right">
                    <button onClick={onClose} className="px-5 py-2.5 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-semibold">
                        I have copied my key
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const ApiKeysSettings: React.FC = () => {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newKeyDescription, setNewKeyDescription] = useState('');
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const { addToast } = useToast();

    const fetchKeys = async () => {
        setIsLoading(true);
        try {
            const fetchedKeys = await userService.getApiKeys();
            setKeys(fetchedKeys);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchKeys();
    }, []);

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyDescription.trim()) {
            addToast('Please provide a description for the key.', 'warning');
            return;
        }
        try {
            const { key } = await userService.createApiKey(newKeyDescription);
            setGeneratedKey(key);
            setNewKeyDescription('');
            fetchKeys();
        } catch (error: any) {
            addToast(error.message, 'error');
        }
    };
    
    const handleDeleteKey = async (keyId: string) => {
        if (window.confirm("Are you sure you want to delete this API key? This action is irreversible.")) {
            try {
                await userService.deleteApiKey(keyId);
                addToast('API key deleted successfully.', 'success');
                fetchKeys();
            } catch (error: any) {
                addToast(error.message, 'error');
            }
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Developer API Keys</h3>
            <p className="text-muted-foreground mb-6">Manage API keys to access news data programmatically.</p>

            <form onSubmit={handleCreateKey} className="p-4 border rounded-lg border-border mb-8">
                <h4 className="font-semibold mb-2">Create New Key</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={newKeyDescription}
                        onChange={(e) => setNewKeyDescription(e.target.value)}
                        placeholder="Description (e.g., 'My personal project')"
                        className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    />
                    <button type="submit" className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-semibold text-sm">
                        <PlusCircleIcon className="w-5 h-5" />
                        Generate Key
                    </button>
                </div>
            </form>

            <div>
                <h4 className="font-semibold text-lg mb-4">Your Keys</h4>
                {isLoading ? <LoadingSpinner /> : (
                    <div className="space-y-3">
                        {keys.length > 0 ? keys.map(key => (
                            <div key={key.id} className="p-3 bg-secondary rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <p className="font-semibold">{key.description}</p>
                                    <p className="text-sm font-mono text-muted-foreground">{key.prefix}....</p>
                                    <p className="text-xs text-muted-foreground">
                                        Last used: {key.last_used ? new Date(key.last_used).toLocaleString() : 'Never'}
                                    </p>
                                </div>
                                <button onClick={() => handleDeleteKey(key.id)} className="p-2 rounded-md hover:bg-destructive/20 text-destructive">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-4">You don't have any API keys yet.</p>
                        )}
                    </div>
                )}
            </div>
            
            {generatedKey && <NewApiKeyModal apiKey={generatedKey} onClose={() => setGeneratedKey(null)} />}
        </div>
    );
};

export default ApiKeysSettings;
