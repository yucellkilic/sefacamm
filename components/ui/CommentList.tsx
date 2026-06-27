'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, User } from 'lucide-react';
import { formatDate } from '@/utils/dateFormatter';
import Avatar from './Avatar';

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface CommentListProps {
  postId: string;
  refreshTrigger?: number;
}

export default function CommentList({ postId, refreshTrigger = 0 }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/comments?postId=${postId}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments || []);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <MessageSquare className="mx-auto mb-3 h-10 w-10 text-text-tertiary" />
        <p className="text-text-secondary">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-text-primary">
        <MessageSquare className="h-6 w-6 text-primary" />
        Yorumlar
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-sm font-normal text-primary">
          {comments.length}
        </span>
      </h3>

      <div className="space-y-4">
        {comments.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {comment.author_name}
                </p>
                <time
                  dateTime={comment.created_at}
                  className="text-xs text-text-tertiary"
                >
                  {formatDate(comment.created_at)}
                </time>
              </div>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {comment.content}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
