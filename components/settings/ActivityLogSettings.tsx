
import React, { useState, useEffect } from 'react';
import { User, ActivityLog } from '../../types';
import * as userService from '../../services/userService';
import LoadingSpinner from '../LoadingSpinner';
import { ClockIcon } from '../icons/ClockIcon';
import { useToast } from '../../contexts/ToastContext';

interface ActivityLogSettingsProps {
    user: User;
}

const ActivityLogSettings: React.FC<ActivityLogSettingsProps> = ({ user }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await userService.getUserActivity(user.id);
                setLogs(data);
            } catch (error: any) {
                addToast(error.message || "Failed to load activity.", 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, [user.id, addToast]);

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Activity Log</h3>
            <p className="text-muted-foreground mb-6">A record of actions taken on your account.</p>

            {isLoading ? <div className="flex justify-center py-10"><LoadingSpinner /></div> : (
                logs.length > 0 ? (
                    <div className="border border-border rounded-lg max-h-[500px] overflow-y-auto">
                        <ul className="divide-y divide-border">
                            {logs.map(log => (
                                <li key={log.id} className="p-4 flex items-start space-x-4">
                                     <div className="bg-secondary p-2 rounded-full mt-1">
                                        <ClockIcon className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold capitalize">{log.action_type.replace(/_/g, ' ')}</p>
                                        <div className="text-xs text-muted-foreground">
                                            <span>{new Date(log.created_at).toLocaleString()}</span>
                                            <span className="mx-2">&bull;</span>
                                            <span>IP: {log.ip_address}</span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-10">No recent activity.</p>
                )
            )}
        </div>
    );
};

export default ActivityLogSettings;
