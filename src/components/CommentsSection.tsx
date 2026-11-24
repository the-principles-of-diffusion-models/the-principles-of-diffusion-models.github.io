
import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface CommentRow {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  parent_id: string | null;
}

const DISCUSSION_URL =
  'https://github.com/the-principles-of-diffusion-models/' +
  'the-principles-of-diffusion-models.github.io/discussions';

export default function CommentsSection() {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        if (!supabase) {
          setError(true);
          return;
        }

        const { data, error } = await supabase
          .from('comments')
          .select(
            'id, author_name, content, created_at, parent_id'
          )
          .eq('is_visible', true)
          .order('created_at', { ascending: false });

        if (error) {
          setError(true);
        } else {
          setComments((data || []) as CommentRow[]);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  function renderMathContent(content: string) {
    return content
      .split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g)
      .map((part, index) => {
        if (part.length > 5000) {
          return <span key={index}>{part}</span>;
        }

        if (part.startsWith('$$') && part.endsWith('$$')) {
          return (
            <BlockMath
              key={index}
              math={part.slice(2, -2)}
              renderError={() => <span>{part}</span>}
            />
          );
        }

        if (part.startsWith('$') && part.endsWith('$')) {
          return (
            <InlineMath
              key={index}
              math={part.slice(1, -1)}
              renderError={() => <span>{part}</span>}
            />
          );
        }

        return <span key={index}>{part}</span>;
      });
  }

  function renderComment(
    comment: CommentRow,
    depth = 0
  ): JSX.Element {
    const replies = comments
      .filter((c) => c.parent_id === comment.id)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );

    return (
      <div
        key={comment.id}
        id={`comment-${comment.id}`}
        className={depth > 0 ? 'ml-6 mt-3' : 'mb-4'}
      >
        <div className="rounded-lg border border-slate-200
          dark:border-slate-600 bg-slate-50
          dark:bg-slate-700 p-4">

          <div className="flex justify-between mb-2">
            <span className="font-semibold">
              {comment.author_name}
            </span>

            <span className="text-xs text-slate-500
              dark:text-slate-300">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="whitespace-pre-wrap break-words">
            {renderMathContent(comment.content)}
          </div>
        </div>

        {depth < 12 &&
          replies.map((reply) =>
            renderComment(reply, depth + 1)
          )}
      </div>
    );
  }

  return (
    <section className="bg-white dark:bg-slate-800
      rounded-xl shadow-lg border border-slate-200
      dark:border-slate-700 p-8">

      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-orange-400" />
        <h2 className="text-2xl font-semibold">
          Discussion & Feedback
        </h2>
      </div>

      <p className="mb-4 text-sm text-slate-600
        dark:text-slate-300">
        For questions, feedback, and suggestions,
        please join our GitHub Discussions.
      </p>

      <a
        href={DISCUSSION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mb-8 px-5 py-3
          rounded-lg bg-orange-500 hover:bg-orange-600
          font-medium text-white"
      >
        Join the Discussion
      </a>

      <h3 className="text-lg font-semibold mb-4">
        Previous Comments
      </h3>

      {loading && <p>Loading comments...</p>}

      {error && (
        <p>Previous comments are temporarily unavailable.</p>
      )}

      {!loading && !error &&
        comments
          .filter((comment) => comment.parent_id === null)
          .map((comment) => renderComment(comment))}
    </section>
  );
}
