import React, { useState } from 'react';
import { User, Article } from '../types';
import { NewspaperIcon } from '../components/icons/NewspaperIcon';
import { UserGroupIcon } from '../components/icons/UserGroupIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { ArrowUpCircleIcon } from '../components/icons/ArrowUpCircleIcon';
import { ArrowDownCircleIcon } from '../components/icons/ArrowDownCircleIcon';
import { ALL_CATEGORIES } from '../constants';

type ArticleFormData = Omit<Article, 'id' | 'publishedAt' | 'source' | 'url' | 'isOffline'>;

interface ArticleManagerProps {
    onAddArticle: (data: ArticleFormData) => void;
    allArticles: Article[];
    onDeleteArticle: (id: string) => void;
}

const ArticleManager: React.FC<ArticleManagerProps> = ({ onAddArticle, allArticles, onDeleteArticle }) => {
    const [formData, setFormData] = useState<ArticleFormData>({
        title: '', description: '', body: '', author: '', category: 'World', urlToImage: ''
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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
        onAddArticle(formData);
        // Reset form
        setFormData({ title: '', description: '', body: '', author: '', category: 'World', urlToImage: '' });
        setImagePreview(null);
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    return (
        <div className="space-y-12">
            <div>
                <h3 className="text-2xl font-bold mb-4">Upload New Article</h3>
                <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg dark:border-gray-700">
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
                        <label htmlFor="image-upload" className="block text-sm font-medium">Featured Image</label>
                        <input type="file" name="image" id="image-upload" onChange={handleImageChange} required accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 dark:file:bg-gray-600 dark:file:text-gray-200" />
                    </div>
                    {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 rounded-md max-h-48" />}
                    <div className="text-right">
                        <button type="submit" className="px-5 py-2.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-semibold">Publish Article</button>
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
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell">Author</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {allArticles.map(article => (
                                <tr key={article.id}>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium max-w-xs truncate">{article.title}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm">{article.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm">{article.author}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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

interface UserManagerProps {
    getAllUsers: () => User[];
    toggleAdminRole: (email: string, action: 'promote' | 'demote') => boolean;
}

const UserManager: React.FC<UserManagerProps> = ({ getAllUsers, toggleAdminRole }) => {
    const users = getAllUsers();
    const [refreshKey, setRefreshKey] = useState(0); // cheap way to force re-render

    const handleRoleChange = (email: string, action: 'promote' | 'demote') => {
        if(toggleAdminRole(email, action)) {
            setRefreshKey(k => k + 1); // trigger re-render to show updated role
        }
    };
    
    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Manage Users</h3>
            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                         <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
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
                                            <div className="text-sm text-gray-500 md:hidden">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {user.role === 'admin' ? (
                                        <button onClick={() => handleRoleChange(user.email, 'demote')} disabled={user.email === 'reponsekdz0@gmail.com'} className="flex items-center text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed">
                                            <ArrowDownCircleIcon className="w-5 h-5 mr-1" /> Revoke
                                        </button>
                                    ) : (
                                        <button onClick={() => handleRoleChange(user.email, 'promote')} className="flex items-center text-green-600 hover:text-green-900 dark:text-green-500 dark:hover:text-green-400">
                                            <ArrowUpCircleIcon className="w-5 h-5 mr-1" /> Promote
                                        </button>
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

type AdminTab = 'articles' | 'users';

interface AdminPageProps {
    user: User;
    allArticles: Article[];
    onAddArticle: (data: ArticleFormData) => void;
    onDeleteArticle: (id: string) => void;
    getAllUsers: () => User[];
    toggleAdminRole: (email: string, action: 'promote' | 'demote') => boolean;
}

const AdminPage: React.FC<AdminPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('articles');
    
    const tabs = [
        { id: 'articles', label: 'Manage Articles', icon: <NewspaperIcon className="w-5 h-5" /> },
        { id: 'users', label: 'Manage Users', icon: <UserGroupIcon className="w-5 h-5" /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'articles':
                return <ArticleManager onAddArticle={props.onAddArticle} allArticles={props.allArticles} onDeleteArticle={props.onDeleteArticle} />;
            case 'users':
                return <UserManager getAllUsers={props.getAllUsers} toggleAdminRole={props.toggleAdminRole} />;
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
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
