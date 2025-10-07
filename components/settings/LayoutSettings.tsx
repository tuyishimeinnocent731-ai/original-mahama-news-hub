import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import { LayoutSettings as LayoutSettingsType } from '../../types';
import ToggleSwitch from '../ToggleSwitch';

type HomepageLayout = LayoutSettingsType['homepage'];
type Density = LayoutSettingsType['density'];

const LayoutSettings: React.FC = () => {
    const { settings, updateSettings } = useSettings();

    const handleLayoutChange = (layout: Partial<LayoutSettingsType>) => {
        updateSettings({ layout });
    };

    const homepageOptions: { value: HomepageLayout; label: string }[] = [
        { value: 'grid', label: 'Grid' },
        { value: 'list', label: 'List' },
        { value: 'magazine', label: 'Magazine' },
    ];
    
    const densityOptions: { value: Density; label: string }[] = [
        { value: 'compact', label: 'Compact' },
        { value: 'comfortable', label: 'Comfortable' },
        { value: 'spacious', label: 'Spacious' },
    ];


    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Layout & Content</h3>
            <p className="text-muted-foreground mb-6">Adjust how content is displayed throughout the application.</p>
            
            <div className="space-y-8">
                <div>
                    <label className="block text-sm font-medium mb-2">Homepage Layout</label>
                    <div className="flex items-center space-x-2 bg-secondary p-1 rounded-lg max-w-sm">
                        {homepageOptions.map(option => (
                             <button
                                key={option.value}
                                onClick={() => handleLayoutChange({ homepage: option.value })}
                                className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${settings.layout.homepage === option.value ? 'bg-card text-accent shadow' : 'hover:bg-card/50'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                 <div>
                    <label className="block text-sm font-medium mb-2">Content Density</label>
                    <div className="flex items-center space-x-2 bg-secondary p-1 rounded-lg max-w-sm">
                        {densityOptions.map(option => (
                             <button
                                key={option.value}
                                onClick={() => handleLayoutChange({ density: option.value })}
                                className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${settings.layout.density === option.value ? 'bg-card text-accent shadow' : 'hover:bg-card/50'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                 <div className="p-4 border border-border rounded-lg flex items-center justify-between max-w-sm">
                    <div>
                        <label htmlFor="infiniteScroll" className="font-medium">Infinite Scroll</label>
                        <p className="text-xs text-muted-foreground">Load more articles as you scroll down.</p>
                    </div>
                    <ToggleSwitch 
                        id="infiniteScroll" 
                        checked={settings.layout.infiniteScroll} 
                        onChange={(e) => handleLayoutChange({ infiniteScroll: e.target.checked })} 
                    />
                </div>
            </div>
        </div>
    );
};

export default LayoutSettings;
