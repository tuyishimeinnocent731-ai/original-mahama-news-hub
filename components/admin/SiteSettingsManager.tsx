import React, { useState } from 'react';
import ToggleSwitch from '../ToggleSwitch';

interface SiteSettings {
  siteName: string;
  maintenanceMode: boolean;
}

interface SiteSettingsManagerProps {
    settings: SiteSettings;
    onUpdateSettings: (newSettings: Partial<SiteSettings>) => void;
}

const SiteSettingsManager: React.FC<SiteSettingsManagerProps> = ({ settings, onUpdateSettings }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: checked }));
    };

    const handleSave = () => {
        onUpdateSettings(localSettings);
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Site Settings</h3>
            <div className="space-y-6 max-w-lg">
                <div className="p-4 border rounded-lg border-border">
                    <label htmlFor="siteName" className="block text-sm font-medium mb-1">Site Name</label>
                    <input type="text" name="siteName" id="siteName" value={localSettings.siteName} onChange={handleChange} className="block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
                </div>
                <div className="p-4 border border-yellow-500/50 rounded-lg bg-yellow-500/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <label htmlFor="maintenanceMode" className="font-medium text-yellow-800 dark:text-yellow-200">Maintenance Mode</label>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">Puts up a banner and restricts site access for non-admins.</p>
                        </div>
                        <ToggleSwitch id="maintenanceMode" name="maintenanceMode" checked={localSettings.maintenanceMode} onChange={handleToggle} />
                    </div>
                </div>
                 <div className="text-right">
                    <button onClick={handleSave} className="px-5 py-2.5 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-semibold">Save Settings</button>
                </div>
            </div>
        </div>
    );
};

export default SiteSettingsManager;