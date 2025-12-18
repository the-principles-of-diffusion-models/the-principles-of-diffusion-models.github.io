import { ArrowLeft, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import DarkModeToggle from '../components/DarkModeToggle';

export default function Errata() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <DarkModeToggle />
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* ✅ EXACT same Back-to-Home styling as your BlogPost page */}
        <Link
          to="/"
          onClick={() => sessionStorage.setItem('scrollToTab', 'errata')}
          className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-400 mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <article className="prose prose-lg prose-slate max-w-none">
          <header className="mb-10 pb-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <Quote className="w-7 h-7 text-orange-400 dark:text-orange-300" />
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white leading-tight">Errata</h1>
            </div>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Corrections, clarifications, and small fixes for the monograph.
            </p>
          </header>

          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Current Errata</h2>
              <p className="text-slate-700 dark:text-slate-300">
                (Add entries here. You can format them as a numbered list with page/section + correction.)
              </p>

              <div className="mt-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
                <p className="text-slate-700 dark:text-slate-300 m-0">
                  <strong>Example:</strong> p. 123, Eq. (9.7): replace “…” with “…” (explanation…)
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Report an issue</h2>
              <p className="text-slate-700 dark:text-slate-300">
                If you spot an error, please open an issue or send a message to the authors (include page/section and a
                suggested correction).
              </p>
            </section>
          </div>
        </article>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <Link
            to="/"
            onClick={() => sessionStorage.setItem('scrollToTab', 'errata')}
            className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-400 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
