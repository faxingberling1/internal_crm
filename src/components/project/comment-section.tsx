"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, Loader2, User, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
    id: string;
    content: string;
    authorName: string;
    authorId: string;
    createdAt: string;
}

export function CommentSection({ projectId }: { projectId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [projectId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment })
            });

            if (res.ok) {
                setNewComment("");
                fetchComments();
            }
        } catch (error) {
            console.error("Failed to send comment:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Input Section */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm">
                <form onSubmit={handleSendMessage} className="relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share an update or post a comment..."
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 px-6 pr-16 focus:ring-4 focus:ring-zinc-900/5 transition-all outline-none text-zinc-900 font-medium resize-none"
                        rows={3}
                    />
                    <button
                        type="submit"
                        disabled={submitting || !newComment.trim()}
                        className="absolute right-3 bottom-3 p-3 bg-zinc-900 text-white rounded-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </button>
                </form>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                <div className="flex items-center space-x-2 px-2">
                    <MessageSquare className="h-4 w-4 text-zinc-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">
                        Activity Feed ({comments.length})
                    </h3>
                </div>

                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm group">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                    <div className="h-10 w-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shrink-0">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-black text-zinc-900">{comment.authorName}</span>
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                                                • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-zinc-600 font-medium leading-relaxed whitespace-pre-wrap">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {comments.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200">
                            <div className="p-4 bg-zinc-50 rounded-full inline-block mb-4">
                                <MessageSquare className="h-8 w-8 text-zinc-300" />
                            </div>
                            <p className="text-zinc-400 font-bold italic">No activity yet. Be the first to comment!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
