

import React, { useState, useEffect } from 'react';
import { User, Article, SubscriptionPlan } from '../../types';
import { UserGroupIcon } from '../icons/UserGroupIcon';
import { NewspaperIcon } from '../icons/NewspaperIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { StarIcon } from '../icons/StarIcon';
import LoadingSpinner from '../LoadingSpinner';

interface AnalyticsDashboardProps {
    getAllUsers: () => Promise<User[]>;
    articles: Article[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-secondary p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-accent/20 text-accent p-3 rounded-full">{icon}</div>
        <div>
            <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
            <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
    </div>
);

const SimpleBarChart: React.FC<{ data: { label: string; value: number }[]; title: string }> = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="bg-secondary p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold mb-4">{title}</h4>
            <div className="space-y-3">
                {data.map(item => (
                    <div key={item.label} className="flex items-center">
                        <span className="w-24 text-sm text-muted-foreground truncate">{item.label}</span>
                        <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                            <div
                                className="bg-accent h-4 rounded-full flex items-center justify-end"
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                            >
                                <span className="text-xs font-semibold text-accent-foreground pr-2">{item.value.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ getAllUsers, articles }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getAllUsers().then(fetchedUsers => {
            setUsers(fetchedUsers);
            setIsLoading(false);
        });
    }, [getAllUsers]);

    if (isLoading) {
        return <div className="flex justify-center p-12"><LoadingSpinner /></div>;
    }

    // Mock data generation
    const totalViews = articles.length * 1234; // Mock calculation
    // FIX: Replaced reduce with a for...of loop for more explicit type inference, resolving arithmetic operation errors.
    const subscriptions: Record<SubscriptionPlan, number> = { free: 0, standard: 0, premium: 0, pro: 0 };
    for (const user of users) {
        if (user.subscription in subscriptions) {
            subscriptions[user.subscription]++;
        }
    }
    
    const viewsByCategory = articles.reduce((acc, article) => {
        acc[article.category] = (acc[article.category] || 0) + Math.floor(Math.random() * 2000 + 500);
        return acc;
    }, {} as Record<string, number>);
    
    const categoryData = Object.entries(viewsByCategory).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value).slice(0, 5);
    
    const topArticles = [...articles]
        .map(a => ({...a, views: Math.floor(Math.random() * 5000 + 1000)}))
        .sort((a,b) => b.views - a.views)
        .slice(0, 5);

    return (
        <div>
            <h3 className="text-2xl font-bold mb-6">Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Article Views" value={totalViews.toLocaleString()} icon={<EyeIcon />} />
                <StatCard title="Total Articles" value={articles.length.toString()} icon={<NewspaperIcon />} />
                <StatCard title="Total Users" value={users.length.toString()} icon={<UserGroupIcon />} />
                <StatCard title="Premium Users" value={(subscriptions.premium + subscriptions.pro).toString()} icon={<StarIcon />} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SimpleBarChart title="Top 5 Categories by Views" data={categoryData} />
                 <div className="bg-secondary p-6 rounded-lg shadow-md">
                    <h4 className="text-lg font-semibold mb-4">Top Performing Articles</h4>
                    <ul className="space-y-2">
                        {topArticles.map(article => (
                            <li key={article.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted">
                                <span className="truncate max-w-xs">{article.title}</span>
                                <span className="font-bold">{article.views.toLocaleString()} views</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;