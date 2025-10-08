import React from 'react';
import { Comment as CommentType } from '../types';
import { UserIcon } from './icons/UserIcon';

interface CommentProps {
    comment: CommentType;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
    return (
        <div className="flex space-x-3">
            <div className="flex-shrink-0">
                <img src={comment.author_avatar} alt={comment.author_name} className="w-10 h-10 rounded-full object-cover" />
            </div>
            <div className="flex-1">
                <div className="bg-secondary rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">{comment.author_name}</span>
                    </div>
                    <p className="text-card-foreground mt-1 text-sm">{comment.body}</p>
                </div>
                <div className="text-xs text-muted-foreground mt-1 pl-2">
                    {new Date(comment.created_at).toLocaleString()}
                </div>
            </div>
        </div>
    );
};

export default Comment;