// src/pages/Home.tsx
import { useState, useEffect, useRef } from 'react';
import type { TouchEvent } from 'react';
import {
  ExternalLink,
  BookOpen,
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

/* =========================
   TOC helpers (dot leaders + font sizing)
   ========================= */

type TocKind = 'part' | 'chapter' | 'section';

const PART_TITLES = [
  'A Introduction to Deep Generative Modeling',
  'B Origins and Foundations of Diffusion Models',
  'C Sampling of Diffusion Models',
  'D Toward Learning Fast Diffusion-Based Generators',
  'Appendices',
];

function stripDotLeaders(s: string) {
  // remove sequences like ". . . . . . . ." but keep numbering like "1.1"
  return s
    .replace(/(\s*\.\s*){4,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function fixMissingSpaceBeforePage(line: string) {
  // handles cases like "...Distributions148" -> "...Distributions 148"
  return line.replace(/([^\d\s])(\d{1,4})\s*$/, '$1 $2').trim();
}

function parseToc(text: string) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.map((raw, idx) => {
    const fixed = fixMissingSpaceBeforePage(raw);

    // last token is page number
    const m = fixed.match(/^(.*?)(?:\s+)(\d{1,4})$/);
    const titleRaw = m ? m[1] : fixed;
    const page = m ? m[2] : '';

    const title = stripDotLeaders(titleRaw);

    const isPart = PART_TITLES.some((p) => title.startsWith(p));
    const isChapter =
      !isPart && (/^\d+\s/.test(title) || /^[A-D]\s(?!\.)/.test(title)); // "1 ..." or "A Crash Course ..."
    const isSection = /^\d+\.\d+/.test(title) || /^[A-D]\.\d+/.test(title); // "1.1 ..." or "A.1 ..."

    const kind: TocKind = isPart ? 'part' : isChapter ? 'chapter' : isSection ? 'section' : 'section';

    return { key: `${idx}-${title}`, title, page, kind };
  });
}

function TocBlock({ text }: { text: string }) {
  const items = parseToc(text);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 max-h-[420px] overflow-y-auto">
      <div className="space-y-1 font-mono">
        {items.map((it) => {
          const titleClass =
            it.kind === 'part'
              ? 'text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100'
              : it.kind === 'chapter'
                ? 'text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100'
                : 'text-xs text-slate-800 dark:text-slate-100';

          const indentClass = it.kind === 'section' ? 'pl-5' : 'pl-0';

          return (
            <div key={it.key} className={`flex items-baseline ${indentClass}`}>
              {/* keep one line so leader + page align; full title on hover */}
              <span className={`min-w-0 truncate ${titleClass}`} title={it.title}>
                {it.title}
              </span>

              {/* dotted leader auto-fills width */}
              {it.page ? (
                <>
                  <span
                    aria-hidden
                    className="mx-2 flex-1 border-b border-dotted border-slate-400/80 dark:border-slate-500/80 translate-y-[-2px]"
                  />
                  <span className="tabular-nums text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {it.page}
                  </span>
                </>
              ) : null}
            </div>
          );
        })}
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

  // ✅ About-carousel (single-card slider)
  const [aboutActive, setAboutActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

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
    { name: 'Yang Song', emails: ['thusongyang@gmail.com'] },
    { name: 'Dongjun Kim', emails: ['dongjun@stanford.edu'] },
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
    {
      id: 'errata',
      label: 'Errata',
      icon: FileWarning,
      type: 'internal',
      path: '/errata',
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

  // ✅ TOC blocks
  const tocAB = `A Introduction to Deep Generative Modeling 14
1 Deep Generative Modeling 15
1.1 What is Deep Generative Modeling? . . . . . . . . . . . . . . . 16
1.2 Prominent Deep Generative Models . . . . . . . . . . . . . . . 22
1.3 Taxonomy of Modelings . . . . . . . . . . . . . . . . . . . . . . 26
1.4 Closing Remarks . . . . . . . . . . . . . . . . . . . . . . . . . . 28
B Origins and Foundations of Diffusion Models 30
2 Variational Perspective: From VAEs to DDPMs 32
2.1 Variational Autoencoder . . . . . . . . . . . . . . . . . . . . . . 33
2.2 Variational Perspective: DDPM . . . . . . . . . . . . . . . . . . 43
2.3 Closing Remarks . . . . . . . . . . . . . . . . . . . . . . . . . . 55
3 Score-Based Perspective: From EBMs to NCSN 56
3.1 Energy-Based Models . . . . . . . . . . . . . . . . . . . . . . . . 57
3.2 From Energy-Based to Score-Based Generative Models . . . . . 64
3.3 Denoising Score Matching . . . . . . . . . . . . . . . . . . . . . 68
3.4 Multi-Noise Levels of Denoising Score Matching (NCSN) . . . . 79
3.5 Summary: A Comparative View of NCSN and DDPM . . . . . . 84
3.6 Closing Remarks . . . . . . . . . . . . . . . . . . . . . . . . . . 85
4 Diffusion Models Today: Score SDE Framework 86
4.1 Score SDE: Its Principles . . . . . . . . . . . . . . . . . . . . . . 87
4.2 Score SDE: Its Training and Sampling . . . . . . . . . . . . . . 105
4.3 Instantiations of SDEs . . . . . . . . . . . . . . . . . . . . . . . 110
4.4 (Optional) Rethinking Forward Kernels in Score-Based and Variational Diffusion Models . . . . . . . . . . . . . . . . . . . . . . 115
4.5 (Optional) Fokker–Planck Equation and Reverse-Time SDEs via Marginalization and Bayes’ Rule . . . . . . . . . . . . . . . 121
4.6 Closing Remarks . . . . . . . . . . . . . . . . . . . . . . . . . . 126
5 Flow-Based Perspective: From NFs to Flow Matching 127
5.1 Flow-Based Models: Normalizing Flows and Neural ODEs . . . . 129
5.2 Flow Matching Framework . . . . . . . . . . . . . . . . . . . . . 136
5.3 Constructing Probability Paths and Velocities Between Distributions148
5.4 (Optional) Properties of the Canonical Affine Flow . . . . . . . 159
5.5 Closing Remarks . . . . . . . . . . . . . . . . . . . . . . . . . . 165
6 A Unified and Systematic Lens on Diffusion Models 166
6.1 Conditional Tricks: The Secret Sauce of Diffusion Models . . . . 168
6.2 A Roadmap for Elucidating Training Losses in Diffusion Models 170
6.3 Equivalence in Diffusion Models . . . . . . . . . . . . . . . . . 175
6.4 Beneath It All: The Fokker–Planck Equation . . . . . . . . . . . 186
6.5 Closing Remarks . . . . . . . . . . . . . . . . . . . . . . . . . . 190
7 (Optional) Diffusion Models and Optimal Transport 191
7.1 Prologue of Distribution-to-Distribution Translation . . . . . . . 192
7.2 Taxonomy of the Problem Setups . . . . . . . . . . . . . . . . . 194
7.3 Relationship of Variant Optimal Transport Formulations . . . . . 206
7.4 Is Diffusion Model’s SDE Optimal Solution to SB Problem? . . 212
7.5 Is Diffusion Model’s ODE an Optimal Map to OT Problem? . . 216`;

  const tocCD = `C Sampling of Diffusion Models 224
8 Guidance and Controllable Generation 226
8.1 Prologue . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 227
8.2 Classifier Guidance . . . . . . . . . . . . . . . . . . . . . . . . . 232
8.3 Classifier-Free Guidance . . . . . . . . . . . . . . . . . . . . . . 235
8.4 (Optional) Training-Free Guidance . . . . . . . . . . . . . . . . 238
8.5 From Reinforcement Learning to Direct Preference Optimization for Model Alignment . . . . . . . . . . . . . . . . . . . . . . . . 243
8.6 Closing Remarks . . . . . . . . . . . . . . . . . . . . . . . . . . 253
9 Sophisticated Solvers for Fast Sampling 254
9.1 Prologue . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 255
9.2 DDIM . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 263
9.3 DEIS . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 275
9.4 DPM-Solver . . . . . . . . . . . . . . . . . . . . . . . . . . . . 282
9.5 DPM-Solver++ . . . . . . . . . . . . . . . . . . . . . . . . . . . 295
9.6 PF-ODE Solver Families and Their Numerical Analogues . . . . 301
9.7 (Optional) DPM-Solver-v3 . . . . . . . . . . . . . . . . . . . . 304
9.8 (Optional) ParaDiGMs . . . . . . . . . . . . . . . . . . . . . . . 315
9.9 Closing Remarks . . . . . . . . . . . . . . . . . . . . . . . . . . 321
D Toward Learning Fast Diffusion-Based Generators 322
10 Distillation-Based Methods for Fast Sampling 323
10.1 Prologue . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 324
10.2 Distribution-Based Distillation . . . . . . . . . . . . . . . . . . 329
10.3 Progressive Distillation . . . . . . . . . . . . . . . . . . . . . . 334
10.4 Closing Remarks . . . . . . . . . . . . . . . . . . . . . . . . . . 340
11 Learning Fast Generators from Scratch 341
11.1 Prologue . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 343
11.2 Special Flow Map: Consistency Model in Discrete Time . . . . . 348
11.3 Special Flow Map: Consistency Model in Continuous Time . . . 356
11.4 General Flow Map: Consistency Trajectory Model . . . . . . . . 365
11.5 General Flow Map: Mean Flow . . . . . . . . . . . . . . . . . . 375
11.6 Closing Remarks . . . . . . . . . . . . . . . . . . . . . . . . . . 380`;

  const tocApp = `Appendices 381
A Crash Course on Differential Equations 382
A.1 Foundation of Ordinary Differential Equations . . . . . . . . . . 383
A.2 Foundation of Stochastic Differential Equations . . . . . . . . . 394
B Density Evolution: From Change of Variable to Fokker–Planck 398
B.1 Change-of-Variable Formula: From Deterministic Maps to Stochastic Flows . . . . . . . . . . 399
B.2 Intuition of the Continuity Equation . . . . . . . . . . . . . . . 409
C Behind the Scenes of Diffusion Models: Itô’s Calculus and Girsanov’s Theorem 412
C.1 Itô’s Formula: The Chain Rule for Random Processes . . . . . . 413
C.2 Change-of-Variable For Measures: Girsanov’s Theorem in Diffusion Models . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 422
D Supplementary Materials and Proofs 426
D.1 Variational Perspective . . . . . . . . . . . . . . . . . . . . . . . 426
D.2 Score-Based Perspective . . . . . . . . . . . . . . . . . . . . . . 430
D.3 Flow-Based Perspective . . . . . . . . . . . . . . . . . . . . . . 441
D.4 Theoretical Supplement: A Unified and Systematic View on Diffusion Models . . . . . . . . . . . . . . . . . . . . . . . . . . . . 445
D.5 Theoretical Supplement: Learning Fast Diffusion-Based Generators 446
D.6 (Optional) Elucidating Diffusion Model (EDM) . . . . . . . . . 450`;

  const aboutSlides: Array<{
    heading: string;
    sub?: string;
    body: JSX.Element;
  }> = [
    {
      heading: 'Overview',
      sub: 'About the book',
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
            These perspectives share a common backbone: a learned time-dependent velocity field whose flow transports a simple prior to the data.
            With this in hand, sampling amounts to solving a differential equation that evolves noise into data along a continuous generative trajectory.
            On this foundation, the monograph discusses guidance (controllable generation), advanced numerical solvers (efficient sampling),
            and diffusion-motivated flow-map models (direct mappings between arbitrary times along this trajectory).
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
      heading: 'Table of Contents: Parts A–B',
      body: <TocBlock text={tocAB} />,
    },
    {
      heading: 'Table of Contents: Parts C–D',
      body: <TocBlock text={tocCD} />,
    },
    {
      heading: 'Appendix: Crash Courses & Proofs',
      body: <TocBlock text={tocApp} />,
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
    <div className="min-h-screen transition-colors duration-200 bg-[#F8F2FF] dark:bg-slate-900">
      <DarkModeToggle />

      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-3 leading-tight">
            The Principles of Diffusion Models
          </h1>
          <p className="text-2xl text-slate-700 dark:text-slate-300 font-medium mb-6">
            From Origins to Advances
          </p>
        </header>

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

        {/* ✅ About This Book: ONE card at a time */}
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

          {/* slider viewport */}
          <div className="overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {/* track */}
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${aboutActive * 100}%)` }}
            >
              {aboutSlides.map((s, idx) => (
                <div key={idx} className="w-full flex-none">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {s.heading}
                        </h3>
                        {s.sub ? (
                          <p className="text-sm text-slate-500 dark:text-slate-400">{s.sub}</p>
                        ) : null}
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

                    {s.body}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* dots */}
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

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Newspaper className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              News & Updates
            </h2>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border-l-4 border-orange-500">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  Coming Soon...
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                Publisher for physical print version is currently being sorted out. Stay tuned for updates on availability.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border-l-4 border-slate-500">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  2025/12/16
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                Added <strong>Teaching Guide</strong> and <strong>Blog Post (Compact)</strong> sections for enhanced learning resources and accessible content overview.
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
