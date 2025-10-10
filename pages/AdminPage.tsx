import React, { useState, useEffect, useMemo } from 'react';
import { User, Article, Ad, SubscriptionPlan, NavLink, Comment } from '../types';
import { NewspaperIcon } from '../components/icons/NewspaperIcon';
import { UserGroupIcon } from '../components/icons/UserGroupIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { ChartPieIcon } from '../components/icons/ChartPieIcon';
import { MegaphoneIcon } from '../components/icons/MegaphoneIcon';
import { SettingsIcon } from '../components/icons/SettingsIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { BillingIcon } from '../components/icons/BillingIcon';
import Modal from '../components/Modal';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { BookOpenIcon } from '../components/icons/BookOpenIcon';
import NavigationManager from '../components/admin/NavigationManager';
import SiteSettingsManager from '../components/admin/SiteSettingsManager';
import ArticleManager, { ArticleFormData } from '../components/admin/ArticleManager';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import { ChartBarIcon } from '../components/icons/ChartBarIcon';
import * as newsService from '../services/newsService';
import * as userService from '../services/userService';
import * as navigationService from '../services/navigationService';
import LoadingSpinner from '../components/LoadingSpinner';
import { EnvelopeIcon } from '../components/icons/EnvelopeIcon';
import PageManager from '../components/admin/PageManager';
import MessageViewer from '../components/admin/MessageViewer';
import { BriefcaseIcon } from '../components/icons/BriefcaseIcon';
import JobManager from '../components/admin/JobManager';
import { ChatBubbleLeftIcon } from '../components/icons/ChatBubbleLeftIcon';
import CommentManager from '../components/admin/CommentManager';
import { KeyIcon } from '../components/icons/KeyIcon';
import PasswordResetModal from '../components/admin/PasswordResetModal';
import { useToast } from '../contexts/ToastContext';
import { FilmIcon } from '../components/icons/FilmIcon';
import VideoGenerator from '../components/admin/VideoGenerator';


type AdFormData = Omit<Ad, 'id'>;
type UserFormData = Pick<User, 'name' | 'email' | 'role' | 'subscription'> & { password?: string };

const ContentPieChart: React.FC<{ distribution: { category: string, count: number }[] }> = ({ distribution }) => {
    const total = distribution.reduce((sum, item) => sum + item.count, 0);
    if (total === 0) return <div className="text-center text-sm text-muted-foreground">No articles to display.</div>;

    const colors = ['#FBBF24', '#60A5FA', '#34D399', '#F87171', '#A78BFA', '#F472B6'];
    const segments = distribution.slice(0, 5);
    let accumulatedOffset = 0;

    return (
        <div className="flex items-center justify-center space-x-6">
            <svg width="150" height="150" viewBox="0 0 100 100" className="chart-pie">
                <circle r="25" cx="50" cy="50" fill="transparent" stroke="#E5E7EB" strokeWidth="50"></circle>
                {segments.map(({ category, count }, index) => {
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
                            strokeDashoffset={-offset}
                            className="chart-pie-segment"
                        />
                    );
                })}
            </svg>
            <div className="text-sm space-y-2">
                {segments.map(({ category, count }, index) => (
                    <div key={category} className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index % colors.length] }}></span>
                        <span>{category} ({count})</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await newsService.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="flex justify-center p-12"><LoadingSpinner /></div>;
    if (!stats) return <div className="text-center p-12">Could not load dashboard statistics.</div>;
    
    const { users, articles, ads, content } = stats;

    return (
        <div>
            <h3 className="text-2xl font-bold mb-6">Dashboard Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-secondary p-6 rounded-lg shadow-md">
                    <h4 className="text-sm font-medium text-muted-foreground">Total Articles</h4>
                    <p className="text-3xl font-bold mt-2">{articles.total.toLocaleString()}</p>
                </div>
                <div className="bg-secondary p-6 rounded-lg shadow-md">
                    <h4 className="text-sm font-medium text-muted-foreground">Total Ads</h4>
                    <p className="text-3xl font-bold mt-2">{ads.total.toLocaleString()}</p>
                </div>
                <div className="bg-secondary p-6 rounded-lg shadow-md">
                    <h4 className="text-sm font-medium text-muted-foreground">Total Users</h4>
                    <p className="text-3xl font-bold mt-2">{users.total.toLocaleString()}</p>
                </div>
                 <div className="bg-secondary p-6 rounded-lg shadow-md">
                    <h4 className="text-sm font-medium text-muted-foreground">Subscriptions</h4>
                    <div className="mt-2 space-y-1">
                        {Object.entries(users.subscriptions).map(([plan, count]) => (
                             <div key={plan} className="flex justify-between text-sm">
                                <span className="capitalize font-medium">{plan}</span>
                                <span className="font-semibold">{count as number}</span>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-secondary p-6 rounded-lg shadow-md">
                    <h4 className="text-lg font-semibold mb-4">Content Distribution</h4>
                    <ContentPieChart distribution={content.categoryDistribution} />
                </div>
                <div className="bg-secondary p-6 rounded-lg shadow-md">
                    <h4 className="text-lg font-semibold mb-4">Total Views</h4>
                    <p className="text-5xl font-bold text-accent">{articles.totalViews.toLocaleString()}</p>
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

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (userData: UserFormData, userId?: string) => Promise<boolean>;
    userToEdit?: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSubmit, userToEdit }) => {
    const [formData, setFormData] = useState<UserFormData>({
        name: '', email: '', role: 'user', subscription: 'free', password: ''
    });

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                name: userToEdit.name,
                email: userToEdit.email,
                role: userToEdit.role || 'user',
                subscription: userToEdit.subscription,
                password: ''
            });
        } else {
            setFormData({ name: '', email: '', role: 'user', subscription: 'free', password: '' });
        }
    }, [userToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value as any }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await onSubmit(formData, userToEdit?.id);
        if (success) {
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">{userToEdit ? 'Edit User' : 'Add New User'}</h3>
                <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                {!userToEdit && (
                     <input type="password" name="password" placeholder="Set Initial Password" value={formData.password} onChange={handleChange} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                )}
                <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                    <option value="user">End User</option>
                    <option value="sub-admin">Sub-Admin</option>
                    <option value="admin">Admin</option>
                </select>
                 <select name="subscription" value={formData.subscription} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                    <option value="free">Free</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="pro">Pro</option>
                </select>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-secondary rounded-md">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-accent text-accent-foreground rounded-md">{userToEdit ? 'Save Changes' : 'Create User'}</button>
                </div>
            </form>
        </Modal>
    );
};


interface UserManagerProps {
    currentUser: User;
    getAllUsers: () => Promise<User[]>;
    addUser: (userData: UserFormData) => Promise<boolean>;
    updateUser: (userId: string, userData: Partial<User>) => Promise<boolean>;
    deleteUser: (userId: string) => Promise<boolean>;
}

const UserManager: React.FC<UserManagerProps> = ({ currentUser, getAllUsers, addUser, updateUser, deleteUser }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isResetModalOpen, setResetModalOpen] = useState(false);
    const [tempPassword, setTempPassword] = useState('');
    const { addToast } = useToast();

    useEffect(() => {
        setIsLoading(true);
        getAllUsers().then(fetchedUsers => {
            setUsers(fetchedUsers);
            setIsLoading(false);
        });
    }, [getAllUsers, refreshKey]);

    const handleAction = async (action: (...args: any[]) => Promise<boolean>, ...args: any[]) => {
        const success = await action(...args);
        if (success) {
            setRefreshKey(k => k + 1);
        }
    };
    
    const handleAddUser = () => {
        setUserToEdit(null);
        setModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setUserToEdit(user);
        setModalOpen(true);
    }
    
    const handleDeleteUser = (userId: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete user ${name}? This action cannot be undone.`)) {
            handleAction(deleteUser, userId);
        }
    };

    const handleResetPassword = async (userId: string) => {
        if (window.confirm(`Are you sure you want to reset this user's password? They will be logged out of all sessions.`)) {
            try {
                const { temporaryPassword } = await userService.adminResetPassword(userId);
                setTempPassword(temporaryPassword);
                setResetModalOpen(true);
                addToast('Password has been reset.', 'success');
            } catch (error: any) {
                addToast(error.message || 'Failed to reset password.', 'error');
            }
        }
    };

    const handleFormSubmit = async (userData: UserFormData, userId?: string): Promise<boolean> => {
        let success: boolean;
        if (userId) { // Editing
            const { password, ...restOfData } = userData; // Don't pass password on edit
            success = await updateUser(userId, restOfData);
        } else { // Adding
            success = await addUser(userData);
        }
        if (success) {
            setRefreshKey(k => k + 1);
        }
        return success;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Manage Users</h3>
                <button onClick={handleAddUser} className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-semibold text-sm">
                    <PlusCircleIcon className="w-5 h-5"/>
                    Add User
                </button>
            </div>

            <UserFormModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSubmit={handleFormSubmit} userToEdit={userToEdit} />
            {isResetModalOpen && <PasswordResetModal password={tempPassword} onClose={() => setResetModalOpen(false)} />}

            {isLoading ? <div className="flex justify-center p-8"><LoadingSpinner /></div> : (
                <div className="overflow-x-auto border rounded-lg border-border">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-secondary">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Subscription</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {users.map(user => (
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{user.subscription}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {user.email !== 'reponsekdz0@gmail.com' && (
                                            <>
                                                <button onClick={() => handleResetPassword(user.id)} className="text-yellow-600 hover:text-yellow-500" title="Reset Password"><KeyIcon className="w-5 h-5" /></button>
                                                <button onClick={() => handleEditUser(user)} className="text-primary hover:text-primary/80"><PencilIcon className="w-5 h-5"/></button>
                                                <button onClick={() => handleDeleteUser(user.id, user.name)} className="text-destructive hover:text-destructive/80"><TrashIcon className="w-5 h-5"/></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};


interface SubscriptionManagerProps {
    getAllUsers: () => Promise<User[]>;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ getAllUsers }) => {
    const [users, setUsers] = useState<User[]>([]);
     const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getAllUsers().then(fetchedUsers => {
            setUsers(fetchedUsers);
            setIsLoading(false);
        });
    }, [getAllUsers]);
    
    const planColors: Record<SubscriptionPlan, string> = {
        free: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
        standard: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        premium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        pro: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    };

    return (
         <div>
            <h3 className="text-2xl font-bold mb-4">Subscriptions & Payments</h3>
            {isLoading ? <div className="flex justify-center p-8"><LoadingSpinner /></div> : (
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
                                        {user.paymentHistory && user.paymentHistory.length > 0 ? (
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
            )}
        </div>
    );
};

type AdminTab = 'dashboard' | 'articles' | 'comments' | 'ads' | 'users' | 'navigation' | 'pages' | 'messages' | 'jobs' | 'settings' | 'subscriptions' | 'analytics' | 'video';

interface AdminPageProps {
    user: User;
    allArticles: Article[];
    allAds: Ad[];
    navLinks: NavLink[];
    onAddArticle: (data: ArticleFormData) => void;
    onUpdateArticle: (id: string, data: Partial<Omit<Article, 'id'>>) => void;
    onDeleteArticle: (id: string) => void;
    onAddAd: (data: AdFormData) => void;
    onUpdateAd: (id: string, data: AdFormData) => void;
    onDeleteAd: (id: string) => void;
    getAllUsers: () => Promise<User[]>;
    addUser: (userData: UserFormData) => Promise<boolean>;
    updateUser: (userId: string, userData: Partial<User>) => Promise<boolean>;
    deleteUser: (userId: string) => Promise<boolean>;
    siteSettings: { siteName: string; maintenanceMode: boolean; };
    onUpdateSiteSettings: (newSettings: Partial<{ siteName: string; maintenanceMode: boolean; }>) => void;
    onUpdateNavLinks: (links: NavLink[]) => void;
}

const AdminPage: React.FC<AdminPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    
    const allTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <ChartPieIcon className="w-5 h-5" />, roles: ['admin', 'sub-admin'] },
        { id: 'articles', label: 'Manage Articles', icon: <NewspaperIcon className="w-5 h-5" />, roles: ['admin', 'sub-admin'] },
        { id: 'video', label: 'Video Studio', icon: <FilmIcon className="w-5 h-5" />, roles: ['admin', 'sub-admin'] },
        { id: 'comments', label: 'Comment Moderation', icon: <ChatBubbleLeftIcon className="w-5 h-5" />, roles: ['admin'] },
        { id: 'navigation', label: 'Navigation', icon: <BookOpenIcon className="w-5 h-5" />, roles: ['admin'] },
        { id: 'pages', label: 'Page Content', icon: <PencilIcon className="w-5 h-5" />, roles: ['admin'] },
        { id: 'ads', label: 'Manage Ads', icon: <MegaphoneIcon className="w-5 h-5" />, roles: ['admin'] },
        { id: 'jobs', label: 'Careers', icon: <BriefcaseIcon className="w-5 h-5" />, roles: ['admin'] },
        { id: 'messages', label: 'Contact Messages', icon: <EnvelopeIcon className="w-5 h-5" />, roles: ['admin'] },
        { id: 'users', label: 'Manage Users', icon: <UserGroupIcon className="w-5 h-5" />, roles: ['admin'] },
        { id: 'subscriptions', label: 'Subscriptions', icon: <BillingIcon className="w-5 h-5" />, roles: ['admin'] },
        { id: 'analytics', label: 'Analytics', icon: <ChartBarIcon className="w-5 h-5" />, roles: ['admin'] },
        { id: 'settings', label: 'Site Settings', icon: <SettingsIcon />, roles: ['admin'] },
    ];
    
    const visibleTabs = allTabs.filter(tab => tab.roles.includes(props.user.role || 'user'));

    useEffect(() => {
        if (!visibleTabs.find(tab => tab.id === activeTab)) {
            setActiveTab(visibleTabs[0]?.id as AdminTab || 'dashboard');
        }
    }, [props.user.role, activeTab, visibleTabs]);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard />;
            case 'articles':
                return <ArticleManager onAddArticle={props.onAddArticle} onUpdateArticle={props.onUpdateArticle} allArticles={props.allArticles} onDeleteArticle={props.onDeleteArticle} />;
            case 'video':
                return <VideoGenerator />;
            case 'comments':
                return <CommentManager />;
            case 'navigation':
                return <NavigationManager navLinks={props.navLinks} onUpdateNavLinks={props.onUpdateNavLinks} />;
            case 'pages':
                return <PageManager />;
            case 'ads':
                return <AdManager onAddAd={props.onAddAd} onUpdateAd={props.onUpdateAd} allAds={props.allAds} onDeleteAd={props.onDeleteAd} />;
            case 'jobs':
                return <JobManager />;
            case 'messages':
                return <MessageViewer />;
            case 'users':
                return <UserManager currentUser={props.user} getAllUsers={props.getAllUsers} addUser={props.addUser} updateUser={props.updateUser} deleteUser={props.deleteUser} />;
            case 'subscriptions':
                return <SubscriptionManager getAllUsers={props.getAllUsers} />;
            case 'analytics':
                return <AnalyticsDashboard getAllUsers={props.getAllUsers} articles={props.allArticles} />;
            case 'settings':
                return <SiteSettingsManager settings={props.siteSettings} onUpdateSettings={props.onUpdateSettings} />;
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