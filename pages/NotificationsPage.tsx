import React, { useState, useEffect } from 'react';
import { Notification } from '../types';
import * as userService from '../services/userService';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { BellIcon } from '../components/icons/BellIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { InformationCircleIcon } from '../components/icons/InformationCircleIcon';
import { GiftIcon } from '../components/icons/GiftIcon';
import { CheckBadgeIcon } from '../components/icons/CheckBadgeIcon';

interface NotificationsPageProps {
    onNotificationCountChange: (count: number) => void;
}

const getNotificationIcon = (type: Notification['type']) => {
    const icons: Record<Notification['type'], React.ReactNode> = {
        alert: <InformationCircleIcon className="w-6 h-6 text-red-500" />,
        feature: <GiftIcon className="w-6 h-6 text-purple-500" />,
        update: <CheckBadgeIcon className="w-6 h-6 text-blue-500" />,
        message: <BellIcon className="w-6 h-6 text-green-500" />,
    };
    return icons[type];
};

const groupNotifications = (notifications: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {
        Today: [],
        Yesterday: [],
        Older: [],
    };

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    notifications.forEach(notification => {
        const notificationDate = new Date(notification.created_at);
        if (notificationDate.toDateString() === today.toDateString()) {
            groups.Today.push(notification);
        } else if (notificationDate.toDateString() === yesterday.toDateString()) {
            groups.Yesterday.push(notification);
        } else {
            groups.Older.push(notification);
        }
    });

    return groups;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNotificationCountChange }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();
    
    const fetchNotifications = async () => {
        try {
            const fetched = await userService.getNotifications();
            setNotifications(fetched);
            onNotificationCountChange(fetched.filter(n => !n.is_read).length);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id: number) => {
        try {
            await userService.markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            onNotificationCountChange(notifications.filter(n => !n.is_read).length - 1);
        } catch (error: any) {
            addToast(error.message, 'error');
        }
    };
    
    const handleMarkAllRead = async () => {
        try {
            await userService.markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            onNotificationCountChange(0);
        } catch (error: any) {
            addToast(error.message, 'error');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await userService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            addToast('Notification deleted.', 'success');
        } catch (error: any) {
            addToast(error.message, 'error');
        }
    };

    const groupedNotifications = groupNotifications(notifications);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-accent">
                <h1 className="text-3xl font-bold">Notifications</h1>
                <button onClick={handleMarkAllRead} className="text-sm font-semibold text-accent hover:underline disabled:text-muted-foreground" disabled={notifications.every(n => n.is_read)}>
                    Mark all as read
                </button>
            </div>

            {isLoading ? <div className="flex justify-center p-12"><LoadingSpinner/></div> : 
             notifications.length === 0 ? (
                <div className="text-center py-20 bg-secondary rounded-lg">
                    <BellIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold">All caught up!</h2>
                    <p className="text-muted-foreground mt-2">You don't have any new notifications.</p>
                </div>
             ) : (
                <div className="space-y-8">
                    {Object.entries(groupedNotifications).map(([group, items]) => items.length > 0 && (
                        <div key={group}>
                            <h2 className="text-lg font-semibold mb-4">{group}</h2>
                            <ul className="space-y-3">
                                {items.map(notification => (
                                    <li key={notification.id} className={`p-4 rounded-lg flex items-start gap-4 transition-colors duration-300 ${notification.is_read ? 'bg-card' : 'bg-accent/10 border border-accent/30'}`}>
                                        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                                        <div className="flex-grow">
                                            <p className="text-card-foreground">{notification.message}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{new Date(notification.created_at).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!notification.is_read && (
                                                <button onClick={() => handleMarkAsRead(notification.id)} title="Mark as read" className="p-1 text-muted-foreground hover:text-accent">
                                                    <CheckCircleIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(notification.id)} title="Delete notification" className="p-1 text-muted-foreground hover:text-destructive">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;