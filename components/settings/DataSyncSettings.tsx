

import React, { useRef } from 'react';
import { User } from '../../types';
import { useSettings } from '../../hooks/useSettings';
import { useToast } from '../../contexts/ToastContext';
import * as userService from '../../services/userService';

interface DataSyncSettingsProps {
    user: User;
}

const DataSyncSettings: React.FC<DataSyncSettingsProps> = ({ user }) => {
    const { settings, updateSettings } = useSettings();
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = async () => {
        try {
            const dataToExport = await userService.exportUserData();
            const dataStr = JSON.stringify(dataToExport, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `mahamanews_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            addToast('Data exported successfully!', 'success');
        } catch (error: any) {
            addToast(error.message || 'Failed to export data.', 'error');
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("Invalid file content");
                
                const importedData = JSON.parse(text);

                if (importedData.settings) {
                    updateSettings(prev => ({...prev, ...importedData.settings}));
                }
                
                // Note: Importing profile and saved articles would require dedicated API endpoints
                // and is currently just logged to console.
                console.log("Imported Profile Data:", importedData.profile);
                console.log("Imported Saved Articles:", importedData.savedArticles);

                addToast('Settings imported successfully!', 'success');
            } catch (error) {
                console.error("Error importing data:", error);
                addToast('Failed to import data. The file may be corrupt.', 'error');
            } finally {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.readAsText(file);
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Data & Sync</h3>
            <p className="text-muted-foreground mb-6">Manage your personal data. Export your settings and preferences or import them to a new device.</p>

            <div className="space-y-4 max-w-md">
                <div className="p-4 border dark:border-gray-700 rounded-lg">
                    <h4 className="font-medium">Export Your Data</h4>
                    <p className="text-xs text-muted-foreground mb-3">Download a file containing your profile, settings, and saved articles.</p>
                    <button onClick={handleExport} className="px-4 py-2 bg-accent text-accent-foreground text-sm font-semibold rounded-md hover:bg-accent/90">
                        Export Data
                    </button>
                </div>
                <div className="p-4 border dark:border-gray-700 rounded-lg">
                    <h4 className="font-medium">Import Data</h4>
                    <p className="text-xs text-muted-foreground mb-3">Load your settings and preferences from a backup file.</p>
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".json"
                        className="hidden"
                        id="import-file-input"
                    />
                    <label htmlFor="import-file-input" className="cursor-pointer px-4 py-2 border border-border text-sm font-semibold rounded-md hover:bg-secondary">
                        Import from File
                    </label>
                </div>
            </div>
        </div>
    );
};

export default DataSyncSettings;