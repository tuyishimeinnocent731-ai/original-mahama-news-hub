import React, { useState, useEffect } from 'react';
import { ActivityLog } from '../../types';
import * as userService from '../../services/userService';
import Modal from '../Modal';
import LoadingSpinner from '../LoadingSpinner';
import { ClockIcon } from '../icons/ClockIcon';

interface ActivityLogModalProps {
    userId: string;
    userName: string;
    onClose: () => void;
}

const ActivityLogModal: React.FC<ActivityLogModalProps> = ({ userId, userName, onClose }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await userService.getUserActivity(userId);
                setLogs(data);
            } catch (error) {
                console.error("Failed to fetch activity logs", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, [userId]);

    return (
        <Modal isOpen={true} onClose={onClose} title={`Activity Log for ${userName}`}>
            <div className="p-6 max-h-[600px] overflow-y-auto">
                {isLoading ? <LoadingSpinner /> : (
                    logs.length > 0 ? (
                        <ul className="space-y-4">
                            {logs.map(log => (
                                <li key={log.id} className="flex items-start space-x-3">
                                    <div className="bg-secondary p-2 rounded-full mt-1">
                                        <ClockIcon className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm capitalize">{log.action_type.replace(/_/g, ' ')}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(log.created_at).toLocaleString()} &bull; IP: {log.ip_address}
                                        </p>
                                        {log.details && (
                                            <pre className="mt-1 text-xs bg-muted p-2 rounded-md overflow-x-auto">
                                                <code>{JSON.stringify(log.details, null, 2)}</code>
                                            </pre>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No activity recorded for this user.</p>
                    )
                )}
            </div>
        </Modal>
    );
};

export default ActivityLogModal;