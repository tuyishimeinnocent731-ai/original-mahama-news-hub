import React, { useState, useEffect } from 'react';
import { Comment } from '../../types';
import * as newsService from '../../services/newsService';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../LoadingSpinner';
import { TrashIcon } from '../icons/TrashIcon';

const CommentManager: React.FC = () => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
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

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Manage Comments</h3>
            {isLoading ? <LoadingSpinner /> : (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-secondary">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Comment</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Author</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Article</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {comments.map(comment => (
                                <tr key={comment.id}>
                                    <td className="px-4 py-3 text-sm max-w-sm truncate">{comment.body}</td>
                                    <td className="px-4 py-3 text-sm">{comment.author_name}</td>
                                    <td className="px-4 py-3 text-sm max-w-xs truncate">{comment.article_title}</td>
                                    <td className="px-4 py-3 text-sm">{new Date(comment.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleDelete(comment.id)} className="text-destructive hover:text-destructive/80">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
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