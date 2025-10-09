import React, { useState, useEffect } from 'react';
import { Comment } from '../../types';
import * as newsService from '../../services/newsService';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../LoadingSpinner';
import { TrashIcon } from '../icons/TrashIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { ShieldExclamationIcon } from '../icons/ShieldExclamationIcon';

const CommentManager: React.FC = () => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const { addToast } = useToast();

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const data = await newsService.getAllComments();
            setComments(data);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const handleDelete = async (commentId: string) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await newsService.deleteComment(commentId);
                setComments(prev => prev.filter(c => c.id !== commentId));
                addToast('Comment deleted.', 'success');
            } catch (error: any) {
                addToast(error.message, 'error');
            }
        }
    };
    
    const handleUpdateStatus = async (commentId: string, status: 'approved' | 'rejected') => {
        try {
            await newsService.updateCommentStatus(commentId, status);
            setComments(prev => prev.map(c => c.id === commentId ? { ...c, status } : c));
            addToast(`Comment ${status}.`, 'success');
        } catch (error: any) {
            addToast(error.message, 'error');
        }
    };

    const filteredComments = comments.filter(c => filter === 'all' || c.status === filter);

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Manage Comments</h3>
            {/* Filter Buttons */}
            <div className="flex space-x-2 mb-4">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-sm font-semibold rounded-full ${filter === f ? 'bg-accent text-accent-foreground' : 'bg-secondary'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
                ))}
            </div>

            {isLoading ? <LoadingSpinner /> : (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-secondary">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Comment</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Author</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {filteredComments.map(comment => (
                                <tr key={comment.id}>
                                    <td className="px-4 py-3 text-sm max-w-sm"><p className="truncate">{comment.body}</p><span className="text-xs text-muted-foreground truncate block">{comment.article_title}</span></td>
                                    <td className="px-4 py-3 text-sm">{comment.author_name}</td>
                                    <td className="px-4 py-3 text-sm capitalize">{comment.status}</td>
                                    <td className="px-4 py-3 space-x-2">
                                        {comment.status !== 'approved' && <button onClick={() => handleUpdateStatus(comment.id, 'approved')} title="Approve" className="text-green-500"><CheckCircleIcon /></button>}
                                        {comment.status !== 'rejected' && <button onClick={() => handleUpdateStatus(comment.id, 'rejected')} title="Reject" className="text-yellow-500"><ShieldExclamationIcon /></button>}
                                        <button onClick={() => handleDelete(comment.id)} className="text-destructive" title="Delete"><TrashIcon /></button>
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

export default CommentManager;
