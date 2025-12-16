import { useState, useEffect, useRef } from 'react';
import { ExternalLink, BookOpen, FileText, GraduationCap, Copy, Check, Users, Mail, Newspaper, Library, Feather, Quote } from 'lucide-react';
import { getVisitorCount } from '../lib/visitorTracking';
import ScrollToTop from '../components/ScrollToTop';
import CommentsSection from '../components/CommentsSection';
import DarkModeToggle from '../components/DarkModeToggle';

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const accessBookRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getVisitorCount().then(setVisitorCount);

    const scrollToTab = sessionStorage.getItem('scrollToTab');
    if (scrollToTab && accessBookRef.current) {
      setTimeout(() => {
        accessBookRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        sessionStorage.removeItem('scrollToTab');
      }, 100);
    }
  }, []);

  const bibtex = `@article{lai2025principles,
  title={The principles of diffusion models},
  author={Lai, Chieh-Hsin and Song, Yang and Kim, Dongjun and Mitsufuji, Yuki and Ermon, Stefano},
  journal={arXiv preprint arXiv:2510.21890},
  year={2025}
}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(bibtex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  type Tab = {
    id: string;
    label: string;
    icon: typeof FileText;
    type: 'external' | 'internal';
    url?: string;
    path?: string;
  };

  const authors = [
    {
      name: 'Chieh-Hsin Lai',
      emails: ['chieh-hsin.lai@sony.com', 'chiehhsinlai@gmail.com'],
      twitter: 'https://x.com/JCJesseLai',
    },
    {
      name: 'Yang Song',
      emails: ['thusongyang@gmail.com'],
    },
    {
      name: 'Dongjun Kim',
      emails: ['dongjun@stanford.edu'],
    },
    {
      name: 'Yuki Mitsufuji',
      emails: ['yuhki.mitsufuji@sony.com'],
    },
    {
      name: 'Stefano Ermon',
      emails: ['ermon@cs.stanford.edu'],
    },
  ];

  const tabsRow1: Tab[] = [
    {
      id: 'arxiv',
      label: 'arXiv',
      icon: FileText,
      type: 'external',
      url: 'https://arxiv.org/abs/2510.21890',
    },
    {
      id: 'blog',
      label: 'Blog Post (Compact)',
      icon: Feather,
      type: 'internal',
      path: '/blog',
    },
    {
      id: 'teaching',
      label: 'Teaching Guide',
      icon: GraduationCap,
      type: 'internal',
      path: '/teaching',
    },
  ];

  const tabsRow2: Tab[] = [
    {
      id: 'read-online',
      label: 'Read Online',
      icon: BookOpen,
      type: 'internal',
      path: '/read-online',
    },
    {
      id: 'publisher',
      label: 'Publisher Version',
      icon: ExternalLink,
      type: 'internal',
      path: '/publisher',
    },
  ];

  const handleTabClick = (tab: Tab) => {
    if (tab.type === 'external' && tab.url) {
      window.open(tab.url, '_blank', 'noopener,noreferrer');
    } else if (tab.type === 'internal' && tab.path) {
      sessionStorage.setItem('scrollToTab', tab.id);
      window.location.href = tab.path;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-200 bg-[#F8F2FF] dark:bg-slate-900">
      <DarkModeToggle />
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-3 leading-tight">
            The Principles of Diffusion Models
          </h1>
          <p className="text-2xl text-slate-700 dark:text-slate-300 dark:text-slate-300 font-medium mb-6">
            From Origins to Advances
          </p>
        </header>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Authors</h2>
          </div>
          <div className="space-y-2">
            {authors.map((author, index) => (
              <div key={index} className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-2 last:pb-0">
                <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{author.name}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {author.emails.map((email, emailIndex) => (
                    <a
                      key={emailIndex}
                      href={`mailto:${email}`}
                      className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-orange-400 dark:hover:text-orange-300 transition-colors"
                    >
                      <Mail className="w-3 h-3" />
                      {email}
                    </a>
                  ))}
                  {author.twitter && (
                    <a
                      href={author.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-orange-400 dark:hover:text-orange-300 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      @JCJesseLai
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Feather className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Abstract</h2>
          </div>
          <div className="text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
            <p>
              This book focuses on the principles that have shaped the development of diffusion models, tracing their origins and showing how different formulations arise from common mathematical ideas. Diffusion modeling begins by specifying a forward corruption process that gradually turns data into noise. This forward process links the data distribution to a simple noise distribution by defining a continuous family of intermediate distributions. The core objective of a diffusion model is to construct another process that runs in the opposite direction, transforming noise into data while recovering the same intermediate distributions defined by the forward corruption process.
            </p>
            <p>
              We describe three complementary ways to formalize this idea. The variational view, inspired by variational autoencoders, sees diffusion as learning to remove noise step by step, solving small denoising objectives that together teach the model to turn noise back into data. The score-based view, rooted in energy-based modeling, learns the gradient of the evolving data distribution, which indicates how to nudge samples toward more likely regions. The flow-based view, related to normalizing flows, treats generation as following a smooth path that moves samples from noise to data under a learned velocity field.
            </p>
            <p>
              These perspectives share a common backbone: a learned time-dependent velocity field whose flow transports a simple prior to the data. With this in hand, sampling amounts to solving a differential equation that evolves noise into data along a continuous generative trajectory. On this foundation, the monograph discusses guidance for controllable generation, advanced numerical solvers for efficient sampling, and diffusion-motivated flow-map models that learn direct mappings between arbitrary times along this trajectory.
            </p>
            <p>
              This monograph is written for readers with a basic deep learning background who seek a clear, conceptual, and mathematically grounded understanding of diffusion models. It clarifies the theoretical foundations, explains the reasoning behind their diverse formulations, and provides a stable footing for further study and research in this rapidly evolving field. It serves both as a principled reference for researchers and as an accessible entry point for learners.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Newspaper className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">News & Updates</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border-l-4 border-orange-500">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">Coming Soon</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                Publisher for physical print version is currently being sorted out. Stay tuned for updates on availability.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border-l-4 border-slate-500">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">2025/12/16</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                Added <strong>Teaching Guide</strong> and <strong>Blog Post (Compact)</strong> sections for enhanced learning resources and accessible content overview.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border-l-4 border-slate-500">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">2025/12/15</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                Official webpage established to provide comprehensive access to <em>The Principles of Diffusion Models</em> monograph and related resources.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border-l-4 border-slate-500">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">2025/10/24</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                Our book <strong>The Principles of Diffusion Models</strong> was made publicly available on arXiv.
              </p>
            </div>
          </div>
        </div>

        <div ref={accessBookRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Library className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Access the Book</h2>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-3">
                {tabsRow1.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab)}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 bg-orange-400 hover:bg-orange-500 text-white shadow-md"
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {tabsRow2.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab)}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 bg-orange-400 hover:bg-orange-500 text-white shadow-md"
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Quote className="w-6 h-6 text-orange-400 dark:text-orange-300" />
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">How to Cite</h2>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-400 hover:bg-orange-500 dark:bg-orange-500 dark:hover:bg-orange-600 rounded-lg transition-colors text-white font-semibold shadow-md hover:shadow-lg"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy BibTeX
                </>
              )}
            </button>
          </div>
          <pre className="bg-white dark:bg-slate-900 border-2 border-orange-100 dark:border-slate-600 rounded-lg p-6 overflow-x-auto text-sm font-mono text-slate-800 dark:text-slate-100 leading-relaxed shadow-inner">
            {bibtex}
          </pre>
        </div>

        <CommentsSection />

        <footer className="mt-12 text-slate-500 text-sm">
          <div className="flex items-center justify-end gap-2 mb-1 text-slate-400 dark:text-slate-500">
            <Users className="w-4 h-4" />
            <span>{visitorCount.toLocaleString()} visitors</span>
          </div>
          <p className="text-center">© 2025 The Principles of Diffusion Models. All rights reserved.</p>
        </footer>
      </div>

      <ScrollToTop />
    </div>
  );
}

