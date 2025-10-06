import React, { useState } from 'react';
import { User, Article } from '../types';
import * as newsService from '../services/newsService';
import { useToast } from '../contexts/ToastContext';
import { NewspaperIcon } from '../components/icons/NewspaperIcon';
import { UserGroupIcon } from '../components/icons/UserGroupIcon';
import { ALL_CATEGORIES } from '../constants';

type ArticleFormData = Omit<Article, 'id' | 'publishedAt' | 'source' | 'url' | 'isOffline'>;

const ArticleManager: React.FC = () => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState<ArticleFormData>({
        title: '',
        description: '',
        body: '',
        author: '',
        category: 'World',
        urlToImage: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            newsService.addArticle(formData);
            addToast('Article uploaded successfully!', 'success');
            // Reset form
            setFormData({
                title: '', description: '', body: '', author: '', category: 'World', urlToImage: ''
            });
        } catch (error) {
            addToast('Failed to upload article.', 'error');
            console.error(error);
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Upload New Article</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium">Title</label>
                    <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                </div>
                 <div>
                    <label htmlFor="description" className="block text-sm font-medium">Description</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                </div>
                 <div>
                    <label htmlFor="body" className="block text-sm font-medium">Body</label>
                    <textarea name="body" id="body" value={formData.body} onChange={handleChange} required rows={6} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="author" className="block text-sm font-medium">Author</label>
                        <input type="text" name="author" id="author" value={formData.author} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                    </div>
                     <div>
                        <label htmlFor="category" className="block text-sm font-medium">Category</label>
                        <select name="category" id="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500">
                           {ALL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label htmlFor="urlToImage" className="block text-sm font-medium">Image URL</label>
                    <input type="url" name="urlToImage" id="urlToImage" value={formData.urlToImage} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                </div>
                <div className="text-right">
                    <button type="submit" className="px-5 py-2.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-semibold">
                        Publish Article
                    </button>
                </div>
            </form>
        </div>
    );
};

const UserManager: React.FC<{ addAdmin: (email: string) => void; adminEmails: string[] }> = ({ addAdmin, adminEmails }) => {
    const [email, setEmail] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            addAdmin(email);
            setEmail('');
        }
    };
    
    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Manage Administrators</h3>
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <h4 className="font-semibold mb-2">Current Admins</h4>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                    {adminEmails.map(adminEmail => <li key={adminEmail}>{adminEmail}</li>)}
                </ul>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <h4 className="font-semibold text-lg">Add New Admin</h4>
                 <div>
                    <label htmlFor="new-admin-email" className="block text-sm font-medium">User Email</label>
                    <input type="email" id="new-admin-email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="user@example.com" className="mt-1 block w-full md:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                </div>
                 <div className="text-left">
                    <button type="submit" className="px-5 py-2.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-semibold">
                        Grant Admin Access
                    </button>
                </div>
            </form>
        </div>
    );
};

type AdminTab = 'articles' | 'users';

const AdminPage: React.FC<{ user: User; addAdmin: (email: string) => void; adminEmails: string[] }> = ({ user, addAdmin, adminEmails }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('articles');
    
    const tabs = [
        { id: 'articles', label: 'Manage Articles', icon: <NewspaperIcon className="w-5 h-5" /> },
        { id: 'users', label: 'Manage Users', icon: <UserGroupIcon className="w-5 h-5" /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'articles':
                return <ArticleManager />;
            case 'users':
                return <UserManager addAdmin={addAdmin} adminEmails={adminEmails} />;
            default:
                return null;
        }
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                <aside className="md:w-1/4 lg:w-1/5">
                    <nav className="flex flex-col space-y-2">
                        {tabs.map(tab => (
                             <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as AdminTab)}
                                className={`flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors w-full text-left ${
                                    activeTab === tab.id 
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                               {tab.icon}
                               <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>
                <div className="flex-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;