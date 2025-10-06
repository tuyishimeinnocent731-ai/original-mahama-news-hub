import React from 'react';
import { User } from '../../types';
import { MegaphoneIcon } from '../icons/MegaphoneIcon';

interface MyAdsSettingsProps {
    user: User;
    onManageAdsClick: () => void;
}

const MyAdsSettings: React.FC<MyAdsSettingsProps> = ({ user, onManageAdsClick }) => {
    const canCreateAds = user.subscription === 'pro';

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">My Advertisements</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Manage the ads you've created on our platform.</p>
            
            <div className={`p-4 border dark:border-gray-700 rounded-lg ${!canCreateAds ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">Your Ads</h4>
                            {!canCreateAds && <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 px-2 py-0.5 rounded-full">Pro Feature</span>}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            You have {user.userAds.length} active ad(s).
                        </p>
                    </div>
                    <button 
                        onClick={onManageAdsClick}
                        disabled={!canCreateAds}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-semibold text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Manage Ads
                    </button>
                </div>
                {canCreateAds && user.userAds.length > 0 && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-600 space-y-2">
                        {user.userAds.slice(0, 2).map(ad => (
                            <div key={ad.id} className="flex items-center space-x-3 text-sm">
                                <MegaphoneIcon className="w-4 h-4 text-gray-500" />
                                <span className="font-medium truncate">{ad.headline}</span>
                            </div>
                        ))}
                        {user.userAds.length > 2 && <p className="text-xs text-gray-500">...and {user.userAds.length - 2} more.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAdsSettings;
