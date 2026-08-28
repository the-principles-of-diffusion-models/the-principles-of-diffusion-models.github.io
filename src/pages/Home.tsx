// src/pages/Home.tsx
import { useState, useEffect, useRef } from 'react';
import type { TouchEvent } from 'react';
import {
  ExternalLink,
  Code,
  FileText,
  GraduationCap,
  Copy,
  Check,
  Users,
  Mail,
  Newspaper,
  Library,
  Feather,
  Quote,
  FileWarning,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getVisitorCount } from '../lib/visitorTracking';
import ScrollToTop from '../components/ScrollToTop';
import CommentsSection from '../components/CommentsSection';
import DarkModeToggle from '../components/DarkModeToggle';

// Injected at build time by Vite (see vite.config.ts).
// Falls back to current date if not defined (e.g., during local dev).
const BUILD_DATE = typeof __BUILD_TIMESTAMP__ !== 'undefined'
  ? __BUILD_TIMESTAMP__
  : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

/* =========================
 Social post preview
 ========================= */

function XPostPreview() {
  const postUrl = 'https://x.com/JCJesseLai/status/1983325172909433002?s=20';

  useEffect(() => {
    const loadTweet = () => {
      const twttr = (window as any).twttr;
      if (twttr?.widgets?.load) {
        twttr.widgets.load();
      }
    };

    const existingScript = document.querySelector(
      'script[src="https://platform.twitter.com/widgets.js"]'
    );

    if (existingScript) {
      loadTweet();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    script.onload = loadTweet;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] font-semibold text-orange-500 dark:text-orange-300">
              Social announcement
            </p>

            <h4 className="mt-1 text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              Follow the public discussion and latest updates on X
            </h4>
          </div>

          <a
            href={postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Open on X
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

      </div>

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-md">
        <div className="mx-auto max-w-[560px]">
          <blockquote
            className="twitter-tweet"
            data-dnt="true"
            data-conversation="none"
            data-align="center"
            data-theme="light"
          >
            <a href={postUrl}>View the announcement post on X</a>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Page
   ========================= */

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const accessBookRef = useRef<HTMLDivElement>(null);
  const [aboutActive, setAboutActive] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const overviewCardRef = useRef<HTMLDivElement | null>(null);
  const [overviewHeight, setOverviewHeight] = useState<number | null>(null);

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

  useEffect(() => {
    const el = overviewCardRef.current;
    if (!el) return;
    const update = () => setOverviewHeight(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
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
    badge?: string;
  };

  const authors = [
    {
      name: 'Chieh-Hsin Lai',
      emails: ['chieh-hsin.lai@sony.com', 'chiehhsinlai@gmail.com'],
      twitter: 'https://x.com/JCJesseLai',
    },
    { name: 'Yang Song', emails: ['thusongyang@gmail.com'] },
    { name: 'Dongjun Kim', emails: ['partitionsofunity@gmail.com'] },
    { name: 'Yuki Mitsufuji', emails: ['yuhki.mitsufuji@sony.com'] },
    { name: 'Stefano Ermon', emails: ['ermon@cs.stanford.edu'] },
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
      label: 'Blog Post',
      icon: Feather,
      type: 'internal',
      path: '/blog',
      badge: "ICLR'26 Blog Post Track",
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
    id: 'codes',
    label: 'Codes',
    icon: Code,
    type: 'internal',
    path: '/codes',
  },
  {
    id: 'errata',
    label: 'Update & Errata',
    icon: FileWarning,
    type: 'internal',
    path: '/errata',
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

  // TOC blocks
  const aboutSlides: Array<{
    heading: string;
    body: JSX.Element;
  }> = [
    {
      heading: 'Overview: About the Book',
      body: (
        <div className="text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
          <p>
            This book focuses on the principles that have shaped the development of diffusion models,
            tracing their origins and showing how different formulations arise from common mathematical ideas.
            Diffusion modeling begins by specifying a forward corruption process that gradually turns data into noise.
            This forward process links the data distribution to a simple noise distribution by defining a continuous family
            of intermediate distributions. The core objective of a diffusion model is to construct another process that runs
            in the opposite direction, transforming noise into data while recovering the same intermediate distributions
            defined by the forward corruption process.
          </p>

          <p>
            We describe three complementary ways to formalize this idea. The variational view, inspired by variational autoencoders,
            sees diffusion as learning to remove noise step by step, solving small denoising objectives that together teach the model
            to turn noise back into data. The score-based view, rooted in energy-based modeling, learns the gradient of the evolving
            data distribution, which indicates how to nudge samples toward more likely regions. The flow-based view, related to
            normalizing flows, treats generation as following a smooth path that moves samples from noise to data under a learned velocity field.
          </p>

          <p>
            These perspectives share a common backbone: a learned time-dependent velocity field whose flow transports
            a simple prior to the data. With this in hand, sampling amounts to solving a differential equation that evolves
            noise into data along a continuous generative trajectory. On this foundation, the monograph discusses guidance
            — controllable generation — advanced numerical solvers — efficient sampling — and diffusion-motivated flow-map
            models — direct mappings between arbitrary times along this trajectory.
          </p>

          <p>
            This monograph is written for readers with a basic deep learning background who seek a clear, conceptual,
            and mathematically grounded understanding of diffusion models. It clarifies the theoretical foundations,
            explains the reasoning behind diverse formulations, and provides a stable footing for further study and research.
          </p>
        </div>
      ),
    },
    {
      heading: 'Announcement: Social Media Post',
      body: <XPostPreview />,
    },
  ];

  const goAbout = (i: number) => {
    const clamped = Math.max(0, Math.min(aboutSlides.length - 1, i));
    setAboutActive(clamped);
  };

  const prevAbout = () => goAbout(aboutActive - 1);
  const nextAbout = () => goAbout(aboutActive + 1);

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const end = e.changedTouches[0]?.clientX ?? start;
    const dx = end - start;
    if (dx > 50) prevAbout();
    if (dx < -50) nextAbout();
  };
  

return (
  <div className="relative min-h-screen transition-colors duration-200 bg-[#F8F2FF] dark:bg-slate-900">
    <DarkModeToggle />

    <div className="absolute left-4 right-20 top-4 z-40 flex justify-end sm:right-24">
      <span
        className="inline-flex max-w-[calc(100vw-7rem)] items-center truncate rounded-full px-4 py-2 text-[11px] font-bold tracking-wide shadow-lg sm:text-sm"
        style={{
          background:
            'linear-gradient(135deg, #d4a017 0%, #f5d442 40%, #ffe066 55%, #f5d442 70%, #b8860b 100%)',
          color: '#4a2800',
          boxShadow:
            '0 4px 16px rgba(180, 130, 20, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(180, 130, 20, 0.3)',
          textShadow: '0 1px 0 rgba(255, 255, 255, 0.3)',
        }}
      >
        Forthcoming from MIT Press, 2027
      </span>
    </div>

    <div className="max-w-5xl mx-auto px-4 pt-28 pb-12 sm:px-6 lg:px-8">
      <header className="text-center mb-8">
        <h1 className="text-5xl sm:text-[3.4rem] font-bold text-slate-900 dark:text-slate-100 leading-tight">
          The Principles of Diffusion Models
        </h1>
      </header>

        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
            </svg>
            Last updated: {BUILD_DATE}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              Authors
            </h2>
          </div>

          <div className="space-y-2">
            {authors.map((author, index) => (
              <div
                key={index}
                className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-2 last:pb-0"
              >
                <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                  {author.name}
                </p>
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

                  {(author as any).twitter && (
                    <a
                      href={(author as any).twitter}
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

        {/* About This Book */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Feather className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              About This Book
            </h2>
          </div>

          <div className="flex items-center justify-end mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={prevAbout}
                disabled={aboutActive === 0}
                className={
                  'inline-flex items-center justify-center rounded-lg border px-2.5 py-2 transition-colors ' +
                  'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 ' +
                  (aboutActive === 0
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800')
                }
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={nextAbout}
                disabled={aboutActive === aboutSlides.length - 1}
                className={
                  'inline-flex items-center justify-center rounded-lg border px-2.5 py-2 transition-colors ' +
                  'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 ' +
                  (aboutActive === aboutSlides.length - 1
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800')
                }
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${aboutActive * 100}%)` }}
            >
              {aboutSlides.map((s, idx) => {
                const isOverview = idx === 0;
                return (
                  <div key={idx} className="w-full flex-none">
                    <div
                      ref={isOverview ? overviewCardRef : undefined}
                      className={
                        'rounded-2xl border border-slate-200 dark:border-slate-700 ' +
                        'bg-slate-50 dark:bg-slate-900/40 p-6 shadow-sm ' +
                        (isOverview ? '' : 'flex flex-col')
                      }
                      style={!isOverview && overviewHeight ? { height: overviewHeight } : undefined}
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {s.heading}
                          </h3>
                        </div>
                        <span
                          className={
                            'mt-1 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ' +
                            (idx === 0
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200')
                          }
                        >
                          {idx + 1} / {aboutSlides.length}
                        </span>
                      </div>
                      {isOverview ? s.body : <div className="flex-1 min-h-0 overflow-y-auto pr-1">{s.body}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            {aboutSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goAbout(i)}
                className={
                  'h-2.5 w-2.5 rounded-full transition-colors ' +
                  (i === aboutActive
                    ? 'bg-orange-400 dark:bg-orange-300'
                    : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500')
                }
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* News & Updates */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Newspaper className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              News & Updates
            </h2>
          </div>

          <div
            className="max-h-[38rem] overflow-y-auto pr-3 space-y-4 overscroll-contain scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
            aria-label="Scrollable news and updates"
          >
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border-l-4 border-orange-500">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  Version 3 Now on arXiv
                </span>
              </div>
            
              <p className="text-slate-700 dark:text-slate-300">
                Our latest v3 is now on{" "}
                <a
                  href="https://arxiv.org/abs/2510.21890"
                  className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  arXiv
                </a>
                {" "}— ✨ new <strong>“Road Ahead”</strong> chapter on discrete diffusion
                {" "}· 🛠️ major restructuring, including a revised diffusion solvers chapter
                {" "}· 🧭 <strong>“reader guides”</strong> for every chapter.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border-l-4 border-orange-500">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  Coming Soon from MIT Press, 2027
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                The physical print edition will be published by <strong>MIT Press</strong>, 2027. Stay tuned for availability and more details.
              </p>
            </div>
            
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-4 border-l-4 border-violet-500">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                  2026/05/27
                </span>
              </div>
            
              <p className="text-slate-700 dark:text-slate-300">
                Version 2 of our book is now available on{" "}
                <a
                  href="https://arxiv.org/abs/2510.21890"
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  arXiv
                </a>
                . It incorporates community-reported errata — thank you! — and adds a walkthrough showing how the book&apos;s core principles extend to discrete diffusion. See{" "}
                <a
                  href="https://the-principles-of-diffusion-models.github.io/#/errata"
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 underline underline-offset-2"
                >
                  Update &amp; Errata
                </a>
                {" "}for details.
              </p>
            </div>            

            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-4 border-l-4 border-violet-500">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                  2026/06/03
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                We will give a tutorial at <strong>CVPR 2026</strong> based on the book, extended to cover discrete diffusion!
                Check out the{" "}
                <a
                  href="https://cvpr.thecvf.com/virtual/2026/tutorial/36147"
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CVPR official page
                </a>
                {" "}and{" "}
                <a
                  href="https://sites.google.com/view/cvpr26-principles-of-diffusion/home"
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  our tutorial project page
                </a>
                .
              </p>
            </div>

            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-4 border-l-4 border-violet-500">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                  2026/04/27
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                Our blog post has been accepted to the <strong>ICLR 2026 Blog Post Track</strong>! Read it on the{" "}
                <a
                  href="https://iclr-blogposts.github.io/2026/blog/2026/tracing-principles-behind-modern-diffusion-models/"
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ICLR official page
                </a>
                , or check out our{" "}
                <a
                  href="https://the-principles-of-diffusion-models.github.io/#/blog"
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 underline underline-offset-2"
                >
                  Blog Post
                </a>
                {" "}below.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border-l-4 border-slate-500">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  2026/01/05
                </span>
              </div>

              <p className="text-slate-700 dark:text-slate-300">
                Our book is being adopted for a CMU&apos;s course{" "}
                <a
                  href="https://kellyyutonghe.github.io/10799S26/resources/"
                  className="underline hover:no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CMU 10-799 Diffusion &amp; Flow Matching
                </a>
                !
              </p>
            </div>


            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border-l-4 border-slate-500">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  2025/12/16
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                Added <strong>Teaching Guide</strong> and <strong>Blog Post</strong> sections for enhanced learning resources and accessible content overview.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border-l-4 border-slate-500">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  2025/12/15
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                Official webpage established to provide comprehensive access to <em>The Principles of Diffusion Models</em> monograph and related resources.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border-l-4 border-slate-500">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  2025/10/24
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                Our book <strong>The Principles of Diffusion Models</strong> was made publicly available on arXiv.
              </p>
            </div>
          </div>
        </div>

        {/* Access the Book */}
        <div
          ref={accessBookRef}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-8"
        >
          <div className="p-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Library className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                Access the Book
              </h2>
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
                      {tab.badge && (
                        <span className="ml-1.5 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold leading-none bg-amber-300 text-amber-900 shadow-sm">
                          {tab.badge}
                        </span>
                      )}
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
                      {tab.badge && (
                        <span className="ml-1.5 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold leading-none bg-amber-300 text-amber-900 shadow-sm">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* How to Cite */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Quote className="w-6 h-6 text-orange-400 dark:text-orange-300" />
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                How to Cite
              </h2>
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
          <p className="text-center">
            © 2025 The Principles of Diffusion Models. All rights reserved.
          </p>
        </footer>
      </div>

      <ScrollToTop />
    </div>
  );
}
