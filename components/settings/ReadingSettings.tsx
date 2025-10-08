import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import { ReadingSettings as ReadingSettingsType, User } from '../../types';
import ToggleSwitch from '../ToggleSwitch';
import { LockIcon } from '../icons/LockIcon';

interface ReadingSettingsProps {
    user: User | null;
    onUpgradeClick: () => void;
}

const ReadingSettings: React.FC<ReadingSettingsProps> = ({ user, onUpgradeClick }) => {
    const { settings, updateSettings } = useSettings();
    const isPremium = user?.subscription === 'premium' || user?.subscription === 'pro';

    const handleReadingChange = (setting: Partial<ReadingSettingsType>) => {
        updateSettings(s => ({ ...s, reading: { ...s.reading, ...setting } }));
    };
    
    const handlePremiumToggle = (key: keyof ReadingSettingsType, value: boolean) => {
        if (isPremium) {
            handleReadingChange({ [key]: value });
        } else {
            onUpgradeClick();
        }
    };


    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Reading Experience</h3>
            <p className="text-muted-foreground mb-6">Customize how articles are displayed for your comfort.</p>
            
            <div className="space-y-6">
                 <div>
                    <label htmlFor="lineHeight" className="block text-sm font-medium mb-2">Line Height ({settings.reading.lineHeight.toFixed(1)})</label>
                    <input
                        type="range"
                        id="lineHeight"
                        min="1.2"
                        max="2.2"
                        step="0.1"
                        value={settings.reading.lineHeight}
                        onChange={e => handleReadingChange({ lineHeight: parseFloat(e.target.value) })}
                        className="w-full max-w-sm h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                </div>
                <div>
                    <label htmlFor="letterSpacing" className="block text-sm font-medium mb-2">Letter Spacing ({settings.reading.letterSpacing.toFixed(1)}px)</label>
                    <input
                        type="range"
                        id="letterSpacing"
                        min="-0.5"
                        max="1.5"
                        step="0.1"
                        value={settings.reading.letterSpacing}
                        onChange={e => handleReadingChange({ letterSpacing: parseFloat(e.target.value) })}
                        className="w-full max-w-sm h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                </div>
                <div className="p-4 border border-border rounded-lg flex items-center justify-between max-w-md">
                    <div>
                        <label htmlFor="justifyText" className="font-medium">Justify Paragraphs</label>
                        <p className="text-xs text-muted-foreground">Align text to both left and right margins.</p>
                    </div>
                    <ToggleSwitch 
                        id="justifyText" 
                        checked={settings.reading.justifyText} 
                        onChange={e => handleReadingChange({ justifyText: e.target.checked })} 
                    />
                </div>
                
                <div className="border-t pt-6 space-y-4">
                    <div className={`p-4 border ${isPremium ? 'border-border' : 'bg-secondary/50 border-border'} rounded-lg flex items-center justify-between max-w-md`}>
                        <div>
                            <div className="flex items-center space-x-2">
                                <label htmlFor="autoPlayAudio" className={`font-medium ${!isPremium && 'text-muted-foreground'}`}>Auto-play Audio</label>
                                {!isPremium && <span className="text-xs bg-accent/20 text-accent font-semibold px-2 py-0.5 rounded-full">Premium</span>}
                            </div>
                            <p className={`text-xs ${isPremium ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>Start audio automatically when opening an article.</p>
                        </div>
                         <div className="flex items-center space-x-2">
                            {!isPremium && <LockIcon className="w-4 h-4 text-muted-foreground"/>}
                            <ToggleSwitch id="autoPlayAudio" checked={settings.reading.autoPlayAudio} onChange={(e) => handlePremiumToggle('autoPlayAudio', e.target.checked)} disabled={!isPremium} />
                        </div>
                    </div>
                     <div className={`p-4 border ${isPremium ? 'border-border' : 'bg-secondary/50 border-border'} rounded-lg flex items-center justify-between max-w-md`}>
                        <div>
                            <div className="flex items-center space-x-2">
                                <label htmlFor="defaultSummaryView" className={`font-medium ${!isPremium && 'text-muted-foreground'}`}>Auto-summarize Articles</label>
                                {!isPremium && <span className="text-xs bg-accent/20 text-accent font-semibold px-2 py-0.5 rounded-full">Premium</span>}
                            </div>
                            <p className={`text-xs ${isPremium ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>Generate and show AI summary on article open.</p>
                        </div>
                         <div className="flex items-center space-x-2">
                            {!isPremium && <LockIcon className="w-4 h-4 text-muted-foreground"/>}
                            <ToggleSwitch id="defaultSummaryView" checked={settings.reading.defaultSummaryView} onChange={(e) => handlePremiumToggle('defaultSummaryView', e.target.checked)} disabled={!isPremium} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReadingSettings;