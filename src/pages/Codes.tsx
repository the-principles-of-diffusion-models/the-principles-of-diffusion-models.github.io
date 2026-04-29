import { ArrowLeft, ExternalLink, Github, PlayCircle, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';

const githubRepoUrl =
  'https://github.com/the-principles-of-diffusion-models/codes-demos/';

type CodeNotebook = {
  part: string;
  title: string;
  description: string;
  githubUrl: string;
  colabUrl: string;
  status?: string;
};

const notebooks: CodeNotebook[] = [
  {
    part: 'Part B: Origins and Foundations of Diffusion Models',
    title: 'Diffusion Models Tutorial',
    description:
      'A hands-on tutorial introducing the core mechanics of diffusion models, from forward noising and denoising to training and sampling with minimal educational code.',
    githubUrl:
      'https://github.com/the-principles-of-diffusion-models/codes-demos/blob/main/Part-B/diffusion_tutorial.ipynb',
    colabUrl:
      'https://colab.research.google.com/github/the-principles-of-diffusion-models/codes-demos/blob/main/Part-B/diffusion_tutorial.ipynb',
    status: 'New',
  },
  {
    part: 'Part B: Origins and Foundations of Diffusion Models',
    title: 'Rectified Flow Tutorial',
    description:
      'A runnable tutorial on Rectified Flow and Reflow, illustrating how ODE flow-map trajectories can be strengthened by repeatedly straightening transport paths.',
    githubUrl:
      'https://github.com/the-principles-of-diffusion-models/codes-demos/blob/main/Part-B/rectified_flow_tutorial.ipynb',
    colabUrl:
      'https://colab.research.google.com/github/the-principles-of-diffusion-models/codes-demos/blob/main/Part-B/rectified_flow_tutorial.ipynb',
    status: 'New',
  },
  {
    part: 'Part D: Toward Learning Fast Diffusion-Based Generators',
    title: 'Flow Map Tutorial',
    description:
      'A hands-on notebook for understanding flow-map-style fast diffusion generators through minimal, educational code.',
    githubUrl:
      'https://github.com/the-principles-of-diffusion-models/codes-demos/blob/main/Part-D/flow_map_tutorial.ipynb',
    colabUrl:
      'https://colab.research.google.com/github/the-principles-of-diffusion-models/codes-demos/blob/main/Part-D/flow_map_tutorial.ipynb',
    status: 'Available',
  },
];

export default function Codes() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <DarkModeToggle />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={() => sessionStorage.setItem('scrollToTab', 'codes')}
          className="mb-8 inline-flex items-center gap-2 font-medium text-orange-400 transition-colors hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-400"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </Link>

        <header className="mb-10 border-b border-slate-200 pb-8 dark:border-slate-700">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-200">
            <Code2 className="h-4 w-4" />
            Official companion code
          </div>

          <h1 className="text-4xl font-bold leading-tight text-slate-900 dark:text-white">
            Codes and Colab Tutorials
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Minimal implementations and tutorial notebooks accompanying{' '}
            <em>The Principles of Diffusion Models</em>. These examples are designed
            for learning, experimentation, and connecting the mathematical principles
            in the book with runnable code.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <Github className="h-4 w-4" />
              Official GitHub Repository
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </header>

        <section>
          <h2 className="mb-5 text-2xl font-bold text-slate-900 dark:text-white">
            Available Tutorials
          </h2>

          <div className="grid gap-5">
            {notebooks.map((notebook) => (
              <article
                key={notebook.githubUrl}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-200">
                        {notebook.part}
                      </span>

                      {notebook.status && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          {notebook.status}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {notebook.title}
                    </h3>

                    <p className="mt-2 max-w-2xl leading-relaxed text-slate-600 dark:text-slate-300">
                      {notebook.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col">
                    <a
                      href={notebook.colabUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-400 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-500"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Open in Colab
                    </a>

                    <a
                      href={notebook.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <Github className="h-4 w-4" />
                      View on GitHub
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            More notebooks coming soon
          </h2>

          <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
            Additional examples will be added here as the companion codebase grows,
            including tutorials for core diffusion modeling, sampling, guidance, and
            fast-generation methods.
          </p>
        </section>
      </div>
    </div>
  );
}
