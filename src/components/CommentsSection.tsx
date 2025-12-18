import { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Comment {
  id: string;
  name: string;
  email: string;
  comment: string;
  created_at: string;
}

export default function CommentsSection() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!comment.trim()) {
      setError('Comment is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    const { error: submitError } = await supabase
      .from('comments')
      .insert([{ name: name.trim(), email: email.trim(), comment: comment.trim() }]);

    if (submitError) {
      console.error('Error submitting comment:', submitError);
      setError('Failed to submit comment. Please try again.');
    } else {
      setName('');
      setEmail('');
      setComment('');
      fetchComments();
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-orange-500" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Discussion & Feedback
        </h2>
      </div>

      {/* Privacy Notice */}
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Your email address will not be published. Required fields are marked <span className="text-red-500">*</span>
      </p>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            required
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>

        {/* Comment Field */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            required
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Submitting...' : 'Submit Comment'}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Comments ({comments.length})
        </h3>

        {comments.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400 text-center py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-700/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {c.name}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {c.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
