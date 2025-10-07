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
import Modal from '../components/Modal';
import { SearchIcon } from '../components/icons/SearchIcon';
import { CloseIcon } from '../components/icons/CloseIcon';

type ArticleFormData = Omit<Article, 'id' | 'publishedAt' | 'source' | 'url' | 'isOffline'>;
type AdFormData = Omit<Ad, 'id'>;
interface SiteSettings {
  siteName: string;
  maintenanceMode: boolean;
}

const ContentPieChart: React.FC<{ articles: Article[] }> = ({ articles }) => {
    // FIX: Typing the accumulator in reduce is a more robust way to ensure type safety.
    const categoryCounts = articles.reduce((acc: Record<string, number>, article) => {
        acc[article.category] = (acc[article.category] || 0) + 1;
        return acc;
    }, {});

    const total = articles.length;
    if (total === 0) return <div className="text-center text-sm text-muted-foreground">No articles to display.</div>;

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
                            // FIX: Using unary negation `-offset` instead of binary `0 - offset` to resolve the TypeScript error.
                            strokeDashoffset={-offset}
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
                <div className="bg-secondary p-6 rounded-lg shadow-md">
                    <h4 className="text-sm font-medium text-muted-foreground">Total Articles</h4>
                    <p className="text-3xl font-bold mt-2">{totalArticles}</p>
                </div>
                <div className="bg-secondary p-6 rounded-lg shadow-md">
                    <h4 className="text-sm font-medium text-muted-foreground">Total Ads</h4>
                    <p className="text-3xl font-bold mt-2">{totalAds}</p>
                </div>
                <div className="bg-secondary p-6 rounded-lg shadow-md">
                    <h4 className="text-sm font-medium text-muted-foreground">Total Users</h4>
                    <p className="text-3xl font-bold mt-2">{totalUsers}</p>
                </div>
                 <div className="bg-secondary p-6 rounded-lg shadow-md">
                    <h4 className="text-sm font-medium text-muted-foreground">Subscriptions</h4>
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
                <div className="bg-secondary p-6 rounded-lg shadow-md">
                    <h4 className="text-lg font-semibold mb-4">Content Distribution</h4>
                    <ContentPieChart articles={articles} />
                </div>
                <div className="bg-secondary p-6 rounded-lg shadow-md">
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
                <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg border-border">
                    <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required className="block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
                    <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required rows={3} className="block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
                    <textarea name="body" placeholder="Body" value={formData.body} onChange={handleChange} required rows={6} className="block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="author" placeholder="Author" value={formData.author} onChange={handleChange} required className="block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
                        <select name="category" value={formData.category} onChange={handleChange} required className="block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent">
                            {ALL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="image-upload" className="block text-sm font-medium mb-1">Featured Image</label>
                        <input type="file" name="image" id="image-upload" onChange={handleImageChange} accept="image/*" className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/20 file:text-accent hover:file:bg-accent/30" />
                    </div>
                    {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 rounded-md max-h-48" />}
                    <div className="text-right flex justify-end gap-3">
                        {editingArticleId && (
                            <button type="button" onClick={handleCancelEdit} className="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-md hover:bg-muted font-semibold">Cancel</button>
                        )}
                        <button type="submit" className="px-5 py-2.5 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-semibold">{editingArticleId ? 'Update Article' : 'Publish Article'}</button>
                    </div>
                </form>
            </div>
            <div>
                 <h3 className="text-2xl font-bold mb-4">Existing Articles</h3>
                 <div className="overflow-x-auto border rounded-lg border-border">
                     <table className="min-w-full divide-y divide-border">
                        <thead className="bg-secondary">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell">Category</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-card divide-y divide-border">
                            {allArticles.map(article => (
                                <tr key={article.id}>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium max-w-xs truncate">{article.title}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm">{article.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                        <button onClick={() => setEditingArticleId(article.id)} className="text-primary hover:text-primary/80"><PencilIcon /></button>
                                        <button onClick={() => { if(window.confirm('Are you sure?')) onDeleteArticle(article.id); }} className="text-destructive hover:text-destructive/80"><TrashIcon /></button>
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
                <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg border-border">
                    <input type="text" name="headline" value={formData.headline} onChange={handleChange} placeholder="Headline" required className="block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
                    <input type="url" name="url" value={formData.url} onChange={handleChange} placeholder="https://example.com" required className="block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
                    <div>
                        <label htmlFor="ad-image-upload" className="block text-sm font-medium mb-1">Ad Image</label>
                        <input type="file" name="image" id="ad-image-upload" onChange={handleImageChange} accept="image/*" className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/20 file:text-accent hover:file:bg-accent/30" />
                    </div>
                    {imagePreview && <img src={imagePreview} alt="Ad Preview" className="mt-2 rounded-md max-h-48" />}
                    <div className="text-right flex justify-end gap-3">
                         {editingAdId && (
                            <button type="button" onClick={handleCancelEdit} className="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-md hover:bg-muted font-semibold">Cancel</button>
                        )}
                        <button type="submit" className="px-5 py-2.5 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-semibold">{editingAdId ? 'Update Ad' : 'Create Ad'}</button>
                    </div>
                </form>
            </div>
            <div>
                 <h3 className="text-2xl font-bold mb-4">Existing Ads</h3>
                 <div className="overflow-x-auto border rounded-lg border-border">
                     <table className="min-w-full divide-y divide-border">
                        <thead className="bg-secondary">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Image</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Headline</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-card divide-y divide-border">
                            {allAds.map(ad => (
                                <tr key={ad.id}>
                                    <td className="px-6 py-4 whitespace-nowrap"><img src={ad.image} alt={ad.headline} className="w-16 h-10 object-cover rounded"/></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium max-w-xs truncate">{ad.headline}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                        <button onClick={() => setEditingAdId(ad.id)} className="text-primary hover:text-primary/80"><PencilIcon /></button>
                                        <button onClick={() => { if(window.confirm('Are you sure?')) onDeleteAd(ad.id); }} className="text-destructive hover:text-destructive/80"><TrashIcon /></button>
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

const AddSubAdminModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (email: string) => void;
    allUsers: User[];
}> = ({ isOpen, onClose, onAdd, allUsers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const promotableUsers = allUsers.filter(u => 
        u.subscription === 'pro' && 
        u.role === 'user' &&
        (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Promote User to Sub-Admin</h3>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Select a user with a 'Pro' subscription to grant them article management permissions.</p>
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input 
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-accent focus:border-accent"
                    />
                </div>
                <ul className="space-y-2 max-h-80 overflow-y-auto">
                    {promotableUsers.length > 0 ? promotableUsers.map(user => (
                        <li key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
                             <div className="flex items-center">
                                <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                                <div className="ml-3">
                                    <div className="text-sm font-medium">{user.name}</div>
                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                </div>
                            </div>
                            <button onClick={() => onAdd(user.email)} className="px-3 py-1 bg-accent text-accent-foreground text-sm font-semibold rounded-md hover:bg-accent/90">
                                Promote
                            </button>
                        </li>
                    )) : <p className="text-center text-sm text-muted-foreground py-4">No eligible 'Pro' users found.</p>}
                </ul>
            </div>
        </Modal>
    );
};

interface UserManagerProps {
    currentUser: User;
    getAllUsers: () => User[];
    updateUserRole: (email: string, newRole: 'admin' | 'sub-admin' | 'user') => boolean;
    deleteUser: (email: string) => boolean;
}

const UserManager: React.FC<UserManagerProps> = ({ currentUser, getAllUsers, updateUserRole, deleteUser }) => {
    const [view, setView] = useState<'all' | 'subAdmins'>('all');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const users = useMemo(() => getAllUsers(), [getAllUsers, refreshKey]);

    const handleAction = (action: (...args: any[]) => boolean, ...args: any[]) => {
        if (action(...args)) {
            setRefreshKey(k => k + 1);
        }
    };
    
    const handleAddSubAdmin = (email: string) => {
        handleAction(updateUserRole, email, 'sub-admin');
        setAddModalOpen(false);
    };

    const handleDeleteUser = (email: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete user ${name}? This action cannot be undone.`)) {
            handleAction(deleteUser, email);
        }
    };

    const renderAllUsersView = () => {
        const adminUsers = users.filter(u => u.role === 'admin' && u.email === 'reponsekdz0@gmail.com');
        const subAdminUsers = users.filter(u => u.role === 'sub-admin' || (u.role === 'admin' && u.email !== 'reponsekdz0@gmail.com'));
        const endUsers = users.filter(u => u.role === 'user');

        const renderUserGroup = (title: string, usersToRender: User[]) => (
            <React.Fragment key={title}>
                <tr className="bg-secondary"><td colSpan={3} className="px-6 py-2 text-sm font-semibold text-secondary-foreground">{title}</td></tr>
                {usersToRender.map(user => (
                    <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                                <div className="ml-4">
                                    <div className="text-sm font-medium">{user.name}</div>
                                    <div className="text-sm text-muted-foreground">{user.email}</div>
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
                                        onChange={(e) => handleAction(updateUserRole, user.email, e.target.value as any)}
                                        className="text-sm p-1 rounded bg-secondary border border-border"
                                    >
                                        <option value="user">User</option>
                                        <option value="sub-admin" disabled={user.subscription !== 'pro'}>Sub-Admin (Pro)</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <button onClick={() => handleDeleteUser(user.email, user.name)} className="text-destructive hover:text-destructive/80"><TrashIcon /></button>
                                </>
                            )}
                        </td>
                    </tr>
                ))}
            </React.Fragment>
        );

        return (
            <div className="overflow-x-auto border rounded-lg border-border">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-secondary">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {renderUserGroup('Me as Admin', adminUsers)}
                        {renderUserGroup('Sub Admins & Other Admins', subAdminUsers)}
                        {renderUserGroup('End Users', endUsers)}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderSubAdminsView = () => {
        const subAdmins = users.filter(u => u.role === 'sub-admin');
        return (
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-muted-foreground text-sm">List of users with article management permissions.</p>
                    <button onClick={() => setAddModalOpen(true)} className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-semibold text-sm">Add Sub-Admin</button>
                </div>
                <div className="overflow-x-auto border rounded-lg border-border">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-secondary">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Sub-Admin</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Subscription</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {subAdmins.length > 0 ? subAdmins.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'}>
                                            {user.subscription}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleAction(updateUserRole, user.email, 'user')} className="text-yellow-600 hover:text-yellow-800 font-semibold">
                                            Demote to User
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-8 text-muted-foreground">No Sub-Admins found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Manage Users</h3>
            <div className="flex border-b border-border mb-6">
                <button onClick={() => setView('all')} className={`px-4 py-2 -mb-px border-b-2 text-sm sm:text-base ${view === 'all' ? 'border-accent text-accent font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>All Users</button>
                <button onClick={() => setView('subAdmins')} className={`px-4 py-2 -mb-px border-b-2 text-sm sm:text-base ${view === 'subAdmins' ? 'border-accent text-accent font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Sub-Admins</button>
            </div>

            <AddSubAdminModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAddSubAdmin} allUsers={users} />

            {view === 'all' ? renderAllUsersView() : renderSubAdminsView()}
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
            <div className="overflow-x-auto border rounded-lg border-border">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-secondary">
                         <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Subscription</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Last Payment</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                                        <div className="ml-4">
                                            <div className="text-sm font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${planColors[user.subscription]}`}>
                                        {user.subscription}
                                    </span>
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
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

    useEffect(() => {
        // If the current tab is not visible to the user (e.g., after a role change), default to the first visible tab
        if (!visibleTabs.find(tab => tab.id === activeTab)) {
            setActiveTab(visibleTabs[0]?.id as AdminTab || 'dashboard');
        }
    }, [props.user.role, activeTab, visibleTabs]);

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
                                    ? 'bg-accent/20 text-accent' 
                                    : 'hover:bg-secondary'
                                }`}
                            >
                               {tab.icon}
                               <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>
                <div className="flex-1">
                    <div className="bg-card text-card-foreground rounded-lg shadow-xl p-4 sm:p-6">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;