
import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import { THEMES, ACCENT_COLORS, FONTS, FONT_WEIGHTS } from '../../constants';
import { ThemeSettings, FontSettings, UiSettings } from '../../types';
import { CheckIcon } from '../icons/CheckIcon';
import { UploadIcon } from '../icons/UploadIcon';

const AppearanceSettings: React.FC = () => {
    const { settings, updateSettings } = useSettings();

    // FIX: Use functional updates for settings to correctly merge partial settings objects and avoid type errors.
    const handleThemeChange = (theme: Partial<ThemeSettings>) => {
        updateSettings(s => ({ ...s, theme: { ...s.theme, ...theme } }));
    };

    const handleFontChange = (font: Partial<FontSettings>) => {
        updateSettings(s => ({ ...s, font: { ...s.font, ...font } }));
    };

    const handleUiChange = (ui: Partial<UiSettings>) => {
        updateSettings(s => ({ ...s, ui: { ...s.ui, ...ui } }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // FIX: Use functional update for nested settings object
                updateSettings(s => ({
                    ...s,
                    theme: { ...s.theme, name: 'image', customImage: base64String }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Appearance</h3>
            <p className="text-muted-foreground mb-6">Customize the look and feel of the application.</p>
            
            <div className="space-y-8">
                {/* Theme Selection */}
                <div>
                    <label className="block text-sm font-medium mb-2">Theme</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {THEMES.map(theme => (
                            <div key={theme.id} className="text-center">
                                <button
                                    onClick={() => handleThemeChange({ name: theme.id as any, customImage: undefined })}
                                    className={`w-full h-16 rounded-lg border-2 flex items-center justify-center transition-all ${settings.theme.name === theme.id ? 'border-accent ring-2 ring-accent' : 'border-border hover:border-accent/70'}`}
                                >
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: `rgb(${theme.palette.light.primary})` }}></div>
                                        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: `rgb(${theme.palette.dark.background})` }}></div>
                                    </div>
                                </button>
                                <span className="text-xs mt-2 block">{theme.name}</span>
                            </div>
                        ))}
                        <div className="text-center">
                            <label htmlFor="image-upload-theme" className={`w-full h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${settings.theme.name === 'image' ? 'border-accent ring-2 ring-accent' : 'border-border hover:border-accent/70'}`}>
                                <UploadIcon className="w-6 h-6"/>
                            </label>
                             <input id="image-upload-theme" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                            <span className="text-xs mt-2 block">Upload Image</span>
                        </div>
                    </div>
                </div>

                {/* Accent Color Selection */}
                <div>
                    <label className="block text-sm font-medium mb-2">Accent Color</label>
                    <div className="flex flex-wrap gap-3">
                        {ACCENT_COLORS.map(color => (
                            <button
                                key={color.id}
                                onClick={() => handleThemeChange({ accent: color.id as any })}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-transform transform hover:scale-110"
                                style={{ backgroundColor: `rgb(${color.rgb})` }}
                                aria-label={`Select ${color.name} accent`}
                            >
                                {settings.theme.accent === color.id && <CheckIcon className="w-6 h-6" style={{ color: `rgb(${color.fgRgb})` }} />}
                            </button>
                        ))}
                    </div>
                </div>

                 {/* UI Customization */}
                <div>
                    <h4 className="text-lg font-semibold mb-4 border-t pt-6">UI Elements</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <label className="block text-sm font-medium mb-2">Card Style</label>
                             <div className="flex items-center space-x-2 bg-secondary p-1 rounded-lg w-full">
                                <button onClick={() => handleUiChange({ cardStyle: 'standard' })} className={`w-full py-1.5 text-sm rounded-md ${settings.ui.cardStyle === 'standard' ? 'bg-card text-accent shadow' : ''}`}>Standard</button>
                                <button onClick={() => handleUiChange({ cardStyle: 'elevated' })} className={`w-full py-1.5 text-sm rounded-md ${settings.ui.cardStyle === 'elevated' ? 'bg-card text-accent shadow' : ''}`}>Elevated</button>
                                <button onClick={() => handleUiChange({ cardStyle: 'outline' })} className={`w-full py-1.5 text-sm rounded-md ${settings.ui.cardStyle === 'outline' ? 'bg-card text-accent shadow' : ''}`}>Outline</button>
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium mb-2">Border Radius</label>
                             <div className="flex items-center space-x-2 bg-secondary p-1 rounded-lg w-full">
                                <button onClick={() => handleUiChange({ borderRadius: 'sharp' })} className={`w-full py-1.5 text-sm rounded-md ${settings.ui.borderRadius === 'sharp' ? 'bg-card text-accent shadow' : ''}`}>Sharp</button>
                                <button onClick={() => handleUiChange({ borderRadius: 'rounded' })} className={`w-full py-1.5 text-sm rounded-md ${settings.ui.borderRadius === 'rounded' ? 'bg-card text-accent shadow' : ''}`}>Rounded</button>
                                <button onClick={() => handleUiChange({ borderRadius: 'pill' })} className={`w-full py-1.5 text-sm rounded-md ${settings.ui.borderRadius === 'pill' ? 'bg-card text-accent shadow' : ''}`}>Pill</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Font Selection */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                    <div>
                        <label htmlFor="font-family" className="block text-sm font-medium mb-2">Font</label>
                        <select
                            id="font-family"
                            value={settings.font.family}
                            onChange={(e) => handleFontChange({ family: e.target.value })}
                            className="w-full p-2 border rounded-md bg-card border-border focus:ring-accent focus:border-accent"
                        >
                            {FONTS.map(font => (
                                <option key={font.family} value={font.family} style={{ fontFamily: font.family }}>
                                    {font.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                         <label className="block text-sm font-medium mb-2">Font Weight</label>
                        <div className="flex items-center space-x-2 bg-secondary p-1 rounded-lg w-full">
                            {FONT_WEIGHTS.map(weight => (
                                <button
                                    key={weight.value}
                                    onClick={() => handleFontChange({ weight: weight.value as any })}
                                    className={`w-full py-1.5 text-sm font-semibold rounded-md transition-colors ${settings.font.weight === weight.value ? 'bg-card text-accent shadow' : 'hover:bg-card/50'}`}
                                >
                                    {weight.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                 <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-secondary-foreground" style={{ fontFamily: `"${settings.font.family}"`, fontWeight: settings.font.weight as any }}>
                        The quick brown fox jumps over the lazy dog.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AppearanceSettings;
