import React, { useState } from 'react';
import { User, Ad } from '../types';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';
import { MegaphoneIcon } from '../components/icons/MegaphoneIcon';

interface MyAdsPageProps {
    user: User | null;
    onBack: () => void;
    onCreateAd: (ad: Omit<Ad, 'id'>) => void;
}

const MyAdsPage: React.FC<MyAdsPageProps> = ({ user, onBack, onCreateAd }) => {
    const [headline, setHeadline] = useState('');
    const [url, setUrl] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    if (!user || (user.subscription !== 'pro' && user.role !== 'admin')) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold">This feature is available for Pro subscribers or Admins only.</h1>
                <button onClick={onBack} className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md">Go Back</button>
            </div>
        );
    }
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImage(base64String);
                setImagePreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (headline && url && image) {
            onCreateAd({ headline, url, image });
            setHeadline('');
            setUrl('');
            setImage(null);
            setImagePreview(null);
            const fileInput = document.getElementById('ad-image-upload') as HTMLInputElement;
            if(fileInput) fileInput.value = '';
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
             <button onClick={onBack} className="flex items-center space-x-2 text-yellow-500 hover:underline mb-6 font-semibold">
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to News</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                        <h2 className="text-2xl font-bold mb-4">Create New Ad</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="headline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Headline</label>
                                <input type="text" id="headline" value={headline} onChange={e => setHeadline(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                            </div>
                            <div>
                                <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target URL</label>
                                <input type="url" id="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                            </div>
                            <div>
                                <label htmlFor="ad-image-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image</label>
                                <input id="ad-image-upload" type="file" onChange={handleImageChange} accept="image/*" required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100" />
                            </div>
                             {imagePreview && <img src={imagePreview} alt="Ad preview" className="mt-4 rounded-md w-full object-cover" />}
                            <button type="submit" className="w-full px-5 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-semibold">
                                Create Advertisement
                            </button>
                        </form>
                    </div>
                </div>
                <div className="lg:col-span-2">
                     <h2 className="text-2xl font-bold mb-4">Your Active Ads</h2>
                     {user.userAds.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {user.userAds.map(ad => (
                                <div key={ad.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                                    <img src={ad.image} alt={ad.headline} className="w-full h-40 object-cover" />
                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg">{ad.headline}</h3>
                                        <a href={ad.url} target="_blank" rel="noopener noreferrer" className="text-sm text-yellow-500 hover:underline truncate block">{ad.url}</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                     ) : (
                         <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <MegaphoneIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
                            <h2 className="text-xl font-semibold">You haven't created any ads yet.</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                Use the form to create your first advertisement.
                            </p>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default MyAdsPage;