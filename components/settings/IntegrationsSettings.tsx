import React from 'react';
import { User, IntegrationId } from '../../types';
import ToggleSwitch from '../ToggleSwitch';
import { SlackIcon } from '../icons/SlackIcon';
import { GoogleCalendarIcon } from '../icons/GoogleCalendarIcon';
import { NotionIcon } from '../icons/NotionIcon';

interface IntegrationsSettingsProps {
    user: User;
    toggleIntegration: (integrationId: IntegrationId) => void;
    addToast: (message: string, type: 'success' | 'info') => void;
}

const integrations = [
    {
        id: 'slack',
        name: 'Slack',
        description: 'Send article summaries to your Slack channels.',
        icon: <SlackIcon />,
    },
    {
        id: 'google-calendar',
        name: 'Google Calendar',
        description: 'Schedule reading time for saved articles.',
        icon: <GoogleCalendarIcon />,
    },
    {
        id: 'notion',
        name: 'Notion',
        description: 'Save articles and key points to your Notion workspace.',
        icon: <NotionIcon />,
    },
];

const IntegrationsSettings: React.FC<IntegrationsSettingsProps> = ({ user, toggleIntegration, addToast }) => {
    
    const handleToggle = (integrationId: IntegrationId, name: string) => {
        toggleIntegration(integrationId);
        const isConnected = !user.integrations[integrationId];
        addToast(
            `${name} has been ${isConnected ? 'connected' : 'disconnected'}.`,
            isConnected ? 'success' : 'info'
        );
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Integrations</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Connect your favorite apps to supercharge your workflow.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map(integration => (
                     <div key={integration.id} className="p-4 border dark:border-gray-700 rounded-lg flex items-start space-x-4">
                        <div className="flex-shrink-0 text-gray-800 dark:text-white">
                            {integration.icon}
                        </div>
                        <div className="flex-grow">
                             <h4 className="font-semibold text-gray-700 dark:text-gray-300">{integration.name}</h4>
                             <p className="text-xs text-gray-500 dark:text-gray-400">{integration.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                             <ToggleSwitch
                                id={`integration-${integration.id}`}
                                checked={user.integrations[integration.id as IntegrationId] || false}
                                onChange={() => handleToggle(integration.id as IntegrationId, integration.name)}
                             />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IntegrationsSettings;