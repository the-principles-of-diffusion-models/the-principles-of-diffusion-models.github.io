import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Send, Reply, ThumbsUp, ThumbsDown, Link2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface CommentRow {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  upvotes?: number;
  downvotes?: number;
  my_reaction?: 1 | -1 | 0;
}
interface CommentWithReplies extends CommentRow {
  replies: CommentWithReplies[];
}
type Reaction = 1 | -1;
interface ReactionRow {
  comment_id: string;
  upvotes: number | string;
  downvotes: number | string;
  my_reaction: number;
}

// Not the previously exposed, predictable visitor fingerprint. This random
// secret stays in the browser and is sent only in RPC POST bodies. Never log it.
let browserToken: string | undefined;
function getBrowserToken(): string {
  if (browserToken) return browserToken;
  try {
    const stored = localStorage.getItem('book_discussion_token_v2');
    if (stored && /^[0-9a-f]{64}$/.test(stored)) {
      browserToken = stored;
      return stored;
    }
  } catch { /* storage may be unavailable */ }
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  browserToken = token;
  try { localStorage.setItem('book_discussion_token_v2', token); } catch { /* session only */ }
  return token;
}

function getCommentIdFromUrl(): string | null {
  const hash = window.location.hash || '';
  const i = hash.indexOf('?');
  return new URLSearchParams(i >= 0 ? hash.slice(i + 1) : '').get('comment');
}

function buildCommentTree(rows: CommentRow[]): CommentWithReplies[] {
  const map = new Map<string, CommentWithReplies>();
  const roots: CommentWithReplies[] = [];
  rows.forEach(row => map.set(row.id, { ...row, replies: [] }));
  for (const node of map.values()) {
    if (!node.parent_id) roots.push(node);
    else {
      // Omit orphaned replies and any cycles in old data.
      let ancestor: CommentWithReplies | undefined = map.get(node.parent_id);
      const seen = new Set([node.id]);
      let valid = !!ancestor;
      while (ancestor && valid) {
        if (seen.has(ancestor.id)) { valid = false; break; }
        seen.add(ancestor.id);
        if (!ancestor.parent_id) break;
        ancestor = map.get(ancestor.parent_id);
        if (!ancestor) valid = false;
      }
      if (valid) map.get(node.parent_id)?.replies.push(node);
    }
  }
  for (const node of map.values()) {
    node.replies.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
  return roots;
}
function findCommentById(tree: CommentWithReplies[], id: string): CommentWithReplies | null {
  for (const node of tree) {
    if (node.id === id) return node;
    const hit = findCommentById(node.replies, id);
    if (hit) return hit;
  }
  return null;
}
function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
function renderMathContent(text: string) {
  // React escapes ordinary text. react-katex uses KaTeX's default trust=false;
  // do not pass user content to an HTML renderer or enable trusted commands.
  if (text.length > 5000) return text;
  return text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g).map((part, index) => {
    if (part.length > 2000 || index > 128) return <span key={index}>{part}</span>;
    if (part.startsWith('$$') && part.endsWith('$$')) {
      return <BlockMath key={index} math={part.slice(2, -2)} renderError={() => <span>{part}</span>} />;
    }
    if (part.startsWith('$') && part.endsWith('$')) {
      return <InlineMath key={index} math={part.slice(1, -1)} renderError={() => <span>{part}</span>} />;
    }
    return <span key={index}>{part}</span>;
  });
}

export default function CommentsSection() {
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [reactingCommentId, setReactingCommentId] = useState<string | null>(null);
  const [copiedCommentId, setCopiedCommentId] = useState<string | null>(null);
  const [highlightCommentId, setHighlightCommentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reactionsAvailable, setReactionsAvailable] = useState(false);
  const [reactionMessage, setReactionMessage] = useState('');

  const fetchComments = async () => {
    try {
      if (!supabase) throw new Error('Database not configured');
      // The six allowed fields are enforced independently by SQL grants/RLS.
      const { data, error } = await supabase.from('comments')
        .select('id, author_name, content, created_at, parent_id')
        .eq('is_visible', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const flat = (data || []) as CommentRow[];
      let reactionRows: ReactionRow[] = [];
      try {
        const result = await supabase.rpc('book_get_reactions', { p_token: getBrowserToken() });
        if (result.error) throw result.error;
        reactionRows = (result.data || []) as ReactionRow[];
        setReactionsAvailable(true);
        setReactionMessage('');
      } catch {
        setReactionsAvailable(false);
        setReactionMessage('Reactions are temporarily unavailable.');
      }
      const counts = new Map(reactionRows.map(r => [r.comment_id, r]));
      setComments(buildCommentTree(flat.map(c => {
        const r = counts.get(c.id);
        return { ...c, upvotes: Number(r?.upvotes ?? 0), downvotes: Number(r?.downvotes ?? 0),
          my_reaction: (r?.my_reaction === 1 ? 1 : r?.my_reaction === -1 ? -1 : 0) as 1 | -1 | 0 };
      })));
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const targetId = getCommentIdFromUrl();
    if (!targetId) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(`comment-${targetId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setHighlightCommentId(targetId);
        timeout = setTimeout(() => setHighlightCommentId(null), 4500);
      }
    });
    return () => { cancelAnimationFrame(frame); if (timeout) clearTimeout(timeout); };
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (isSubmitting) return;
    const name = authorName.trim() || 'Anonymous';
    const address = email.trim();
    const body = content.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) || address.length > 100) {
      setSubmitMessage('Please enter a valid email address.'); return;
    }
    if (!body || body.length > 5000 || name.length > 100) {
      setSubmitMessage('Please check the name and comment length.'); return;
    }
    if (!supabase) { setSubmitMessage('Comments are temporarily unavailable.'); return; }
    setIsSubmitting(true);
    setSubmitMessage('');
    try {
      const { error } = await supabase.rpc('book_submit_comment', {
        p_author_name: name, p_email: address, p_content: body,
        p_parent_id: parentId, p_token: getBrowserToken(),
      });
      if (error) throw error;
      setSubmitMessage('Comment submitted successfully! It will appear after moderation.');
      setAuthorName(''); setEmail(''); setContent(''); setReplyingTo(null);
      // Do not invoke the old public email notification endpoint.
    } catch (err) {
      const message = typeof err === 'object' && err !== null && 'message' in err ? String(err.message) : '';
      setSubmitMessage(message.includes('Rate limit') ? 'Too many submissions. Please try again later.' : 'Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async (commentId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/?comment=${encodeURIComponent(commentId)}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Comment link', url });
      else {
        await navigator.clipboard.writeText(url);
        setCopiedCommentId(commentId);
        setTimeout(() => setCopiedCommentId(null), 1500);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedCommentId(commentId);
        setTimeout(() => setCopiedCommentId(null), 1500);
      } catch { setReactionMessage('Unable to copy the comment link.'); }
    }
  };

  const handleReaction = async (commentId: string, reaction: Reaction) => {
    if (!supabase || !reactionsAvailable || reactingCommentId !== null) return;
    setReactingCommentId(commentId);
    setReactionMessage('');
    try {
      const current = findCommentById(comments, commentId)?.my_reaction ?? 0;
      const { error } = await supabase.rpc('book_set_reaction', {
        p_comment_id: commentId, p_reaction: current === reaction ? 0 : reaction,
        p_token: getBrowserToken(),
      });
      if (error) throw error;
      await fetchComments();
    } catch (err) {
      const message = typeof err === 'object' && err !== null && 'message' in err ? String(err.message) : '';
      setReactionMessage(message.includes('Rate limit') ? 'Too many reactions. Please try again later.' : 'Failed to save reaction. Please try again.');
    } finally { setReactingCommentId(null); }
  };

  const totalCommentCount = useMemo(() => {
    const countTree = (nodes: CommentWithReplies[]): number => nodes.reduce((acc, n) => acc + 1 + countTree(n.replies), 0);
    return countTree(comments);
  }, [comments]);

  const renderComment = (comment: CommentWithReplies, depth = 0): JSX.Element => {
    const isReplying = replyingTo === comment.id;
    const up = comment.upvotes ?? 0;
    const down = comment.downvotes ?? 0;
    const mine = comment.my_reaction ?? 0;
    const isHighlighted = highlightCommentId === comment.id;
    return (
      <div key={comment.id} id={`comment-${comment.id}`} className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}>
        <div className={[
          'bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600',
          isHighlighted ? 'ring-2 ring-orange-300 dark:ring-orange-400' : '',
        ].join(' ')}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-800 dark:text-slate-100">{comment.author_name}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(comment.created_at)}</span>
          </div>
          <div className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap mb-3">
            {renderMathContent(comment.content)}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setReplyingTo(isReplying ? null : comment.id)}
              className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-400 font-medium">
              <Reply className="w-3 h-3" />{isReplying ? 'Cancel' : 'Reply'}
            </button>
            <button type="button" disabled={!reactionsAvailable || reactingCommentId !== null}
              onClick={() => handleReaction(comment.id, 1)} aria-pressed={mine === 1}
              className={`flex items-center gap-1 text-xs font-medium ${mine === 1 ? 'text-green-700 dark:text-green-400' : 'text-slate-600 dark:text-slate-300'} hover:text-green-700 dark:hover:text-green-400 disabled:opacity-50`}
              title="Thumbs up">
              <ThumbsUp className="w-3.5 h-3.5" />{reactionsAvailable ? up : '–'}
            </button>
            <button type="button" disabled={!reactionsAvailable || reactingCommentId !== null}
              onClick={() => handleReaction(comment.id, -1)} aria-pressed={mine === -1}
              className={`flex items-center gap-1 text-xs font-medium ${mine === -1 ? 'text-red-700 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'} hover:text-red-700 dark:hover:text-red-400 disabled:opacity-50`}
              title="Thumbs down">
              <ThumbsDown className="w-3.5 h-3.5" />{reactionsAvailable ? down : '–'}
            </button>
            <button type="button" onClick={() => handleShare(comment.id)}
              className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
              title="Copy/share link to this comment">
              {copiedCommentId === comment.id ? <><Check className="w-3.5 h-3.5" />Copied</> : <><Link2 className="w-3.5 h-3.5" />Share</>}
            </button>
          </div>
          {isReplying && (
            <form onSubmit={e => handleSubmit(e, comment.id)} className="mt-3 space-y-3 border-t border-slate-300 dark:border-slate-600 pt-3">
              <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Name (optional)"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" maxLength={100} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (required) *" required
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" maxLength={100} />
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write a reply... (supports LaTeX: $inline$ or $$block$$)" rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none" maxLength={5000} required />
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">{content.length}/5000 characters</p>
                <button type="submit" disabled={isSubmitting}
                  className="flex items-center gap-1 px-4 py-1.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send className="w-3 h-3" />{isSubmitting ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
              {submitMessage && <p role="status" className="text-sm text-slate-600 dark:text-slate-300">{submitMessage}</p>}
            </form>
          )}
        </div>
        {comment.replies.length > 0 && <div className="mt-2">{comment.replies.map(r => renderComment(r, depth + 1))}</div>}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-orange-400" />
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Discussion &amp; Feedback</h2>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Your email address will not be published. Required fields are marked <span className="text-red-500">*</span>. New comments and replies are subject to moderation.
      </p>
      <form onSubmit={e => handleSubmit(e, null)} className="mb-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="authorName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name <span className="text-slate-400 text-xs">(optional)</span></label>
            <input type="text" id="authorName" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Your name (leave empty for Anonymous)"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" maxLength={100} />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email <span className="text-red-500">*</span></label>
            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@example.com" required
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" maxLength={100} />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Comment <span className="text-red-500">*</span> <span className="text-xs text-slate-400 dark:text-slate-400">(supports LaTeX: $inline$ or $$block$$)</span></label>
            <textarea id="content" value={content} onChange={e => setContent(e.target.value)} placeholder="Share your thoughts, questions, or feedback... Use $x^2$ for inline math or $$\int_0^1 x^2 dx$$ for block math." rows={4}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none" maxLength={5000} required />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{content.length}/5000 characters</p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <button type="submit" disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Send className="w-4 h-4" />{isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
            {submitMessage && <p role="status" className={`text-sm ${submitMessage.includes('successfully') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{submitMessage}</p>}
          </div>
        </div>
      </form>
      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Comments ({totalCommentCount})</h3>
        {reactionMessage && <p role="status" className="text-sm text-slate-500 dark:text-slate-400 mb-3">{reactionMessage}</p>}
        {loading ? <p className="text-slate-500 dark:text-slate-400 text-center py-8">Loading comments...</p> : loadError ?
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">Comments are temporarily unavailable.</p> : comments.length === 0 ?
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">No comments yet. Be the first to share your thoughts!</p> :
          <div className="space-y-4">{comments.map(c => renderComment(c))}</div>}
      </div>
    </div>
  );
}
