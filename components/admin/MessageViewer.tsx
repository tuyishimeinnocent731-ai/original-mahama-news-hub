import React, { useState, useEffect } from 'react';
import { ContactMessage } from '../../types';
import * as navigationService from '../../services/navigationService';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../LoadingSpinner';
import { TrashIcon } from '../icons/TrashIcon';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';

const MessageViewer: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const { addToast } = useToast();

    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            const data = await navigationService.getContactMessages();
            setMessages(data);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleSelectMessage = async (message: ContactMessage) => {
        setSelectedMessage(message);
        if (!message.is_read) {
            try {
                await navigationService.updateContactMessage(message.id, { is_read: true });
                setMessages(prev => prev.map(m => m.id === message.id ? { ...m, is_read: true } : m));
            } catch (error) {
                // Non-critical error, just log it
                console.error("Failed to mark message as read", error);
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                await navigationService.deleteContactMessage(id);
                setMessages(prev => prev.filter(m => m.id !== id));
                if(selectedMessage?.id === id) {
                    setSelectedMessage(null);
                }
                addToast('Message deleted.', 'success');
            } catch (error: any) {
                addToast(error.message, 'error');
            }
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Contact Messages</h3>
            {isLoading ? <LoadingSpinner /> : messages.length === 0 ? (
                <div className="text-center py-16 bg-secondary rounded-lg">
                    <EnvelopeIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 font-semibold">No messages yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 border border-border rounded-lg max-h-[600px] overflow-y-auto">
                        <ul>
                            {messages.map(msg => (
                                <li key={msg.id} className={`border-b border-border last:border-b-0 ${selectedMessage?.id === msg.id ? 'bg-accent/20' : ''}`}>
                                    <button onClick={() => handleSelectMessage(msg)} className="w-full text-left p-3 hover:bg-secondary/50">
                                        <div className="flex justify-between items-start">
                                            <p className={`font-semibold text-sm truncate ${!msg.is_read ? 'text-card-foreground' : 'text-muted-foreground'}`}>{msg.name}</p>
                                            {!msg.is_read && <span className="w-2.5 h-2.5 bg-accent rounded-full flex-shrink-0 mt-1"></span>}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">{msg.subject || 'No Subject'}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{new Date(msg.created_at).toLocaleDateString()}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:col-span-2 bg-secondary p-6 rounded-lg">
                        {selectedMessage ? (
                            <div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-lg font-bold">{selectedMessage.subject || 'No Subject'}</h4>
                                        <p className="text-sm font-medium">From: <a href={`mailto:${selectedMessage.email}`} className="text-accent hover:underline">{selectedMessage.name}</a></p>
                                        <p className="text-xs text-muted-foreground">{new Date(selectedMessage.created_at).toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => handleDelete(selectedMessage.id)} className="text-muted-foreground hover:text-destructive p-2">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                                <div className="mt-6 pt-6 border-t border-border/50">
                                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <EnvelopeIcon className="h-16 w-16 text-muted-foreground" />
                                <p className="mt-2 font-semibold">Select a message to read</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageViewer;