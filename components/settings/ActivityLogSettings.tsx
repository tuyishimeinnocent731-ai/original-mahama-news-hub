import React from 'react';
import { User } from '../../types';
import { ClockIcon } from '../icons/ClockIcon';

interface ActivityLogSettingsProps {
    user: User;
}

// Mock activity data
const activityLog = [
    { type: 'Logged In', details: 'From Chrome on Windows', date: '2024-07-20 10:00 AM' },
    { type: 'Saved Article', details: '"Global Tech Summit 2024"', date: '2024-07-20 09:45 AM' },
    { type: 'Password Changed', details: 'Security details updated', date: '2024-07-19 03:20 PM' },
    { type: 'Subscription Updated', details: 'Upgraded to Premium', date: '2024-07-15 11:00 AM' },
];

const ActivityLogSettings: React.FC<ActivityLogSettingsProps> = ({ user }) => {
    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Activity Log</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">A log of recent activity on your account.</p>
            <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                <ul className="divide-y dark:divide-gray-700">
                    {activityLog.map((activity, index) => (
                        <li key={index} className="p-4 flex items-center space-x-4">
                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                                <ClockIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{activity.type}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{activity.details}</p>
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                                {activity.date}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ActivityLogSettings;
