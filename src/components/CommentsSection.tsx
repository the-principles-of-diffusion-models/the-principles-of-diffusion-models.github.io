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
  // optional fields we compute client-side:
  upvotes?: number;
  downvotes?: number;
  my_reaction?: 1 | -1 | 0;
}

interface CommentWithReplies extends CommentRow {
  replies: CommentWithReplies[];
}

type Reaction = 1 | -1;

export default function CommentsSection() {
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // UX state for reactions/share
  const [reactingCommentId, setReactingCommentId] = useState<string | null>(null);
  const [copiedCommentId, setCopiedCommentId] = useState<string | null>(null);
  const [highlightCommentId, setHighlightCommentId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If someone opens a shared link like /#/?comment=<id>, scroll + highlight once comments load.
  useEffect(() => {
    const targetId = getCommentIdFromUrl();
    if (!targetId) return;

    // wait a tick so DOM is painted
    requestAnimationFrame(() => {
      const el = document.getElementById(`comment-${targetId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setHighlightCommentId(targetId);
        setTimeout(() => setHighlightCommentId(null), 4500);
      }
    });
  }, [comments]);

  function getCommentIdFromUrl(): string | null {
    // HashRouter URL looks like: https://.../#/?comment=<uuid>
    const hash = window.location.hash || '';
    const qIndex = hash.indexOf('?');
    const queryString = qIndex >= 0 ? hash.slice(qIndex + 1) : '';
    const qs = new URLSearchParams(queryString);
    return qs.get('comment');
  }

  async function getOrCreateVisitorId(): Promise<string> {
    const stored = localStorage.getItem('visitor_id');
    if (stored) return stored;

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      String(new Date().getTimezoneOffset()),
      String(screen.width),
      String(screen.height),
      String(screen.colorDepth),
    ].join('|');

    const msgBuffer = new TextEncoder().encode(fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    const visitorId = `v_${hashHex.substring(0, 32)}`;

    localStorage.setItem('visitor_id', visitorId);
    return visitorId;
  }

  const fetchComments = async () => {
    if (!supabase) {
      setComments([]);
      return;
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
      return;
    }

    const flat = (data || []) as CommentRow[];
    const ids = flat.map((c) => c.id);

    // Merge in reaction counts + the current visitor's reaction
    const visitorId = await getOrCreateVisitorId();
    const reactionInfo = await fetchReactionInfo(ids, visitorId);

    const enriched: CommentRow[] = flat.map((c) => {
      const r = reactionInfo.get(c.id);
      return {
        ...c,
        upvotes: r?.up ?? 0,
        downvotes: r?.down ?? 0,
        my_reaction: (r?.mine ?? 0) as 1 | -1 | 0,
      };
    });

    const tree = buildCommentTree(enriched);
    setComments(tree);
  };

  async function fetchReactionInfo(
    commentIds: string[],
    visitorId: string
  ): Promise<Map<string, { up: number; down: number; mine: Reaction | 0 }>> {
    const result = new Map<string, { up: number; down: number; mine: Reaction | 0 }>();
    if (!supabase) return result;
    if (commentIds.length === 0) return result;

    const { data, error } = await supabase
      .from('comment_reactions')
      .select('comment_id, visitor_id, reaction')
      .in('comment_id', commentIds);

    if (error) {
      console.error('Error fetching comment reactions:', error);
      return result;
    }

    for (const row of data || []) {
      const cid = row.comment_id as string;
      const reaction = row.reaction as Reaction;
      const vid = row.visitor_id as string;

      const cur = result.get(cid) ?? { up: 0, down: 0, mine: 0 as Reaction | 0 };
      if (reaction === 1) cur.up += 1;
      if (reaction === -1) cur.down += 1;
      if (vid === visitorId) cur.mine = reaction;
      result.set(cid, cur);
    }

    return result;
  }

  const buildCommentTree = (flatComments: CommentRow[]): CommentWithReplies[] => {
    const commentMap = new Map<string, CommentWithReplies>();
    const rootComments: CommentWithReplies[] = [];

    flatComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    flatComments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) parent.replies.push(commentWithReplies);
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    rootComments.forEach((comment) => {
      comment.replies.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    return rootComments;
  };

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();

    if (!content.trim()) {
      setSubmitMessage('Please enter a comment');
      setTimeout(() => setSubmitMessage(''), 3000);
      return;
    }

    if (!supabase) {
      setSubmitMessage('Comments are disabled (database not configured).');
      setTimeout(() => setSubmitMessage(''), 5000);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    const commentData = {
      author_name: authorName.trim() || 'Anonymous',
      content: content.trim(),
      parent_id: parentId,
    };

    const { error } = await supabase.from('comments').insert(commentData);

    if (error) {
      console.error('Error submitting comment:', error);
      setSubmitMessage('Failed to submit comment. Please try again.');
    } else {
      setSubmitMessage('Comment posted successfully!');
      setAuthorName('');
      setContent('');
      setReplyingTo(null);
      await fetchComments();
      sendEmailNotification(commentData);
    }

    setIsSubmitting(false);
    setTimeout(() => setSubmitMessage(''), 5000);
  };

  const sendEmailNotification = async (commentData: {
    author_name: string;
    content: string;
    parent_id: string | null;
  }) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseAnonKey) return;

      await fetch(`${supabaseUrl}/functions/v1/notify-comment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMathContent = (text: string) => {
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let key = 0;

    const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;

    let blockMatch;
    const blockMatches: Array<{ index: number; length: number; content: string }> = [];

    while ((blockMatch = blockMathRegex.exec(text)) !== null) {
      blockMatches.push({
        index: blockMatch.index,
        length: blockMatch[0].length,
        content: blockMatch[1],
      });
    }

    blockMatches.forEach((match) => {
      if (lastIndex < match.index) {
        processInlineMatches(text.substring(lastIndex, match.index));
      }

      parts.push(
        <div key={key++} className="my-2">
          <BlockMath math={match.content} />
        </div>
      );

      lastIndex = match.index + match.length;
    });

    if (lastIndex < text.length) {
      processInlineMatches(text.substring(lastIndex));
    }

    function processInlineMatches(str: string) {
      let inlineLastIndex = 0;
      let inlineMatch;
      const inlineRegex = /\$((?!\$)[^\$]*?)\$/g;

      while ((inlineMatch = inlineRegex.exec(str)) !== null) {
        if (inlineLastIndex < inlineMatch.index) {
          parts.push(<span key={key++}>{str.substring(inlineLastIndex, inlineMatch.index)}</span>);
        }

        parts.push(<InlineMath key={key++} math={inlineMatch[1]} />);
        inlineLastIndex = inlineMatch.index + inlineMatch[0].length;
      }

      if (inlineLastIndex < str.length) {
        parts.push(<span key={key++}>{str.substring(inlineLastIndex)}</span>);
      }
    }

    return parts.length > 0 ? <>{parts}</> : text;
  };

  function buildShareUrl(commentId: string): string {
    // Always share the HOME route with a query in the hash:
    // https://.../#/?comment=<id>
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}#/?comment=${encodeURIComponent(commentId)}`;
  }

  const handleShare = async (commentId: string) => {
    const url = buildShareUrl(commentId);

    try {
      // Prefer native share if available, else copy
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav: any = navigator;

      if (nav.share) {
        await nav.share({ title: 'Comment link', url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopiedCommentId(commentId);
        setTimeout(() => setCopiedCommentId(null), 1500);
      }
    } catch (e) {
      // fallback: copy
      try {
        await navigator.clipboard.writeText(url);
        setCopiedCommentId(commentId);
        setTimeout(() => setCopiedCommentId(null), 1500);
      } catch (err) {
        console.error('Share/copy failed:', err);
      }
    }
  };

  const handleReaction = async (commentId: string, reaction: Reaction) => {
    if (!supabase) {
      setSubmitMessage('Reactions are disabled (database not configured).');
      setTimeout(() => setSubmitMessage(''), 4000);
      return;
    }

    setReactingCommentId(commentId);

    try {
      const visitorId = await getOrCreateVisitorId();

      // Find current reaction from state
      const current = findCommentById(comments, commentId)?.my_reaction ?? 0;

      if (current === reaction) {
        // toggle off → delete row
        const { error } = await supabase
          .from('comment_reactions')
          .delete()
          .eq('comment_id', commentId)
          .eq('visitor_id', visitorId);

        if (error) console.error('Error removing reaction:', error);
      } else {
        // upsert new reaction
        const { error } = await supabase
          .from('comment_reactions')
          .upsert(
            { comment_id: commentId, visitor_id: visitorId, reaction },
            { onConflict: 'comment_id,visitor_id' }
          );

        if (error) console.error('Error upserting reaction:', error);
      }

      await fetchComments();
    } catch (e) {
      console.error('Error reacting to comment:', e);
    } finally {
      setReactingCommentId(null);
    }
  };

  function findCommentById(tree: CommentWithReplies[], id: string): CommentWithReplies | null {
    for (const c of tree) {
      if (c.id === id) return c;
      const hit = findCommentById(c.replies, id);
      if (hit) return hit;
    }
    return null;
  }

  const totalCommentCount = useMemo(() => {
    const countTree = (nodes: CommentWithReplies[]): number =>
      nodes.reduce((acc, n) => acc + 1 + countTree(n.replies), 0);
    return countTree(comments);
  }, [comments]);

  const renderComment = (comment: CommentWithReplies, depth: number = 0) => {
    const isReplying = replyingTo === comment.id;
    const up = comment.upvotes ?? 0;
    const down = comment.downvotes ?? 0;
    const mine = comment.my_reaction ?? 0;
    const isHighlighted = highlightCommentId === comment.id;

    return (
      <div
        key={comment.id}
        id={`comment-${comment.id}`}
        className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}
      >
        <div
          className={[
            'bg-slate-50 rounded-lg p-4 border border-slate-200',
            isHighlighted ? 'ring-2 ring-orange-300' : '',
          ].join(' ')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-800">{comment.author_name}</span>
            <span className="text-xs text-slate-500">{formatDate(comment.created_at)}</span>
          </div>

          <div className="text-slate-700 whitespace-pre-wrap mb-3">
            {renderMathContent(comment.content)}
          </div>

          {/* actions row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setReplyingTo(isReplying ? null : comment.id)}
              className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-400 font-medium"
            >
              <Reply className="w-3 h-3" />
              {isReplying ? 'Cancel' : 'Reply'}
            </button>

            <button
              type="button"
              disabled={reactingCommentId === comment.id}
              onClick={() => handleReaction(comment.id, 1)}
              className={`flex items-center gap-1 text-xs font-medium ${
                mine === 1 ? 'text-green-700' : 'text-slate-600'
              } hover:text-green-700 disabled:opacity-50`}
              title="Thumbs up"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {up}
            </button>

            <button
              type="button"
              disabled={reactingCommentId === comment.id}
              onClick={() => handleReaction(comment.id, -1)}
              className={`flex items-center gap-1 text-xs font-medium ${
                mine === -1 ? 'text-red-700' : 'text-slate-600'
              } hover:text-red-700 disabled:opacity-50`}
              title="Thumbs down"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              {down}
            </button>

            <button
              type="button"
              onClick={() => handleShare(comment.id)}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium"
              title="Copy/share link to this comment"
            >
              {copiedCommentId === comment.id ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5" />
                  Share
                </>
              )}
            </button>
          </div>

          {isReplying && (
            <form
              onSubmit={(e) => handleSubmit(e, comment.id)}
              className="mt-3 space-y-3 border-t border-slate-300 pt-3"
            >
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Name (optional)"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                maxLength={100}
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a reply... (supports LaTeX: $inline$ or $$block$$)"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                maxLength={5000}
                required
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">{content.length}/5000 characters</p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1 px-4 py-1.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3 h-3" />
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </form>
          )}
        </div>

        {comment.replies.length > 0 && (
          <div className="mt-2">{comment.replies.map((r) => renderComment(r, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-orange-400" />
        <h2 className="text-2xl font-semibold text-slate-800">Discussion & Feedback</h2>
      </div>

      <form onSubmit={(e) => handleSubmit(e, null)} className="mb-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="authorName" className="block text-sm font-medium text-slate-700 mb-2">
              Name (optional)
            </label>
            <input
              type="text"
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Anonymous"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-2">
              Comment * <span className="text-xs text-slate-500">(supports LaTeX: $inline$ or $$block$$)</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or feedback... Use $x^2$ for inline math or $$\int_0^1 x^2 dx$$ for block math."
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
              maxLength={5000}
              required
            />
            <p className="text-xs text-slate-500 mt-1">{content.length}/5000 characters</p>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>

            {submitMessage && (
              <p
                className={`text-sm ${
                  submitMessage.includes('success') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {submitMessage}
              </p>
            )}
          </div>
        </div>
      </form>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Comments ({totalCommentCount})</h3>

        {comments.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          <div className="space-y-4">{comments.map((c) => renderComment(c))}</div>
        )}
      </div>
    </div>
  );
}
