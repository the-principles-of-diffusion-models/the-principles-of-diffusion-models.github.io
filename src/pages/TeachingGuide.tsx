import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import DarkModeToggle from '../components/DarkModeToggle';

export default function TeachingGuide() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <DarkModeToggle />
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={() => sessionStorage.setItem('scrollToTab', 'teaching')}
          className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-500 mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <article className="prose prose-lg prose-slate max-w-none">
          <header className="mb-12 pb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
              Instructor Guide: Using <em>The Principles of Diffusion Models</em> for Lectures
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              A practical guide for instructors who want to teach diffusion models from our monograph without having to read every chapter in advance. The main idea is to teach diffusion as one coherent framework, then emphasize why sampling is ODE solving, how guidance works, and why the field is moving toward flow map models.
            </p>
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              A concise walkthrough from a different perspective (not covering the full intuitions or insights developed in the book) is also available as our 
              <a href="https://the-principles-of-diffusion-models.github.io/#/blog" className="text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-400">
                blog post
              </a>
            </p>
          </header>

          <div className="space-y-8">
            <section>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">
                Foundations of Diffusion Training (Chapter 1–6)
              </h2>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                If students already have basic knowledge of deep generative models (DGMs), Chapter 1 (introductory background on DGMs) can be skimmed very quickly.
              </p>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                If your goal is to give students a complete, end-to-end understanding of diffusion, we recommend following Chapters 2–6 in order. This is the core spine of the book. It introduces the three complementary origins and perspectives (variational, score/energy-based, and flow-based) and culminates in how they connect, especially in Chapter 6.
              </p>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                A helpful supplement is Appendix B, which presents the diffusion story through the change-of-variables viewpoint. In many classrooms, this narrative resonates strongly because it provides a clean, calculus-based mental picture of how probability mass moves during generation.
              </p>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                You can generally skip Chapter 7 (optimal transport) unless your course explicitly needs OT or you want a deeper geometric perspective.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">
                Guided Generation (Chapter 8)
              </h2>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                For most courses, it is sufficient to focus on the CG/CFG section in Chapter 8. The goal is not to survey every conditioning method, but to teach the key mechanism: ODE-based sampling can be steered by taking linear combinations of vector fields. This viewpoint can be motivated cleanly from conditional modeling or Bayes' rule. Once students understand this mechanism, they can reason about many guidance variants without memorizing formulas.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">
                Solvers for Fast Sampling (Chapter 9)
              </h2>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                We suggest keeping the discussion of solvers lightweight and practical. A good default is DDIM (Section 9.2) as the baseline fast sampler and DPM-Solver (Section 9.4) as a representative higher-order solver.
              </p>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Optionally, students can skim Section 9.6, where modern diffusion solvers are connected back to classical numerical ODE solvers. This connection is particularly intuitive under v-parameterization (for example, DDIM is essentially Euler, and second-order DPM-Solver corresponds closely to Heun in SNR-time). For other parameterizations (x / noise / score), derivations become more technical because exponential-integrator factors are needed to handle the linear term in the diffusion ODE. We recommend treating these details as optional depth.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">
                Modern Frontier: Flow Map Models (Chapter 11)
              </h2>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                After the fundamentals (Chapter 1–6), guided generation (Chapter 8), and a minimal solver module (Chapter 9), we recommend jumping to Chapter 11 on diffusion-motivated flow map models. This is a very active research direction and works well as a frontier module, especially if you want to connect the course to real-time generation and interactive systems.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">
                Teaching Pace and Emphasis
              </h2>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                Any section marked optional is safe to skip on a first pass. These sections are intended as deeper dives rather than required components for core understanding.
              </p>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Even if you cover Chapters 1–6 in order, the flow-based / flow-matching portion can usually be taught quickly. It largely mirrors the score-based story, and the key takeaways from score-based diffusion are already distilled in Section 5.2.1.
              </p>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Chapters 2–5 also include short recaps of classic background material (such as VAEs, EBMs, and normalizing flows). These recaps are included to make the monograph self-contained, but they can be covered quickly or skipped entirely if students already have the prerequisites.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">
                Four Takeaways to Anchor the Course
              </h2>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                A good way to frame the entire course is around four core messages:
              </p>
              <ol className="space-y-4 my-6 list-decimal list-inside">
                <li className="leading-relaxed text-slate-700 dark:text-slate-300">
                  Diffusion has three origins (variational, score/energy-based, flow-based), and understanding their connection (Chapter 6) turns a zoo of methods into one coherent framework.
                </li>
                <li className="leading-relaxed text-slate-700 dark:text-slate-300">
                  Sampling is essentially solving an ODE, which explains why diffusion generation is slow and why solver design matters (Chapter 9).
                </li>
                <li className="leading-relaxed text-slate-700 dark:text-slate-300">
                  Guidance works through linear combinations of velocity fields, giving a simple and general mechanism for steering generation (Chapter 8, CG/CFG).
                </li>
                <li className="leading-relaxed text-slate-700 dark:text-slate-300">
                  Because iterative sampling is slow, a major direction is to learn the solution map directly, namely diffusion-motivated flow map models (Chapter 11).
                </li>
              </ol>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Feel free to reach out to us if you would like to discuss course design or possible teaching paths using the book. We would also be happy to receive feedback from your teaching experience and from your students.
              </p>
            </section>
          </div>
        </article>
      </div>

      <ScrollToTop />
    </div>
  );
}

