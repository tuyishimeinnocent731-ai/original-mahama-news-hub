import React from 'react';
import { Article } from '../types';
import ArticleManager, { ArticleFormData } from '../components/admin/ArticleManager';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';

interface SubAdminPageProps {
    allArticles: Article[];
    onAddArticle: (data: ArticleFormData) => void;
    onUpdateArticle: (id: string, data: Partial<Omit<Article, 'id'>>) => void;
    onDeleteArticle: (id: string) => void;
    onBack: () => void;
}

const SubAdminPage: React.FC<SubAdminPageProps> = (props) => {
    const { onBack } = props;
    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="flex items-center space-x-2 text-accent hover:underline mb-6 font-semibold">
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to Full Admin Panel</span>
            </button>
            <h1 className="text-3xl font-bold mb-8">Sub-Admin Content Management</h1>
             <div className="bg-card text-card-foreground rounded-lg shadow-xl p-4 sm:p-6">
                <ArticleManager 
                    onAddArticle={props.onAddArticle}
                    onUpdateArticle={props.onUpdateArticle}
                    allArticles={props.allArticles}
                    onDeleteArticle={props.onDeleteArticle}
                />
            </div>
        </div>
    );
};

export default SubAdminPage;