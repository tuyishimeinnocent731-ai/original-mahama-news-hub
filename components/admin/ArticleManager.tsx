import React, { useState, useEffect } from 'react';
import { Article } from '../../types';
import { ALL_CATEGORIES } from '../../constants';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import ImageGeneratorModal from './ImageGeneratorModal';
import { SparklesIcon } from '../icons/SparklesIcon';
import { api } from '../../services/apiService';

export type ArticleFormData = Omit<Article, 'id' | 'publishedAt' | 'source' | 'url' | 'isOffline'>;

interface ArticleManagerProps {
    onAddArticle: (data: ArticleFormData) => void;
    onUpdateArticle: (id: string, data: Partial<Omit<Article, 'id'>>) => void;
    allArticles: Article[];
    onDeleteArticle: (id: string) => void;
}

const ArticleManager: React.FC<ArticleManagerProps> = ({ onAddArticle, onUpdateArticle, allArticles, onDeleteArticle }) => {
    const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
    const initialFormState: ArticleFormData = { title: '', description: '', body: '', author: '', category: 'World', urlToImage: '', tags: [], scheduledFor: '' };
    const [formData, setFormData] = useState<ArticleFormData>(initialFormState);
    const [tagsInput, setTagsInput] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

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
                    tags: articleToEdit.tags || [],
                    scheduledFor: articleToEdit.scheduledFor ? articleToEdit.scheduledFor.slice(0, 16) : ''
                });
                setTagsInput((articleToEdit.tags || []).join(', '));
                setImagePreview(articleToEdit.urlToImage);
            }
        } else {
            setFormData(initialFormState);
            setTagsInput('');
            setImagePreview(null);
        }
    }, [editingArticleId, allArticles]);
    
    useEffect(() => {
        const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
        setFormData(prev => ({ ...prev, tags }));
    }, [tagsInput]);

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
    
    const handleImageFromGenerator = (base64Image: string) => {
        setFormData(prev => ({...prev, urlToImage: base64Image}));
        setImagePreview(base64Image);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor).toISOString() : undefined
        };

        if (editingArticleId) {
            onUpdateArticle(editingArticleId, dataToSubmit);
        } else {
            onAddArticle(dataToSubmit);
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
                        <label htmlFor="tags" className="block text-sm font-medium">Tags (comma-separated)</label>
                        <input type="text" name="tags" id="tags" placeholder="e.g., AI, Innovation, Tech" value={tagsInput} onChange={e => setTagsInput(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
                    </div>
                     <div>
                        <label htmlFor="image-upload" className="block text-sm font-medium mb-1">Featured Image</label>
                        <div className="flex gap-2 items-center">
                            <input type="file" name="image" id="image-upload" onChange={handleImageChange} accept="image/*" className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/20 file:text-accent hover:file:bg-accent/30" />
                            <button type="button" onClick={() => setIsGeneratorOpen(true)} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 text-sm font-semibold">
                                <SparklesIcon className="w-4 h-4" />
                                AI
                            </button>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="scheduledFor" className="block text-sm font-medium mb-1">Schedule For (Optional)</label>
                        <input type="datetime-local" name="scheduledFor" id="scheduledFor" value={formData.scheduledFor} onChange={handleChange} className="block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
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
            
            <ImageGeneratorModal
                isOpen={isGeneratorOpen}
                onClose={() => setIsGeneratorOpen(false)}
                onImageSelect={handleImageFromGenerator}
                initialPrompt={formData.title}
            />

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

export default ArticleManager;