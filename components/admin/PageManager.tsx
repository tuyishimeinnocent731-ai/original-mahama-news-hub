import React, { useState, useEffect } from 'react';
import * as navigationService from '../../services/navigationService';
import { useToast } from '../../contexts/ToastContext';
import { Page } from '../../types';
import LoadingSpinner from '../LoadingSpinner';

const PageManager: React.FC = () => {
    const [pages, setPages] = useState<string[]>(['about-us', 'contact-us']);
    const [selectedPage, setSelectedPage] = useState<string>('about-us');
    const [pageData, setPageData] = useState<Partial<Page>>({ title: '', content: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchPage = async () => {
            if (!selectedPage) return;
            setIsLoading(true);
            try {
                const data = await navigationService.getPage(selectedPage);
                setPageData(data);
            } catch (error: any) {
                addToast(error.message || 'Failed to load page content.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPage();
    }, [selectedPage]);

    const handleSave = async () => {
        if (!selectedPage || !pageData.title || !pageData.content) {
            addToast('Title and Content cannot be empty.', 'warning');
            return;
        }
        setIsLoading(true);
        try {
            await navigationService.updatePage(selectedPage, pageData);
            addToast('Page updated successfully!', 'success');
        } catch (error: any) {
            addToast(error.message || 'Failed to save page content.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Manage Page Content</h3>
            <div className="mb-6">
                <label htmlFor="page-select" className="block text-sm font-medium mb-1">Select a page to edit:</label>
                <select 
                    id="page-select" 
                    value={selectedPage} 
                    onChange={e => setSelectedPage(e.target.value)}
                    className="w-full max-w-xs p-2 border rounded-md bg-card border-border focus:ring-accent focus:border-accent"
                >
                    {pages.map(slug => (
                        <option key={slug} value={slug}>
                            {slug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                    ))}
                </select>
            </div>
            
            {isLoading ? <LoadingSpinner /> : (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="page-title" className="block text-sm font-medium">Page Title</label>
                        <input
                            type="text"
                            id="page-title"
                            value={pageData.title}
                            onChange={e => setPageData({ ...pageData, title: e.target.value })}
                            className="w-full mt-1 p-2 border rounded-md bg-card border-border focus:ring-accent focus:border-accent"
                        />
                    </div>
                    <div>
                        <label htmlFor="page-content" className="block text-sm font-medium">Page Content (HTML supported)</label>
                        <textarea
                            id="page-content"
                            value={pageData.content}
                            onChange={e => setPageData({ ...pageData, content: e.target.value })}
                            rows={15}
                            className="w-full mt-1 p-2 border rounded-md bg-card border-border focus:ring-accent focus:border-accent font-mono text-sm"
                        />
                    </div>
                    <div className="text-right">
                        <button onClick={handleSave} disabled={isLoading} className="px-5 py-2.5 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-semibold">
                            Save Content
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageManager;