import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import DarkModeToggle from '../components/DarkModeToggle';

export default function Publisher() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <DarkModeToggle />
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={() => sessionStorage.setItem('scrollToTab', 'publisher')}
          className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-500 mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-orange-100 p-6 rounded-full">
              <ExternalLink className="w-16 h-16 text-orange-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Publisher Version
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            The publisher version is not yet available.
          </p>
          <p className="text-slate-500">
            Once the publisher is finalized, this page will link to the official published version.
          </p>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
