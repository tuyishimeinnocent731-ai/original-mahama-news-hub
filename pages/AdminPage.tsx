import React, { useState, useEffect, useMemo } from 'react';
import { User, Article, Ad, SubscriptionPlan } from '../types';
import { NewspaperIcon } from '../components/icons/NewspaperIcon';
import { UserGroupIcon } from '../components/icons/UserGroupIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { ArrowUpCircleIcon } from '../components/icons/ArrowUpCircleIcon';
import { ArrowDownCircleIcon } from '../components/icons/ArrowDownCircleIcon';
import { ChartPieIcon } from '../components/icons/ChartPieIcon';
import { MegaphoneIcon } from '../components/icons/MegaphoneIcon';
import { ALL_CATEGORIES } from '../constants';
import { SettingsIcon } from '../components/icons/SettingsIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import ToggleSwitch from '../components/ToggleSwitch';
import { BillingIcon } from '../components/icons/BillingIcon';

type ArticleFormData = Omit<Article, 'id' | 'publishedAt' | 'source' | 'url' | 'isOffline'>;
type AdFormData = Omit<Ad, 'id'>;
interface SiteSettings {
  siteName: string;
  maintenanceMode: boolean;
}

const ContentPieChart: React.FC<{ articles: Article[] }> = ({ articles }) => {
    // FIX: Explicitly typing the accumulator in the reduce function to prevent potential type inference errors.
    const categoryCounts = articles.reduce((acc: Record<string, number>, article) => {
        acc[article.category] = (acc[article.category] || 0) + 1;
        return acc;
    }, {});

    const total = articles.length;
    if (total === 0) return <div className="text-center text-sm text-gray-500">No articles to display.</div>;

    const colors = ['#FBBF24', '#60A5FA', '#34D399', '#F87171', '#A78BFA', '#F472B6'];
    const segments = Object.entries(categoryCounts);
    let accumulatedOffset = 0;

    return (
        <div className="flex items-center justify-center space-x-6">
            <svg width="150" height="150" viewBox="0 0 100 100" className="chart-pie">
                <circle r="25" cx="50" cy="50" fill="transparent" stroke="#E5E7EB" strokeWidth="50"></circle>
                {segments.map(([category, count], index) => {
                    const percentage = (count / total) * 100;
                    const offset = accumulatedOffset;
                    accumulatedOffset += percentage;
                    return (
                        <circle
                            key={category}
                            r="25"
                            cx="50"
                            cy="50"
                            fill="transparent"
                            stroke={colors[index % colors.length]}
                            strokeWidth="50"
                            strokeDasharray={`${percentage} ${100 - percentage}`}
                            strokeDashoffset={0 - offset}
                            className="chart-pie-segment"
                        />
                    );
                })}
            </svg>
            <div className="text-sm space-y-2">
                {segments.map(([category, count], index) => (
                    <div key={category} className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index % colors.length] }}></span>
                        <span>{category} ({count})</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface DashboardProps {
    users: User[];
    articles: Article[];
    ads: Ad[];
}

const Dashboard: React.FC<DashboardProps> = ({ users, articles, ads }) => {
    const totalUsers = users.length;
    const totalArticles = articles.length;
    const totalAds = ads.length;
    const subscriptions = users.reduce((acc: Record<string, number>, user) => {
        acc[user.subscription] = (acc[user.subscription] || 0) + 1;
        return acc;
    }, {});

    return (
        <div>
            <h3 className="text-2xl font-bold mb-6">Dashboard Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg shadow-md">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Articles</h4>
                    <p className="text-3xl font-bold mt-2">{totalArticles}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg shadow-md">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Ads</h4>
                    <p className="text-3xl font-bold mt-2">{totalAds}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg shadow-md">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</h4>
                    <p className="text-3xl font-bold mt-2">{totalUsers}</p>
                </div>
                 <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg shadow-md">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Subscriptions</h4>
                    <div className="mt-2 space-y-1">
                        {Object.entries(subscriptions).map(([plan, count]) => (
                             <div key={plan} className="flex justify-between text-sm">
                                <span className="capitalize font-medium">{plan}</span>
                                <span className="font-semibold">{count}</span>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg shadow-md">
                    <h4 className="text-lg font-semibold mb-4">Content Distribution</h4>
                    <ContentPieChart articles={articles} />
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg shadow-md">
                    <h4 className="text-lg font-semibold mb-4">User Roles</h4>
                     <p>Coming Soon</p>
                </div>
            </div>
        </div>
    );
};


interface ArticleManagerProps {
    onAddArticle: (data: ArticleFormData) => void;
    onUpdateArticle: (id: string, data: ArticleFormData) => void;
    allArticles: Article[];
    onDeleteArticle: (id: string) => void;
}

const ArticleManager: React.FC<ArticleManagerProps> = ({ onAddArticle, onUpdateArticle, allArticles, onDeleteArticle }) => {
    const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
    const initialFormState: ArticleFormData = { title: '', description: '', body: '', author: '', category: 'World', urlToImage: '' };
    const [formData, setFormData] = useState<ArticleFormData>(initialFormState);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (editingArticleId) {
            const articleToEdit = allArticles.find(a => a.id === editingArticleId);
            if (articleToEdit) {
                setFormData({
                    title: articleToEdit.title,
                    description: articleToEdit.description,
                    body: articleToEdit.body,
                    author: articleToEdit.author,
                    category: articleToEdit.category,
                    urlToImage: articleToEdit.urlToImage,
                });
                setImagePreview(articleToEdit.urlToImage);
            }
        } else {
            setFormData(initialFormState);
            setImagePreview(null);
        }
    }, [editingArticleId, allArticles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData(prev => ({ ...prev, urlToImage: base64String }));
                setImagePreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingArticleId) {
            onUpdateArticle(editingArticleId, formData);
        } else {
            onAddArticle(formData);
        }
        setEditingArticleId(null);
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleCancelEdit = () => {
        setEditingArticleId(null);
    };

    return (
        <div className="space-y-12">
            <div>
                <h3 className="text-2xl font-bold mb-4">{editingArticleId ? 'Edit Article' : 'Upload New Article'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg dark:border-gray-700">
                    <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                    <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required rows={3} className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                    <textarea name="body" placeholder="Body" value={formData.body} onChange={handleChange} required rows={6} className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="author" placeholder="Author" value={formData.author} onChange={handleChange} required className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                        <select name="category" value={formData.category} onChange={handleChange} required className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500">
                            {ALL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="image-upload" className="block text-sm font-medium mb-1">Featured Image</label>
                        <input type="file" name="image" id="image-upload" onChange={handleImageChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 dark:file:bg-gray-600 dark:file:text-gray-200" />
                    </div>
                    {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 rounded-md max-h-48" />}
                    <div className="text-right flex justify-end gap-3">
                        {editingArticleId && (
                            <button type="button" onClick={handleCancelEdit} className="px-5 py-2.5 bg-gray-200 dark:bg-gray-600 text-black dark:text-white rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                        )}
                        <button type="submit" className="px-5 py-2.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-semibold">{editingArticleId ? 'Update Article' : 'Publish Article'}</button>
                    </div>
                </form>
            </div>
            <div>
                 <h3 className="text-2xl font-bold mb-4">Existing Articles</h3>
                 <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                     <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell">Category</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {allArticles.map(article => (
                                <tr key={article.id}>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium max-w-xs truncate">{article.title}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm">{article.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                        <button onClick={() => setEditingArticleId(article.id)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"><PencilIcon /></button>
                                        <button onClick={() => { if(window.confirm('Are you sure?')) onDeleteArticle(article.id); }} className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400"><TrashIcon /></button>
                                    </td>
                                </tr>
                            ))}
                         </tbody>
                     </table>
                 </div>
            </div>
        </div>
    );
};

interface AdManagerProps {
    onAddAd: (data: AdFormData) => void;
    onUpdateAd: (id: string, data: AdFormData) => void;
    allAds: Ad[];
    onDeleteAd: (id: string) => void;
}

const AdManager: React.FC<AdManagerProps> = ({ onAddAd, onUpdateAd, allAds, onDeleteAd }) => {
    const initialFormState: AdFormData = { headline: '', url: '', image: '' };
    const [editingAdId, setEditingAdId] = useState<string | null>(null);
    const [formData, setFormData] = useState<AdFormData>(initialFormState);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

     useEffect(() => {
        if (editingAdId) {
            const adToEdit = allAds.find(a => a.id === editingAdId);
            if (adToEdit) {
                setFormData(adToEdit);
                setImagePreview(adToEdit.image);
            }
        } else {
            setFormData(initialFormState);
            setImagePreview(null);
        }
    }, [editingAdId, allAds]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData(prev => ({ ...prev, image: base64String }));
                setImagePreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAdId) {
            onUpdateAd(editingAdId, formData);
        } else {
            onAddAd(formData);
        }
        setEditingAdId(null);
        const fileInput = document.getElementById('ad-image-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleCancelEdit = () => {
        setEditingAdId(null);
    };

    return (
        <div className="space-y-12">
            <div>
                <h3 className="text-2xl font-bold mb-4">{editingAdId ? 'Edit Advertisement' : 'Create New Advertisement'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg dark:border-gray-700">
                    <input type="text" name="headline" value={formData.headline} onChange={handleChange} placeholder="Headline" required className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                    <input type="url" name="url" value={formData.url} onChange={handleChange} placeholder="https://example.com" required className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                    <div>
                        <label htmlFor="ad-image-upload" className="block text-sm font-medium mb-1">Ad Image</label>
                        <input type="file" name="image" id="ad-image-upload" onChange={handleImageChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 dark:file:bg-gray-600 dark:file:text-gray-200" />
                    </div>
                    {imagePreview && <img src={imagePreview} alt="Ad Preview" className="mt-2 rounded-md max-h-48" />}
                    <div className="text-right flex justify-end gap-3">
                         {editingAdId && (
                            <button type="button" onClick={handleCancelEdit} className="px-5 py-2.5 bg-gray-200 dark:bg-gray-600 text-black dark:text-white rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                        )}
                        <button type="submit" className="px-5 py-2.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-semibold">{editingAdId ? 'Update Ad' : 'Create Ad'}</button>
                    </div>
                </form>
            </div>
            <div>
                 <h3 className="text-2xl font-bold mb-4">Existing Ads</h3>
                 <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                     <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Image</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Headline</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {allAds.map(ad => (
                                <tr key={ad.id}>
                                    <td className="px-6 py-4 whitespace-nowrap"><img src={ad.image} alt={ad.headline} className="w-16 h-10 object-cover rounded"/></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium max-w-xs truncate">{ad.headline}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                        <button onClick={() => setEditingAdId(ad.id)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"><PencilIcon /></button>
                                        <button onClick={() => { if(window.confirm('Are you sure?')) onDeleteAd(ad.id); }} className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400"><TrashIcon /></button>
                                    </td>
                                </tr>
                            ))}
                         </tbody>
                     </table>
                 </div>
            </div>
        </div>
    );
};

interface UserManagerProps {
    currentUser: User;
    getAllUsers: () => User[];
    updateUserRole: (email: string, newRole: 'admin' | 'sub-admin' | 'user') => boolean;
    deleteUser: (email: string) => boolean;
}

const UserManager: React.FC<UserManagerProps> = ({ currentUser, getAllUsers, updateUserRole, deleteUser }) => {
    const users = useMemo(() => {
        const all = getAllUsers();
        const roleOrder = { admin: 1, 'sub-admin': 2, user: 3 };
        return all.sort((a, b) => (roleOrder[a.role || 'user'] || 3) - (roleOrder[b.role || 'user'] || 3));
    }, [getAllUsers]);

    const [refreshKey, setRefreshKey] = useState(0);

    const handleRoleChange = (email: string, newRole: 'admin' | 'sub-admin' | 'user') => {
        if (updateUserRole(email, newRole)) {
            setRefreshKey(k => k + 1);
        }
    };

    const handleDeleteUser = (email: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete user ${name}? This action cannot be undone.`)) {
            if (deleteUser(email)) {
                setRefreshKey(k => k + 1);
            }
        }
    };

    const renderUserGroup = (title: string, users: User[]) => (
        <div key={title}>
            <h4 className="px-6 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">{title}</h4>
            {users.map(user => (
                <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                            <div className="ml-4">
                                <div className="text-sm font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : user.role === 'sub-admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>
                            {user.role}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {user.email !== 'reponsekdz0@gmail.com' && (
                            <>
                                <select 
                                    value={user.role} 
                                    onChange={(e) => handleRoleChange(user.email, e.target.value as any)}
                                    className="text-sm p-1 rounded bg-gray-100 dark:bg-gray-700"
                                >
                                    <option value="user">User</option>
                                    <option value="sub-admin">Sub-Admin</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <button onClick={() => handleDeleteUser(user.email, user.name)} className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400"><TrashIcon /></button>
                            </>
                        )}
                    </td>
                </tr>
            ))}
        </div>
    );
    
    const adminUsers = users.filter(u => u.role === 'admin' && u.email === currentUser.email);
    const subAdminUsers = users.filter(u => u.role === 'sub-admin' || (u.role === 'admin' && u.email !== currentUser.email));
    const endUsers = users.filter(u => u.role === 'user');

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Manage Users</h3>
            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" key={refreshKey}>
                        {renderUserGroup('Me as Admin', adminUsers)}
                        {renderUserGroup('Sub Admins & Other Admins', subAdminUsers)}
                        {renderUserGroup('End Users', endUsers)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface SubscriptionManagerProps {
    getAllUsers: () => User[];
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ getAllUsers }) => {
    const users = getAllUsers();
    
    const planColors: Record<SubscriptionPlan, string> = {
        free: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
        standard: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        premium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        pro: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    };

    return (
         <div>
            <h3 className="text-2xl font-bold mb-4">Subscriptions & Payments</h3>
            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                         <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Subscription</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Last Payment</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                                        <div className="ml-4">
                                            <div className="text-sm font-medium">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${planColors[user.subscription]}`}>
                                        {user.subscription}
                                    </span>
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {user.paymentHistory.length > 0 ? (
                                        <div>
                                            <span>{user.paymentHistory[0].amount}</span>
                                            <span className="ml-2">({new Date(user.paymentHistory[0].date).toLocaleDateString()})</span>
                                        </div>
                                    ) : (
                                        <span>N/A</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


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
                <div className="p-4 border rounded-lg dark:border-gray-700">
                    <label htmlFor="siteName" className="block text-sm font-medium mb-1">Site Name</label>
                    <input type="text" name="siteName" id="siteName" value={localSettings.siteName} onChange={handleChange} className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500" />
                </div>
                <div className="p-4 border border-yellow-500/50 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <label htmlFor="maintenanceMode" className="font-medium text-yellow-800 dark:text-yellow-200">Maintenance Mode</label>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">Puts up a banner and restricts site access for non-admins.</p>
                        </div>
                        <ToggleSwitch id="maintenanceMode" name="maintenanceMode" checked={localSettings.maintenanceMode} onChange={handleToggle} />
                    </div>
                </div>
                 <div className="text-right">
                    <button onClick={handleSave} className="px-5 py-2.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-semibold">Save Settings</button>
                </div>
            </div>
        </div>
    );
};

type AdminTab = 'dashboard' | 'articles' | 'ads' | 'users' | 'settings' | 'subscriptions';

interface AdminPageProps {
    user: User;
    allArticles: Article[];
    allAds: Ad[];
    onAddArticle: (data: ArticleFormData) => void;
    onUpdateArticle: (id: string, data: ArticleFormData) => void;
    onDeleteArticle: (id: string) => void;
    onAddAd: (data: AdFormData) => void;
    onUpdateAd: (id: string, data: AdFormData) => void;
    onDeleteAd: (id: string) => void;
    getAllUsers: () => User[];
    updateUserRole: (email: string, newRole: 'admin' | 'sub-admin' | 'user') => boolean;
    deleteUser: (email: string) => boolean;
    siteSettings: SiteSettings;
    onUpdateSiteSettings: (newSettings: Partial<SiteSettings>) => void;
}

const AdminPage: React.FC<AdminPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    
    const allTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <ChartPieIcon className="w-5 h-5" />, roles: ['admin', 'sub-admin'] },
        { id: 'articles', label: 'Manage Articles', icon: <NewspaperIcon className="w-5 h-5" />, roles: ['admin', 'sub-admin'] },
        { id: 'ads', label: 'Manage Ads', icon: <MegaphoneIcon className="w-5 h-5" />, roles: ['admin'] },
        { id: 'users', label: 'Manage Users', icon: <UserGroupIcon className="w-5 h-5" />, roles: ['admin'] },
        { id: 'subscriptions', label: 'Subscriptions', icon: <BillingIcon className="w-5 h-5" />, roles: ['admin'] },
        { id: 'settings', label: 'Site Settings', icon: <SettingsIcon />, roles: ['admin'] },
    ];
    
    const visibleTabs = allTabs.filter(tab => tab.roles.includes(props.user.role || 'user'));

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard users={props.getAllUsers()} articles={props.allArticles} ads={props.allAds} />;
            case 'articles':
                return <ArticleManager onAddArticle={props.onAddArticle} onUpdateArticle={props.onUpdateArticle} allArticles={props.allArticles} onDeleteArticle={props.onDeleteArticle} />;
            case 'ads':
                return <AdManager onAddAd={props.onAddAd} onUpdateAd={props.onUpdateAd} allAds={props.allAds} onDeleteAd={props.onDeleteAd} />;
            case 'users':
                return <UserManager currentUser={props.user} getAllUsers={props.getAllUsers} updateUserRole={props.updateUserRole} deleteUser={props.deleteUser} />;
            case 'subscriptions':
                return <SubscriptionManager getAllUsers={props.getAllUsers} />;
            case 'settings':
                return <SiteSettingsManager settings={props.siteSettings} onUpdateSettings={props.onUpdateSiteSettings} />;
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
                        {visibleTabs.map(tab => (
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
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
