import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import ScrollToTop from '../components/ScrollToTop';
import DarkModeToggle from '../components/DarkModeToggle';

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <DarkModeToggle />
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={() => sessionStorage.setItem('scrollToTab', 'blog')}
          className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-400 mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <article className="prose prose-lg prose-slate max-w-none">
          <header className="mb-12 pb-8 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
              Tracing the Principles Behind Modern Diffusion Models
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Diffusion models can feel like a jungle of acronyms, but the core idea is simple: start from noise and gradually move a cloud of samples until it looks like real data. This post gives an intuition-first tour showing that DDPMs, score-based models, and flow matching are the same recipe with different prediction targets, all rooted in the change-of-variable rule from calculus and powered by one shared "conditional trick" that turns learning into supervised regression. Finally, we zoom out to the speed problem and show how flow map models aim to replace many tiny denoising steps with a few big, accurate jumps toward real-time generation.
            </p>
            <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
              <p>Date: April 27, 2026</p>
            </div>
          </header>

          <div className="space-y-8">
            <section>
              <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                Modern diffusion models are often introduced through a long list of concepts and terms whose relationships are not immediately clear. Very quickly, one encounters names such as <em>DDPM, SDE, ODE, probability flow, flow matching, distillation, consistency, flow map</em>, together with phrases like <em>forward process, reverse process, score, velocity field, sampler</em>. For a reader encountering these ideas for the first time, this can be overwhelming.
              </p>

              <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                In what follows, we slow the story down and keep a single guiding thread:
              </p>

              <blockquote className="border-l-4 border-orange-400 dark:border-orange-300 pl-6 italic text-xl text-slate-700 dark:text-slate-300 my-6">
                All these models describe different ways to <em>move probability mass</em> from "simple noise" to "complicated data". Under the surface, they are all based on the same principle from calculus: the <em>change-of-variable rule</em>.
              </blockquote>

              <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                In the rest of this article, we build the picture step by step.
              </p>

              <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                We start with three common lenses on diffusion, <em>DDPM</em>, <em>score-based methods</em>, and <em>flow matching</em>. They share the same recipe: fix a simple <em>forward Gaussian noising process</em>, then learn to reverse it. The main difference is <em>what the network predicts</em>, such as noise, score, or velocity.
              </p>

              <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Underneath all of them is the same math question: when we <em>move a cloud of samples</em>, how does the distribution change? The answer is the change-of-variable rule from Calculus applied to a particle cloud. In continuous time, this becomes the PDE view: pure transport gives the <em>continuity equation</em>, and transport with Gaussian jitter gives the <em>Fokker–Planck equation</em>. This matters because it is the bookkeeping that keeps the story honest: once we pre-specify the forward noising process, we have a specific path of snapshot distributions in mind, and the reverse-time generator must move probability mass in a way that stays consistent with that path. Without this structure, there is nothing tying the reverse-time generator to the intended transition from prior to data, so the learned dynamics can quietly drift away from the distribution evolution we had in mind.
              </p>

              <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Finally, we focus on speed. Diffusion is <em>high fidelity</em> but often slow because sampling is iterative. We end with <em>flow map models</em>, which keep the same diffusion backbone but aim to learn <em>long time-jumps</em> of the probability-flow dynamics directly, replacing many tiny steps with a few big, accurate jumps.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">
                I. A Systematic Tour of Diffusion Models
              </h2>

              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-8 mb-4">
                The Generative Goal
              </h3>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                We first discuss the goal, before introducing any technical machinery.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                On the simple side, we can easily generate randomness. For example, we can draw a vector of independent Gaussian variables, which looks like pure "static". On the complex side, we have realistic data: natural images, short audio clips, 3D shapes, and so on. These objects are high-dimensional and exhibit rich structure. A <em>deep generative model</em> is a procedure that maps from the simple side to the complex side. It turns noise into data.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                At an abstract level, we can depict this as:
              </p>

              <div className="mb-3">
                <img
                  src="/assets/dgm-learning.svg"
                  alt="Deep generative models visualization"
                  className="block w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%2364748b"%3EPlaceholder: Add your image to /public/assets/%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Classical models such as GANs and VAEs attempt to learn this arrow in one or a few large steps: a single neural network takes a noise vector and outputs an image.
              </p>

              <p>
                Read more in{" "}
                <a
                  href="https://arxiv.org/pdf/2510.21890#page=20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-600 underline underline-offset-2"
                >
                  chapter 1
                </a>
                .
              </p>


              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                <strong>Diffusion-style models</strong> follow a different philosophy. Instead of jumping directly from noise to data, they move in many <em>small increments</em>. More precisely, the construction consists of two coupled procedures:
              </p>

              <ul className="space-y-4 my-6 list-disc list-inside">
                <li className="leading-relaxed text-slate-700 dark:text-slate-300">
                  In the <strong>forward process</strong>, we start from real data and gradually add small amounts of simple random noise at many tiny steps. As this corruption progresses, fine details disappear first, then larger structures become indistinct, and eventually every sample looks like featureless noise. By the end, all examples, regardless of which original image or sound they came from, are brought into a <em>common noisy space</em> that is very close to a standard Gaussian distribution and easy to sample from. Although we typically do not run this forward process at test time, it is essential during training because it provides a precise, controlled way to relate clean data to their noisy versions.
                </li>

                <div className="mb-3">
                  <img
                    src="/assets/vdm-forward.svg"
                    alt="Forward diffusion process visualization"
                    className="block w-full h-auto"
                    onError={(e) => {
                      e.currentTarget.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%2364748b"%3EPlaceholder: Add your image to /public/assets/%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>


                <li className="leading-relaxed text-slate-700 dark:text-slate-300">
                  In the <strong>reverse process</strong>, the model learns to undo this artificial corruption step by step. Starting from pure noise, it applies a sequence of learned denoising updates that gradually reintroduce structure: coarse shapes first, then finer details. After enough steps, the final outputs resemble realistic data again. This reverse procedure is what we actually use at sampling time to turn noise into data.
                </li>

                <div className="mb-3">
                  <img
                    src="/assets/vdm-backward.svg"
                    alt="Reverse diffusion process visualization"
                    className="block w-full h-auto"
                    onError={(e) => {
                      e.currentTarget.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%2364748b"%3EPlaceholder: Add your image to /public/assets/%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>

              </ul>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                In both directions, there is a common underlying object: a <em>probability density</em> that evolves over time. At time <InlineMath math="t = 0" />, we may have a density that is shaped like the data distribution. As <InlineMath math="t" /> increases, the forward process transports and blurs this density until it approaches a simple reference distribution, often called the <em>prior</em>. In practice, this prior is typically chosen to be a standard Gaussian, because we know how to sample from it efficiently and its properties admit closed-form expressions.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                At this point, the big picture is in place: we have a simple way to <em>corrupt</em> data into noise, and we hope to learn a reverse procedure that <em>undoes</em> that corruption.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                So the next step is to pin down a <em>fully explicit</em> forward rule that we can define ourselves: given a clean sample <InlineMath math="\mathbf{x}_0" />, what is the distribution of its noisy version <InlineMath math="\mathbf{x}_t" /> at each time <InlineMath math="t" />? Once this rule is fixed, we can talk precisely about different reverse-time modeling choices built on top of the <em>same</em> forward construction.
              </p>

              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-8 mb-4">
                Forward Process
              </h3>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                It helps to first make the <em>forward noising rule</em> completely concrete. Modern common diffusion models (such as DDPM, Score SDE, Flow Matching) that we will revisit in this post all start from this same basic construction.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Let <InlineMath math="\mathbf{x}_0 \in \mathbb{R}^D" /> be a clean data sample (an image, an audio clip, etc.) sampled from a given data distribution <InlineMath math="p_{\text{data}}" />. The forward process gradually corrupts <InlineMath math="\mathbf{x}_0" /> into a noisy version <InlineMath math="\mathbf{x}_t" />. A standard and very convenient choice is:
              </p>

              <BlockMath math="p(\mathbf{x}_t \mid \mathbf{x}_0) = \mathcal{N}\bigl(\mathbf{x}_t;\,\alpha_t\,\mathbf{x}_0,\;\sigma_t^2\,\mathbf{I}\bigr)," />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                where <InlineMath math="\alpha_t" /> and <InlineMath math="\sigma_t" /> are scalar functions of the "time" <InlineMath math="t" />, and <InlineMath math="\mathbf{I}" /> is the identity matrix. Equivalently, we can sample
              </p>

              <BlockMath math="\boldsymbol{\epsilon} \sim \mathcal{N}(\mathbf{0}, \mathbf{I}), \qquad \mathbf{x}_t = \alpha_t \mathbf{x}_0 + \sigma_t \boldsymbol{\epsilon}." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                We can think of <InlineMath math="\alpha_t" /> as the amount of original signal that remains at time <InlineMath math="t" />, and <InlineMath math="\sigma_t" /> as the amount of noise that has been mixed in:
              </p>

              <ul className="space-y-2 my-4 list-disc list-inside">
                <li className="leading-relaxed text-slate-700 dark:text-slate-300">
                  for small <InlineMath math="t" />, <InlineMath math="\alpha_t \approx 1" /> and <InlineMath math="\sigma_t \approx 0" />, so <InlineMath math="\mathbf{x}_t" /> is close to <InlineMath math="\mathbf{x}_0" />;
                </li>
                <li className="leading-relaxed text-slate-700 dark:text-slate-300">
                  for large <InlineMath math="t" />, <InlineMath math="\alpha_t \approx 0" /> and <InlineMath math="\sigma_t" /> is large, so <InlineMath math="\mathbf{x}_t" /> is almost pure noise.
                </li>
              </ul>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                With this forward perturbation, we can view the data distribution as being "blurred" over time. The resulting time-dependent marginal density is
              </p>

              <BlockMath math="p_t(\mathbf{x}):= \int p(\mathbf{x}_t \mid \mathbf{x}_0) p_{\text{data}}(\mathbf{x}_0) \mathrm{d} \mathbf{x}_0." />

              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-8 mb-4">
                Reverse Process
              </h3>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                Once the forward noising process is fixed, most diffusion "flavors" differ in just two choices:
              </p>

              <ol className="list-decimal list-inside space-y-2 my-4">
                <li className="leading-relaxed text-slate-700 dark:text-slate-300">
                  What the network predicts from <InlineMath math="(\mathbf{x}_t, t)" />, and
                </li>
                <li className="leading-relaxed text-slate-700 dark:text-slate-300">
                  How we use that prediction at sampling time to go from noise back to data.
                </li>
              </ol>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Below we outline three widely used viewpoints that all tell the same story:
              </p>

              <ul className="space-y-2 my-4 list-disc list-inside">
                <li className="leading-relaxed text-slate-700 dark:text-slate-300">
                  <strong>Variational Perspective:</strong> predict the <em>noise that was added</em> (or, equivalently, a cleaned-up version of the sample), then use it to take one denoising step. A representative model in this family is <em>Denoising Diffusion Probabilistic Models (DDPM)</em>.
                </li>
                <li className="leading-relaxed text-slate-700 dark:text-slate-300">
                  <strong>Score-based Perspective:</strong> predict a score function, i.e., the <em>direction pointing toward more likely images</em> at noise level <InlineMath math="t" />, and then follow it to move from noise back to data. The representative one <em>Score SDE</em>.
                </li>
                <li className="leading-relaxed text-slate-700 dark:text-slate-300">
                  <strong>Flow-based Perspective:</strong> predict a <em>velocity (a "push")</em> telling how to move the sample at time <InlineMath math="t" />, then integrate these pushes to transport noise into data. The representative example is <em>Flow Matching</em>.
                </li>
              </ul>

              <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-6 mb-3">
                DDPM: Predicting the Reverse Step via Noise or Mean
              </h4>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                Denoising Diffusion Probabilistic Models (DDPM) are one of the earliest modern diffusion approaches. The main idea is simple: with the fixed forward noising process that gradually destroys data, it <em>trains a model to run this process in reverse</em>. DDPM formalizes this as a variational objective, so that learning to denoise step by step also corresponds to maximizing a likelihood-style training goal.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                In DDPM, we work with a <em>discrete</em> set of noise levels, for example integer times <InlineMath math="t = 0, 1, \dots, T" />. The <em>forward</em> process gradually increases the noise level so that <InlineMath math="\mathbf{x}_T" /> is (almost) standard Gaussian.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Conceptually, what we would like to have is the <em>oracle reverse transition kernel</em> that undoes this forward corruption:
              </p>

              <BlockMath math="p(\mathbf{x}_{t-1} \mid \mathbf{x}_t), \quad t = T, T-1, \dots, 1," />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                so that if we start from <InlineMath math="\mathbf{x}_T \sim \mathcal{N}(\mathbf{0}, \mathbf{I})" /> and keep sampling backwards
              </p>

              <BlockMath math="\mathbf{x}_T \to \mathbf{x}_{T-1} \to \cdots \to \mathbf{x}_0," />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                the final <InlineMath math="\mathbf{x}_0" /> looks like a real data sample.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                To make the generative process work, we would like to learn the true reverse kernel <InlineMath math="p(\mathbf{x}_{t-1}\mid \mathbf{x}_t)" />, by fitting a parametric model <InlineMath math="p_\theta(\mathbf{x}_{t-1}\mid \mathbf{x}_t)" /> and minimizing the expected KL
              </p>

              <BlockMath math="\mathbb{E}_{p_t(\mathbf{x}_t)} \big[ D_{\mathrm{KL}}\big(p(\mathbf{x}_{t-1}\mid \mathbf{x}_t)\,\|\,p_\theta(\mathbf{x}_{t-1}\mid \mathbf{x}_t)\big) \big]." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                At first sight, this looks hopeless: the marginal reverse kernel
              </p>

              <BlockMath math="p(\mathbf{x}_{t-1}\mid \mathbf{x}_t) = \int p(\mathbf{x}_{t-1}\mid \mathbf{x}_t,\mathbf{x}_0)\,p_{\text{data}}(\mathbf{x}_0)\mathrm{d}\mathbf{x}_0" />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                is a complicated <em>mixture of Gaussians</em> over all possible clean images <InlineMath math="\mathbf{x}_0" />, and we never see it in closed form.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                The key move, which we call the <em>conditional trick</em>, is to <em>condition on the clean data</em> <InlineMath math="\mathbf{x}_0" /> to obtain a tractable regression target. Because the forward process is Markov and Gaussian, the conditional kernel <InlineMath math="p(\mathbf{x}_{t-1}\mid \mathbf{x}_t, \mathbf{x}_0)" /> is itself a single Gaussian with a closed-form mean and variance.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                A neat calculation shows that the original "impossible" objective can be rewritten as
              </p>

              <div className="bg-orange-50 border-2 border-orange-100 rounded-lg p-6 my-6 overflow-x-auto">
                <BlockMath math="\mathbb{E}_{p_t(\mathbf{x}_t)}\!\big[ D_{\mathrm{KL}}(p(\mathbf{x}_{t-1}\mid \mathbf{x}_t)\,\|\,p_\theta(\mathbf{x}_{t-1}\mid \mathbf{x}_t)) \big] = \mathbb{E}_{p_{\text{data}}(\mathbf{x}_0)}\mathbb{E}_{p(\mathbf{x}_t\mid \mathbf{x}_0)} \big[ D_{\mathrm{KL}}(p(\mathbf{x}_{t-1}\mid \mathbf{x}_t,\mathbf{x}_0)\,\|\,p_\theta(\mathbf{x}_{t-1}\mid \mathbf{x}_t)) \big] + C," />
              </div>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                where <InlineMath math="C" /> is a constant independent of <InlineMath math="\theta" />.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                In words: instead of trying to match the unknown mixture <InlineMath math="p(\mathbf{x}_{t-1}\mid \mathbf{x}_t)" /> directly, we match the <em>Gaussian conditional</em> <InlineMath math="p(\mathbf{x}_{t-1}\mid \mathbf{x}_t,\mathbf{x}_0)" /> for random data points <InlineMath math="\mathbf{x}_0" />. This conditional objective is mathematically equivalent to the original KL up to a constant, but now the target is <em>fully tractable</em>.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                This conditional trick will reappear in score-based SDEs and flow matching: in all three views, conditioning on <InlineMath math="\mathbf{x}_0" /> turns an intractable object (reverse kernel, score, or velocity) into a simple regression target we can actually learn.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Because the forward noising rule is <em>linear and Gaussian</em>, the one-step reverse transition has a convenient form: it is also Gaussian. So DDPM models the reverse kernel as
              </p>

              <BlockMath math="p_\theta(\mathbf{x}_{t-1}\mid \mathbf{x}_t) := \mathcal{N}\!\big(\boldsymbol{\mu}_\theta(\mathbf{x}_t,t),\,\tilde{\sigma}_t^2\mathbf{I}\big)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Here <InlineMath math="\tilde{\sigma}_t^2" /> is a <em>known</em> (pre-chosen) variance schedule, so the only learnable part is the mean <InlineMath math="\boldsymbol{\mu}_\theta(\mathbf{x}_t,t)" />.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                A key practical simplification is that we usually <em>do not</em> ask the network to output this mean directly. Instead, we exploit the closed-form forward relation
              </p>

              <BlockMath math="\mathbf{x}_t=\alpha_t\mathbf{x}_0+\sigma_t\boldsymbol{\epsilon}, \qquad \boldsymbol{\epsilon}\sim\mathcal{N}(\mathbf{0},\mathbf{I})," />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                which implies that the reverse mean can be written as an <em>explicit formula</em> once we know either the clean image <InlineMath math="\mathbf{x}_0" /> or the noise <InlineMath math="\boldsymbol{\epsilon}" />. So we train the network to predict one of these simpler quantities, and then <em>plug it into</em> the analytic formula for <InlineMath math="\boldsymbol{\mu}_\theta(\mathbf{x}_t,t)" />.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                In the original DDPM formulation, the standard choice is to predict the noise. Concretely, we train <InlineMath math="\boldsymbol{\epsilon}_\theta(\mathbf{x}_t,t)" /> with the regression objective
              </p>

              <BlockMath math="\mathcal{L}_{\text{variational}}(\theta) = \mathbb{E}_{t,\,\mathbf{x}_0,\,\boldsymbol{\epsilon}} \Big[ \lambda(t)\, \big\| \boldsymbol{\epsilon}_\theta(\mathbf{x}_t,t)-\boldsymbol{\epsilon} \big\|_2^2 \Big]," />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                where <InlineMath math="\lambda(t)" /> is a time-dependent weight.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Intuitively: the network sees a noisy sample <InlineMath math="\mathbf{x}_t" /> and its noise level <InlineMath math="t" />, and learns to answer "<em>What noise was added to create this sample?</em>"
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                At sampling time, we start from <InlineMath math="\mathbf{x}_T\sim\mathcal{N}(\mathbf{0},\mathbf{I})" />. At each step, we use <InlineMath math="\boldsymbol{\epsilon}_\theta(\mathbf{x}_t,t)" /> to compute the Gaussian mean <InlineMath math="\boldsymbol{\mu}_\theta(\mathbf{x}_t,t)" /> (via the closed-form reverse formula), sample <InlineMath math="\mathbf{x}_{t-1}" />, and repeat until we reach a clean sample <InlineMath math="\mathbf{x}_0" />.
              </p>

              <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-6 mb-3">
                Score-Based Methods: Predict the Score
              </h4>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                Score-based diffusion models keep the same forward corruption rule for <InlineMath math="\mathbf{x}_t" />, but they train the network to predict a different object: the <em>score</em> at each noise level <InlineMath math="t" />,
              </p>

              <BlockMath math="\nabla_{\mathbf{x}}\log p_t(\mathbf{x})," />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                where <InlineMath math="p_t" /> is the (unknown) marginal density of noisy samples at time <InlineMath math="t" />. Intuitively, the score is a local arrow that points toward <em>more likely</em> samples under <InlineMath math="p_t" />.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Of course, we cannot compute <InlineMath math="\nabla_{\mathbf{x}}\log p_t(\mathbf{x})" /> directly because <InlineMath math="p_t" /> is defined by integrating over the data. The <em>conditional trick</em> is to instead use the Gaussian conditional <InlineMath math="p(\mathbf{x}_t\mid \mathbf{x}_0)" />, whose score is available in closed form:
              </p>

              <BlockMath math="\nabla_{\mathbf{x}_t}\log p(\mathbf{x}_t\mid \mathbf{x}_0) = -\frac{1}{\sigma_t^2}\bigl(\mathbf{x}_t-\alpha_t\mathbf{x}_0\bigr)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Since <InlineMath math="\mathbf{x}_t=\alpha_t\mathbf{x}_0+\sigma_t\boldsymbol{\epsilon}" />, this target is equivalently
              </p>

              <BlockMath math="-\frac{1}{\sigma_t}\boldsymbol{\epsilon}," />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                which makes the supervision feel very concrete: "given a noisy sample, point in the direction that removes the injected noise."
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Training then becomes a plain regression problem. We sample <InlineMath math="\mathbf{x}_0" />, choose <InlineMath math="t" />, draw <InlineMath math="\boldsymbol{\epsilon}\sim\mathcal{N}(\mathbf{0},\mathbf{I})" />, form <InlineMath math="\mathbf{x}_t" />, and minimize the <em>denoising score matching</em> loss
              </p>

              <BlockMath math="\mathcal{L}_{\text{score}}(\theta) = \mathbb{E}_{t,\,\mathbf{x}_0,\,\boldsymbol{\epsilon}} \Big[ \lambda(t)\, \big\| \mathbf{s}_\theta(\mathbf{x}_t,t) +\frac{1}{\sigma_t^2}\bigl(\mathbf{x}_t-\alpha_t\mathbf{x}_0\bigr) \big\|_2^2 \Big]." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                More precisely, <em>denoising score matching</em> gives the same kind of "conditional trick" we saw in DDPM: the intractable regression target <InlineMath math="\nabla_{\mathbf{x}_t}\log p_t(\mathbf{x}_t)" /> can be replaced by the <em>tractable</em> conditional target <InlineMath math="\nabla_{\mathbf{x}_t}\log p_t(\mathbf{x}_t\mid \mathbf{x}_0)" />, and the two objectives differ only by a constant (so they induce the same gradient updates and the same optimum). Formally, for a constant <InlineMath math="C" /> that does <em>not</em> depend on <InlineMath math="\theta" />,
              </p>

              <div className="bg-orange-50 border-2 border-orange-100 rounded-lg p-6 my-6 overflow-x-auto">
                <BlockMath math="\mathbb{E}_{t}\,\mathbb{E}_{\mathbf{x}_t\sim p_t} \Big[ \lambda(t)\, \big\| \mathbf{s}_\theta(\mathbf{x}_t,t) - \nabla_{\mathbf{x}_t}\log p_t(\mathbf{x}_t) \big\|_2^2 \Big] = \mathbb{E}_{t}\,\mathbb{E}_{\mathbf{x}_0\sim p_{\text{data}}}\,\mathbb{E}_{\mathbf{x}_t\sim p(\cdot\mid \mathbf{x}_0)} \Big[ \lambda(t)\, \big\| \mathbf{s}_\theta(\mathbf{x}_t,t) -\nabla_{\mathbf{x}_t}\log p_t(\mathbf{x}_t\mid \mathbf{x}_0) \big\|_2^2 \Big] + C." />
              </div>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                At test time, the learned score field <InlineMath math="\mathbf{s}_\theta" /> is turned into an actual sampler by following a continuous-time dynamics. A particularly clean option is the <em>probability-flow ODE (PF-ODE)</em>: a <em>deterministic</em> trajectory whose intermediate distributions match those of the stochastic diffusion process.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                The PF-ODE takes the form
              </p>

              <BlockMath math="\frac{\mathrm{d}\mathbf{x}(t)}{\mathrm{d}t} = f(t)\mathbf{x}(t) -\frac{1}{2}g^2(t)\mathbf{s}_\theta(\mathbf{x}(t),t)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Here, the coefficients <InlineMath math="f(t)" /> and <InlineMath math="g(t)" /> are tied to the forward perturbation <InlineMath math="\mathbf{x}_t=\alpha_t\mathbf{x}_0+\sigma_t\boldsymbol{\epsilon}" /> through
              </p>

              <BlockMath math="f(t)=\frac{\mathrm{d}}{\mathrm{d}t}\log\alpha_t=\frac{\dot{\alpha}_t}{\alpha_t}, \quad\text{and}\quad g^2(t)=\frac{\mathrm{d}}{\mathrm{d}t}\sigma_t^2-2f(t)\sigma_t^2." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                The key point is that the PF-ODE is constructed so that, for every time <InlineMath math="t" />, the random variable <InlineMath math="\mathbf{x}(t)" /> has distribution exactly <InlineMath math="p_t" />. So even though each trajectory is deterministic, the sampler still matches the same "distribution snapshot" at each noise level.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Starting from a seed drawn from the prior, <InlineMath math="\mathbf{x}_T\sim p_{\text{prior}}" />, we numerically integrate the PF-ODE backward from <InlineMath math="t=T" /> to <InlineMath math="t=0" />. The endpoint <InlineMath math="\mathbf{x}_0" /> is then a data-like sample.
              </p>

              <div className="mb-3">
                <img
                  src="/assets/continuous_ode.svg"
                  alt="ODE flow visualization"
                  className="block w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%2364748b"%3EPlaceholder: Add your image to /public/assets/%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                The score SDE framework can be viewed as a <em>continuous-time</em> extension of DDPM. It reframes diffusion generation as solving a time-dependent differential equation, which connects generative modeling to classical tools from differential equations.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                This viewpoint also makes one practical point transparent: <em>standard diffusion sampling is inherently iterative, and can therefore be slow</em>. The sample is refined through many small updates, and high quality often requires many such steps.
              </p>

              <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-6 mb-3">
                Flow Matching: Predict the Velocity
              </h4>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                In score-based diffusion, we first learn a <em>score</em> <InlineMath math="\mathbf{s}_\theta(\mathbf{x},t)" /> (a "which way is more likely" direction), and then convert it into a sampler by integrating the PF-ODE. Flow matching shifts the focus: instead of learning the score, it trains the network to output the <em>velocity field</em> directly, the ODE rule that moves a sample at time <InlineMath math="t" />.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                We start from the same linear-Gaussian coupling between clean data and noisy data: <InlineMath math="\mathbf{x}_t=\alpha_t\mathbf{x}_0+\sigma_t\boldsymbol{\epsilon}" />, with <InlineMath math="\boldsymbol{\epsilon}\sim\mathcal{N}(\mathbf{0},\mathbf{I})" />. If we imagine following this path as <InlineMath math="t" /> changes, the instantaneous motion is just its time derivative:
              </p>

              <BlockMath math="\mathbf{v}^{\text{cond}}(\mathbf{x}_t,t) := \dot{\mathbf{x}}_t = \dot{\alpha}_t\,\mathbf{x}_0+\dot{\sigma}_t\,\boldsymbol{\epsilon}." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                This is the familiar <em>conditional trick</em>: although we do not know the "true" marginal velocity associated with <InlineMath math="p_t" />, conditioning on <InlineMath math="\mathbf{x}_0" /> gives a closed-form regression target.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Training is therefore a simple regression problem. We sample <InlineMath math="\mathbf{x}_0,t,\boldsymbol{\epsilon}" />, form <InlineMath math="\mathbf{x}_t" />, and fit <InlineMath math="\mathbf{v}_\theta(\mathbf{x}_t,t)" /> to match <InlineMath math="\dot{\alpha}_t\mathbf{x}_0+\dot{\sigma}_t\boldsymbol{\epsilon}" />:
              </p>

              <BlockMath math="\mathcal{L}_{\text{FM}}(\theta) = \mathbb{E}_{t,\,\mathbf{x}_0,\,\boldsymbol{\epsilon}} \Big[ \lambda(t)\, \big\| \mathbf{v}_\theta(\mathbf{x}_t,t) - (\dot{\alpha}_t\,\mathbf{x}_0+\dot{\sigma}_t\,\boldsymbol{\epsilon}) \big\|_2^2 \Big]." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                The only subtlety is <em>what the "right" target is</em> if our network only gets <InlineMath math="\mathbf{x}_t" />. At time <InlineMath math="t" />, many different clean images <InlineMath math="\mathbf{x}_0" /> can lead to the same noisy point <InlineMath math="\mathbf{x}_t" />, so <InlineMath math="\mathbf{v}^{\text{cond}}(\mathbf{x}_t,t)" /> is not a single-valued function of <InlineMath math="\mathbf{x}_t" /> alone. In squared error, the <em>best possible</em> predictor given only <InlineMath math="\mathbf{x}_t" /> is the conditional mean of the target, under the chosen marginal path <InlineMath math="p_t" />:
              </p>

              <BlockMath math="\mathbf{v}(\mathbf{x}, t) := \mathbb{E}\!\left[\mathbf{v}^{\text{cond}}(\mathbf{x}_t, t)\,\middle|\,\mathbf{x}_t=\mathbf{x}\right], \qquad \mathbf{x}_t\sim p_t." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Now the key equivalence mirrors denoising score matching. A standard squared-loss decomposition implies that, for a constant <InlineMath math="C" /> independent of <InlineMath math="\theta" />,
              </p>

              <div className="bg-orange-50 border-2 border-orange-100 rounded-lg p-6 my-6 overflow-x-auto">
                <BlockMath math="\mathbb{E}_{t}\,\mathbb{E}_{\mathbf{x}_t\sim p_t} \Big[ \lambda(t)\, \big\| \mathbf{v}_\theta(\mathbf{x}_t,t)-\mathbf{v}(\mathbf{x}, t) \big\|_2^2 \Big] = \mathbb{E}_{t,\,\mathbf{x}_0,\,\boldsymbol{\epsilon}} \Big[ \lambda(t)\, \big\| \mathbf{v}_\theta(\mathbf{x}_t,t)-\mathbf{v}^{\text{cond}}(\mathbf{x}_t,t) \big\|_2^2 \Big] + C." />
              </div>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Namely, we rewrite the objective so we can swap an <em>unknown marginal</em> target for a <em>tractable conditional</em> one. The two losses differ only by a constant (independent of <InlineMath math="\theta" />), so they induce the same gradient updates and share the same optimum.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                At test time, we sample <InlineMath math="\mathbf{x}_T\sim\mathcal{N}(\mathbf{0},\mathbf{I})" /> and integrate the learned ODE
              </p>

              <BlockMath math="\frac{\mathrm{d}\mathbf{x}(t)}{\mathrm{d}t}=\mathbf{v}_\theta(\mathbf{x}(t),t), \qquad t:T\to 0," />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                to obtain a data-like <InlineMath math="\mathbf{x}_0" />. To actually run this on a computer, we discretize time into a grid and step <em>backward</em> from <InlineMath math="t" /> to <InlineMath math="t-\Delta t" /> along a chosen schedule. Each step replaces the continuous ODE with a small update rule, giving a practical approximation to the trajectory. Below are two standard concrete examples.
              </p>

              <h5 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-4 mb-2">
                Euler = DDIM-style Step
              </h5>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                The simplest choice is to use the velocity at the current point:
              </p>

              <BlockMath math="\mathbf{x}_{t-\Delta t} = \mathbf{x}_t -\Delta t\,\mathbf{v}_\theta(\mathbf{x}_t,t)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                This is the basic <em>first-order</em> Euler discretization of an ODE. With the learned diffusion-model velocity plugged in, this update recovers the familiar <em>DDIM-style deterministic sampler</em>: one model call per step, fast, but limited by first-order numerical accuracy.
              </p>

              <h5 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-4 mb-2">
                Heun = 2nd-order DPM-Solver-style Step
              </h5>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                A small upgrade is to take one "draft" step, then correct it using the velocity at the endpoint.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Predict (Euler):
              </p>

              <BlockMath math="\tilde{\mathbf{x}}_{t-\Delta t} = \mathbf{x}_t-\Delta t\,\mathbf{v}_\theta(\mathbf{x}_t,t)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Correct (average the two velocities):
              </p>

              <BlockMath math="\mathbf{x}_{t-\Delta t} = \mathbf{x}_t -\frac{\Delta t}{2}\Big( \mathbf{v}_\theta(\mathbf{x}_t,t) + \mathbf{v}_\theta(\tilde{\mathbf{x}}_{t-\Delta t},\,t-\Delta t) \Big)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                This is a <em>second-order</em> method. With the diffusion-model velocity plugged in, it becomes the same predictor–corrector pattern used by <em>second-order DPM-Solver</em> variants: two model calls per step, but typically much better accuracy at the same step budget.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                In both cases, repeating the update from <InlineMath math="t=T" /> down to <InlineMath math="t=0" /> yields a data-like sample <InlineMath math="\mathbf{x}_0" />.
              </p>

              <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-6 mb-3">
                Three Lenses on the Same Diffusion Path
              </h4>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                With the same fixed forward Gaussian rule
              </p>

              <BlockMath math="\mathbf{x}_t = \alpha_t \mathbf{x}_0 + \sigma_t \boldsymbol{\epsilon}," />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                all these methods start from the same convenience: we can generate a noisy sample <InlineMath math="\mathbf{x}_t" /> from a clean sample <InlineMath math="\mathbf{x}_0" /> in a fully analytic way. What changes is <em>which learnable target we use to describe (and later reverse) the evolution of the noisy marginals</em> <InlineMath math="p_t" />:
              </p>

              <ul className="list-disc list-inside space-y-2 my-4">
                <li className="leading-relaxed text-slate-700 dark:text-slate-300">
                  <em>DDPM:</em> predict the <em>noise</em> that was added (equivalently, a denoising direction / mean for one reverse step).
                </li>
                <li className="leading-relaxed text-slate-700 dark:text-slate-300">
                  <em>Score SDE:</em> predict the <em>score</em>, a direction that points toward more likely samples under <InlineMath math="p_t" />.
                </li>
                <li className="leading-relaxed text-slate-700 dark:text-slate-300">
                  <em>Flow matching:</em> predict a <em>velocity</em>, the instantaneous "push" that transports samples along the path.
                </li>
              </ul>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Despite these different targets, the training recipe follows the same principle: we avoid regressing on an intractable marginal object directly. Instead, we use the known conditional <InlineMath math="p(\mathbf{x}_t\mid \mathbf{x}_0)" /> to build a <em>closed-form conditional target</em> (noise / conditional score / conditional velocity). This is the same <em>conditional trick</em>, just shown in different forms.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Indeed, these targets (<InlineMath math="\mathbf{x}" />- / <InlineMath math="\boldsymbol{\epsilon}" />- / score- / velocity-prediction) are not isolated choices. They are different parameterizations of the same underlying Gaussian path. For instance, the forward rule <InlineMath math="\mathbf{x}_t=\alpha_t\mathbf{x}_0+\sigma_t\boldsymbol{\epsilon}" /> links <InlineMath math="\mathbf{x}_0" /> and <InlineMath math="\boldsymbol{\epsilon}" /> analytically, so knowing one lets you recover the others. As a result, the same reverse-step mean can be written using any of these parameterizations.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Likewise, under the same marginal path <InlineMath math="p_t" />, the "oracle" velocity that transports <InlineMath math="p_t" /> is tied to the score via the PF-ODE identity
              </p>

              <BlockMath math="\mathbf{v}(\mathbf{x},t)=f(t)\mathbf{x}-\frac{1}{2}g^2(t)\mathbf{s}(\mathbf{x},t)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                So, while different papers choose different training targets, they are largely <em>inter-convertible descriptions</em> of the same density evolution.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Next, we connect this back to the calculus view: how a distribution <InlineMath math="p_t" /> changes when we <em>move points</em> (ODE) or <em>add randomness</em> (diffusion).
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6 border-t pt-8 border-slate-200 dark:border-slate-700">
                II. Change-of-Variable Formulas
              </h2>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                All the forward and reverse procedures above can be viewed through the same geometric lens: we draw many points from some distribution (data, or the prior) and then <em>move those points together</em> according to a rule. If we imagine these points as a <em>cloud</em> in space, moving every point deforms the cloud: some regions get more crowded, others become more sparse.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                This immediately raises a recurring question:
              </p>

              <blockquote className="border-l-4 border-orange-400 dark:border-orange-300 pl-6 italic text-lg text-slate-700 dark:text-slate-300 my-6">
                In diffusion models, what happens to the underlying <em>probability density</em> when we move (and sometimes randomly perturb) all points, from the data distribution toward the prior, or back again?
              </blockquote>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                The first step toward a precise answer is a familiar tool from calculus: the <em>change-of-variable formula</em>.
              </p>

              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-8 mb-4">
                The Intuition: A Particle Cloud
              </h3>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                Imagine every possible image or audio clip is a point <InlineMath math="\mathbf{x}\in\mathbb{R}^D" />. Place a tiny particle at each data sample. Where particles cluster, the density is high; where they rarely appear, the density is low.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Now imagine applying a transformation to every particle. The key invariant is <em>mass conservation</em>: particles move around, but they are not created or destroyed, so <em>total probability stays 1</em>. Density changes only because space is stretched or squeezed.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Everything below is just different ways to write this idea cleanly.
              </p>

              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-8 mb-4">
                The Math We Already Know
              </h3>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                The good news is that diffusion models do not require exotic math. They mostly reuse one idea from calculus: if we <em>move points</em>, we automatically change how density concentrates. Let us start with the simplest case.
              </p>

              <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-6 mb-3">
                Calculus 101 (One Dimension)
              </h4>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                Let <InlineMath math="x_0\in\mathbb{R}" /> be a random variable with density <InlineMath math="p_0(x_0)" />. Apply a smooth invertible map <InlineMath math="\Psi:\mathbb{R}\to\mathbb{R}" /> and define <InlineMath math="x_1=\Psi(x_0)" />. Then the density after the map is
              </p>

              <BlockMath math="p_1(x_1) = p_0\bigl(\Psi^{-1}(x_1)\bigr)\, \left|\frac{\mathrm{d}\Psi^{-1}}{\mathrm{d} x_1}\right|." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Intuitively, <InlineMath math="\Psi" /> can <em>squeeze</em> or <em>stretch</em> the line. If it squeezes many <InlineMath math="x_0" /> values into a small interval of <InlineMath math="x_1" />, the density must go up there. If it stretches space out, density must go down. The factor <InlineMath math="|\frac{\mathrm{d}\Psi^{-1}}{\mathrm{d} x_1}|" /> is exactly this local stretching ratio.
              </p>

              <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-6 mb-3">
                Higher Dimensions
              </h4>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                In <InlineMath math="\mathbb{R}^D" />, the change-of-variables rule looks scarier only because of the <em>determinant</em>. Let <InlineMath math="\Psi:\mathbb{R}^D\to\mathbb{R}^D" /> be a smooth bijection and set <InlineMath math="\mathbf{x}_1=\Psi(\mathbf{x}_0)" />. If <InlineMath math="p_0" /> is the density before the map and <InlineMath math="p_1" /> after, then
              </p>

              <BlockMath math="p_1(\mathbf{x}_1) = p_0\bigl(\Psi^{-1}(\mathbf{x}_1)\bigr)\, \left|\det\frac{\partial \Psi^{-1}}{\partial \mathbf{x}_1}\right|." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                The determinant is just a <em>local volume scale</em>: if a tiny ball of points gets stretched to have 2× the volume, then the density must drop by 2× so that <em>mass stays the same</em>.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                The takeaway we will keep using is:
              </p>

              <blockquote className="border-l-4 border-orange-400 dark:border-orange-300 pl-6 italic text-lg text-slate-700 dark:text-slate-300 my-6">
                If we move points by an invertible map, density changes according to how much the map locally stretches or compresses space.
              </blockquote>

              <div className="mb-3">
                <img
                  src="/assets/change-of-variable.png"
                  alt="Change-of-variable visualization"
                  className="block w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%2364748b"%3EPlaceholder: Add your image to /public/assets/%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-8 mb-4">
                From One Big Map to a Time-Evolution
              </h3>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                The change-of-variable formula tells us how <em>one</em> invertible map <InlineMath math="\Psi" /> reshapes a density by locally stretching or compressing volume.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                To get to diffusion-style dynamics, we simply stop doing <em>one</em> big warp and instead apply <em>many tiny warps</em> in sequence. Think of a long chain of bijections:
              </p>

              <BlockMath math="\mathbf{x}_0 \xrightarrow{\ \Psi_1\ } \mathbf{x}_{\Delta t} \xrightarrow{\ \Psi_2\ } \mathbf{x}_{2\Delta t} \ \cdots\ \xrightarrow{\ \Psi_L\ } \mathbf{x}_{T}, \qquad \Delta t = T/L." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Each step conserves probability mass and therefore obeys the same change-of-variable rule. In log form, the Jacobian determinants just <em>add up</em>:
              </p>

              <BlockMath math="\log p_T(\mathbf{x}_T) = \log p_0(\mathbf{x}_0) - \sum_{k=1}^L \log\left|\det\frac{\partial \Psi_k}{\partial \mathbf{x}}\right|." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                This is exactly the normalizing-flow picture, only used in <em>tiny increments</em>.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Now make those increments concrete with a nice set of illustration. A natural "tiny warp" is to move each point a small distance along a velocity field,
              </p>

              <BlockMath math="\mathbf{x}_{t+\Delta t}=\mathbf{x}_t+\Delta t\,\mathbf{v}_t(\mathbf{x}_t)," />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                or we write it as:
              </p>

              <BlockMath math="\Psi_{\Delta t}(\mathbf{x}):=\mathbf{x}+\Delta t\,\mathbf{v}_t(\mathbf{x})." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                To understand how the density changes, keep one picture in mind: <InlineMath math="p_{t+\Delta t}(\mathbf{x})" /> measures how much probability mass ends up near <InlineMath math="\mathbf{x}" /> after the step.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Change-of-variables says this comes from two first-order effects happening at once. First, the mass near <InlineMath math="\mathbf{x}" /> must have arrived from a nearby point at time <InlineMath math="t" />, namely the point that maps into <InlineMath math="\mathbf{x}" /> under one step. Since the step is tiny, this "backtracked" location is simply
              </p>

              <BlockMath math="\Psi_{\Delta t}^{-1}(\mathbf{x}) = \mathbf{x}-\Delta t\,\mathbf{v}_t(\mathbf{x})+o(\Delta t)," />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                so the old density is sampled slightly upstream:
              </p>

              <BlockMath math="p_t\!\left(\Psi_{\Delta t}^{-1}(\mathbf{x})\right) = p_t(\mathbf{x}) -\Delta t\,\mathbf{v}_t(\mathbf{x})\cdot\nabla_{\mathbf{x}}p_t(\mathbf{x}) +o(\Delta t)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Second, even if the same particles arrive, their local spacing can expand or compress, which rescales density by a Jacobian factor. Because <InlineMath math="\Psi_{\Delta t}" /> is close to identity,
              </p>

              <BlockMath math="\frac{\partial \Psi_{\Delta t}}{\partial \mathbf{x}} = \mathbf{I}+\Delta t\,\nabla_{\mathbf{x}}\mathbf{v}_t(\mathbf{x}) \quad\Longrightarrow\quad \left|\det\frac{\partial \Psi_{\Delta t}^{-1}}{\partial \mathbf{x}}\right| = 1-\Delta t\,\nabla_{\mathbf{x}}\cdot\mathbf{v}_t(\mathbf{x})+o(\Delta t)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Putting these two pieces into one change-of-variable step,
              </p>

              <BlockMath math="p_{t+\Delta t}(\mathbf{x}) = p_t\!\left(\Psi_{\Delta t}^{-1}(\mathbf{x})\right)\, \left|\det\frac{\partial \Psi_{\Delta t}^{-1}}{\partial \mathbf{x}}\right|," />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                and keeping only first-order terms gives the clean update
              </p>

              <BlockMath math="p_{t+\Delta t}(\mathbf{x}) = p_t(\mathbf{x}) -\Delta t\,\nabla_{\mathbf{x}}\cdot\bigl(p_t(\mathbf{x})\,\mathbf{v}_t(\mathbf{x})\bigr) +o(\Delta t)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Now the limit <InlineMath math="\Delta t\to 0" /> is just the definition of a time derivative, yielding the <em>continuity equation</em>
              </p>

              <div className="bg-orange-50 border-2 border-orange-100 rounded-lg p-6 my-6">
                <BlockMath math="\frac{\partial p_t(\mathbf{x})}{\partial t} = -\nabla_{\mathbf{x}}\cdot\bigl(p_t(\mathbf{x})\,\mathbf{v}_t(\mathbf{x})\bigr)." />
              </div>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                So nothing mysterious happened. It is the same change-of-variable idea, applied to many tiny bijections and then viewed in the continuous-time limit.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Physically, the continuity equation says that density changes only because probability mass <em>flows</em> across space. The backtracking part answers which mass reaches a location <InlineMath math="\mathbf{x}" /> after a small step, while the Jacobian part tells you whether that arriving mass gets diluted (local expansion) or concentrated (local compression). In the limit, these two effects combine into one net-outflow law as the continuity equation.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                It is often helpful to name the quantity inside the divergence. The vector
              </p>

              <BlockMath math="\mathbf{J}_{\text{adv}}(\mathbf{x},t) := p_t(\mathbf{x})\,\mathbf{v}_t(\mathbf{x})" />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                is called the <em>advective flux</em>. Intuitively, it is "<em>density × speed</em>": how much probability is being carried past <InlineMath math="\mathbf{x}" /> per unit time. With this notation, the continuity equation is just a local balance law:
              </p>

              <blockquote className="border-l-4 border-orange-400 dark:border-orange-300 pl-6 italic text-lg text-slate-700 dark:text-slate-300 my-6">
                Density at <InlineMath math="\mathbf{x}" /> goes <em>up</em> when more probability flows <em>in</em> than flows <em>out</em>, and goes <em>down</em> when more flows <em>out</em> than flows <em>in</em>.
              </blockquote>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                That "more in than out" statement is exactly what the <InlineMath math="-\nabla\!\cdot \mathbf{J}_{\text{adv}}" /> term encodes.
              </p>

              <div className="mb-3">
                <img
                  src="/assets/fokker_planck_gmm_to_equilibrium.gif"
                  alt="Continuity equation visualization"
                  className="block w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%2364748b"%3EPlaceholder: Add your image to /public/assets/%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-8 mb-4">
                Enter the Noise
              </h3>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                So far we only had <em>pure motion</em>: each particle follows the deterministic flow <InlineMath math="\mathbf{v}_t" />, and density changes only because mass is carried from place to place. That is exactly what the continuity equation states. It is just the change-of-variable idea applied <em>continuously</em>: as points move, the density reshapes to conserve total probability.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                The forward diffusion process keeps the same "move points, update density" picture, but adds one extra ingredient: each point also gets a tiny Gaussian jitter. If we take a cloud of particles and continuously give every particle a small random wiggle, the cloud becomes <em>more spread out</em> over time. Two particles that start very close will typically drift apart. As a result, probability does not only <em>shift</em> due to the drift; it also <em>spreads</em> from dense regions into nearby less-dense regions. This is what the extra noise term captures at the density level: it adds a second contribution to the flux that pushes mass from high density toward low density.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                A convenient way to say this without changing the logic is: we still track density by the same conservation law, but now there are two ways mass can cross space. One is the usual "carried by motion" flow,
              </p>

              <BlockMath math="\mathbf{J}_{\text{adv}}(\mathbf{x},t) = p_t(\mathbf{x})\,\mathbf{f}_t(\mathbf{x})," />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                and the other is a "spreading" flow caused by the jitters, which pushes mass from high density to low density,
              </p>

              <BlockMath math="\mathbf{J}_{\text{spread}}(\mathbf{x},t) = -\frac{1}{2}g^2(t)\,\nabla_{\mathbf{x}}p_t(\mathbf{x})." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Add these two contributions, and apply the same net-outflow rule as in the continuity equation:
              </p>

              <div className="bg-orange-50 border-2 border-orange-100 rounded-lg p-6 my-6 overflow-x-auto">
                <BlockMath math="\frac{\partial p_t(\mathbf{x})}{\partial t} = -\nabla_{\mathbf{x}}\cdot\Big(\mathbf{J}_{\text{move}}(\mathbf{x},t)+\mathbf{J}_{\text{spread}}(\mathbf{x},t)\Big) = -\nabla_{\mathbf{x}}\cdot\bigl(\mathbf{f}_t(\mathbf{x})\,p_t(\mathbf{x})\bigr) +\frac{1}{2}g(t)^2\,\Delta_{\mathbf{x}}p_t(\mathbf{x})." />
              </div>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                This equation is the formal way to say: drift moves the probability cloud, and Gaussian jitters blur it.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Let us revisit how the change-of-variable story shows up inside diffusion models.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                In diffusion models, no matter which viewpoint we take (DDPM, Score SDE, or Flow Matching), we first choose the forward noise-injection rule ourselves. Concretely, we fix Gaussian conditionals such as <InlineMath math="p(\mathbf{x}_t\mid \mathbf{x}_0)=\mathcal{N}(\mathbf{x}_t;\alpha_t\mathbf{x}_0,\sigma_t^2\mathbf{I})" />, which tells us what a clean sample looks like after we inject noise up to time <InlineMath math="t" />. That single choice pins down a whole movie of <em>snapshot marginals</em> <InlineMath math="p_t" />, starting at the data distribution and ending near a simple noise distribution. In continuous time, the density-level bookkeeping of this movie is captured by the Fokker–Planck equation: it is the change-of-variables rule for a cloud of particles that both moves and spreads.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                The reverse-time generation step is then built to play the same movie reversely. We start from noise and update the sample step by step (by solving the PF-ODE), while remaining consistent with <em>the same</em> snapshot path <InlineMath math="p_t" /> along the way.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6 border-t pt-8 border-slate-200 dark:border-slate-700">
                III. From Slow Samplers to Flow Maps
              </h2>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                So far, everything we have discussed shares a common engineering drawback: <em>sampling is iterative</em>. Turning a single draw of Gaussian noise into a realistic sample typically requires dozens to hundreds of neural network evaluations, because we must integrate the reverse-time dynamics step by step.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                This raises a natural question:
              </p>

              <blockquote className="border-l-4 border-orange-400 dark:border-orange-300 pl-6 italic text-lg text-slate-700 dark:text-slate-300 my-6">
                Can we design a standalone generative principle that trains in a stable way, and samples quickly?
              </blockquote>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                One promising answer is the family of <strong>flow map models</strong>.
              </p>

              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-8 mb-4">
                What Is a Flow Map Model?
              </h3>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                Recall the PF-ODE viewpoint: there exists an <em>ideal</em> drift field <InlineMath math="\mathbf{v}(\mathbf{x},t)" /> whose trajectories reproduce the prescribed snapshot marginals defined by the forward noising process. A deterministic sample path follows
              </p>

              <BlockMath math="\frac{\mathrm{d}\mathbf{x}(u)}{\mathrm{d}u} = \mathbf{v}\bigl(\mathbf{x}(u),u\bigr)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                If we start from a state <InlineMath math="\mathbf{x}_s" /> at time <InlineMath math="s" /> and let the dynamics run until time <InlineMath math="t" />, the state lands at some new point <InlineMath math="\mathbf{x}_t" />. This "take me from <InlineMath math="s" /> to <InlineMath math="t" />" transformation is a <em>time-jump operator</em>: it tells us where a point ends up after evolving for a while. We call this operator the <em>flow map</em>, and write it as
              </p>

              <BlockMath math="\Psi_{s\to t}(\mathbf{x}_s) = \mathbf{x}_s+\int_s^t \mathbf{v}\bigl(\mathbf{x}(u),u\bigr)\,\mathrm{d}u." />

              <div className="mb-3">
                <img
                  src="/assets/flow-map.svg"
                  alt="Flow map visualization"
                  className="block w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%2364748b"%3EPlaceholder: Add your image to /public/assets/%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                It answers one concrete question: <em>starting from the current noisy state, where would the ideal dynamics place me at a later time?</em> Standard samplers approximate this jump by chaining many tiny solver steps. A flow map model tries to learn the jump <em>directly</em>:
              </p>

              <BlockMath math="\mathbf{G}_\theta(\mathbf{x}_s,s,t)\approx \Psi_{s\to t}(\mathbf{x}_s)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                If we could query the true <em>time-jump</em> <InlineMath math="\Psi_{s\to t}" />, the training story would be almost too simple: we would just regress to the oracle target. Concretely, we would sample a start time <InlineMath math="s" />, an end time <InlineMath math="t" />, draw a point <InlineMath math="\mathbf{x}_s\sim p_s" />, and train a model <InlineMath math="\mathbf{G}_\theta" /> to predict where that point should land after evolving from <InlineMath math="s" /> to <InlineMath math="t" />:
              </p>

              <div className="bg-orange-50 border-2 border-orange-100 rounded-lg p-6 my-6">
                <BlockMath math="\mathcal{L}_{\text{oracle}}(\theta) = \mathbb{E}_{s,t}\,\mathbb{E}_{\mathbf{x}_s\sim p_s} \Bigl[ w(s,t)d\bigl(\mathbf{G}_\theta(\mathbf{x}_s,s,t),\,\Psi_{s\to t}(\mathbf{x}_s)\bigr) \Bigr]." />
              </div>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Here <InlineMath math="d(\cdot,\cdot)" /> is simply a distance-like measurement (e.g., MSE), and <InlineMath math="w(s,t)" /> is a time-weighting function. At the optimum, <InlineMath math="\mathbf{G}_\theta(\mathbf{x}_s,s,t)" /> would match the oracle jump <InlineMath math="\Psi_{s\to t}(\mathbf{x}_s)" />, so generation becomes a few large, accurate jumps rather than a long chain of tiny updates. In the most extreme case, we could even do one-step generation: first draw a prior sample <InlineMath math="\mathbf{x}_T \sim p_{\text{prior}}" />, then map it straight to data with
              </p>

              <BlockMath math="\mathbf{G}_\theta(\mathbf{x}_T, T, 0)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                The snag is that <InlineMath math="\Psi_{s\to t}" /> is not available in closed form. So the real design problem is: <em>how do we create practical targets that still point toward the same oracle objective?</em> The cleanest guiding structure is a property that true flow maps must satisfy.
              </p>

              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-8 mb-4">
                Three Flow Map Families
              </h3>

              <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-6 mb-3">
                Consistency Models (CM)
              </h4>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                Since our end goal is a clean sample, CM fixes the terminal time at <InlineMath math="0" /> and only focuses on the special jumps <InlineMath math="\Psi_{s\to 0}" />. The ideal picture is straightforward: given a noisy state <InlineMath math="\mathbf{x}_s" />, we would like a denoiser that directly returns where the <em>true</em> dynamics would land at time <InlineMath math="0" />,
              </p>

              <BlockMath math="\mathbf{f}_\theta(\mathbf{x}_s,s)\approx \Psi_{s\to 0}(\mathbf{x}_s)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                If that oracle target were available, training would reduce to plain regression: sample a time <InlineMath math="s" />, draw <InlineMath math="\mathbf{x}_s\sim p_s" />, and penalize the mismatch (with a time weight <InlineMath math="w(s)" /> and a distance-like measure <InlineMath math="d" />):
              </p>

              <BlockMath math="\mathcal{L}_{\text{oracle-CM}}(\theta) = \mathbb{E}_{s}\,\mathbb{E}_{\mathbf{x}_s\sim p_s} \Bigl[ w(s)\,d\bigl(\mathbf{f}_\theta(\mathbf{x}_s,s),\,\Psi_{s\to 0}(\mathbf{x}_s)\bigr) \Bigr]." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                But in practice the oracle flow map <InlineMath math="\Psi_{s\to 0}" /> is not something we can query. CM gets around this with one simple idea: <em>self-consistency</em>, which is really a flow-map property. Under standard ODE conditions, solutions are <em>unique</em>, so each initial state maps to a unique state at time <InlineMath math="t" /> by the flow map. Equivalently, flow maps must <em>compose</em>: going from <InlineMath math="s" /> to <InlineMath math="0" /> is the same as going from <InlineMath math="s" /> to <InlineMath math="s-\Delta s" /> and then from <InlineMath math="s-\Delta s" /> to <InlineMath math="0" />. As a result, any two states on the same trajectory, say <InlineMath math="\mathbf{x}_s" /> and its backstep <InlineMath math="\Psi_{s\to s-\Delta s}(\mathbf{x}_s)" />, must share the same endpoint at time <InlineMath math="0" />. This is exactly what we exploit to replace the missing oracle target with a stop-gradient <em>self-target</em> <InlineMath math="\mathbf{f}_{\theta^-}" /> computed from the nearby state closer to <InlineMath math="0" />:
              </p>

              <BlockMath math="\Psi_{s\to 0}(\mathbf{x}_s) \;\approx\; \Bigl(\mathbf{f}_{\theta^-}(\Psi_{s\to s-\Delta s}(\mathbf{x}_s),\,s-\Delta s)\Bigr), \qquad \Delta s>0." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                So the whole method boils down to one practical step: <em>how do we get a proxy <InlineMath math="\widehat{\mathbf{x}}_{s-\Delta s}" /> for the inaccessible backstep <InlineMath math="\Psi_{s\to s-\Delta s}(\mathbf{x}_s)" />?</em> There are two standard routes.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                In <em>distillation</em>, we obtain the intermediate state by explicitly taking one reverse-time solver step driven by a pre-trained diffusion teacher. Concretely, starting from the current state <InlineMath math="\mathbf{x}_s" />, we take
              </p>

              <BlockMath math="\widehat{\mathbf{x}}_{s-\Delta s} = \text{one solver step using the teacher, from } s \text{ to } s-\Delta s" />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                meaning that <InlineMath math="\widehat{\mathbf{x}}_{s-\Delta s}" /> is the result of a single numerical update (e.g., Euler) from time <InlineMath math="s" /> to <InlineMath math="s-\Delta s" /> using the teacher diffusion model as the PF-ODE drift.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                In <em>from scratch</em> training, we build the intermediate state directly from the forward-corruption rule: if <InlineMath math="\mathbf{x}_s" /> was formed from the same clean sample <InlineMath math="\mathbf{x}_0" /> and noise <InlineMath math="\boldsymbol{\epsilon}" />, then we can reuse them to "rewind" to the slightly less-noisy time <InlineMath math="s-\Delta s" />:
              </p>

              <BlockMath math="\widehat{\mathbf{x}}_{s-\Delta s} = \alpha_{s-\Delta s}\mathbf{x}_0 + \sigma_{s-\Delta s}\boldsymbol{\epsilon}." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Once we have this proxy point, CM training becomes a fully practical regression against a stop-gradient self-target, replacing the inaccessible oracle map inside the original objective.
              </p>

              <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-6 mb-3">
                Consistency Trajectory Models (CTM)
              </h4>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                CTM aims to learn the <em>general</em> flow map <InlineMath math="\Psi_{s\to t}" />, but it does so with an Euler-flavored parameterization that makes the model behave like a solver step. The starting point is the flow map form
              </p>

              <BlockMath math="\Psi_{s\to t}(\mathbf{x}_s)=\mathbf{x}_s+\int_s^t \mathbf{v}(\mathbf{x}(u),u)\,\mathrm{d}u," />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                and the key move is to rewrite this jump as a weighted blend of the input <InlineMath math="\mathbf{x}_s" /> and a residual term:
              </p>

              <BlockMath math="\Psi_{s\to t}(\mathbf{x}_s) = \frac{t}{s}\,\mathbf{x}_s + \Bigl(1-\frac{t}{s}\Bigr)\,\mathbf{g}(\mathbf{x}_s,s,t), \qquad \mathbf{g}(\mathbf{x}_s,s,t) := \mathbf{x}_s+\frac{s}{s-t}\int_s^t \mathbf{v}(\mathbf{x}(u),u)\,\mathrm{d}u." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                This motivates a solver-like parameterization for the learned jump:
              </p>

              <BlockMath math="\mathbf{G}_\theta(\mathbf{x}_s,s,t) := \frac{t}{s}\,\mathbf{x}_s + \Bigl(1-\frac{t}{s}\Bigr)\,\mathbf{g}_\theta(\mathbf{x}_s,s,t)," />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                where <InlineMath math="\mathbf{g}_\theta" /> is aimed to approximate the residual term <InlineMath math="\mathbf{g}(\mathbf{x}_s,s,t)" />:
              </p>

              <BlockMath math="\mathbf{g}_\theta \approx \mathbf{g}." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                A nice side-effect is that the boundary condition comes for free. Plugging in <InlineMath math="t=s" /> makes the mixing weight vanish, so
              </p>

              <BlockMath math="\mathbf{G}_\theta(\mathbf{x}_s,s,s)=\mathbf{x}_s," />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                without any special constraint during training.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                This parameterization is useful because the residual <InlineMath math="\mathbf{g}" /> has a clean meaning in the small-step limit. As <InlineMath math="t\to s" />, the flow-map integral collapses to an Euler-sized move, and <InlineMath math="\mathbf{g}(\mathbf{x}_s,s,t)" /> approaches
              </p>

              <BlockMath math="\mathbf{g}(\mathbf{x}_s,s,t) = \mathbf{x}_s - s\,\mathbf{v}(\mathbf{x}_s,s) + \mathcal{O}(|t-s|)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                So learning <InlineMath math="\mathbf{g}" /> does two jobs at once: it supports <em>finite</em> jumps <InlineMath math="s\to t" />, and it also encodes the <em>instantaneous</em> drift through the infinitesimal limit. In particular, evaluating the network at "same time" gives a direct drift estimate,
              </p>

              <BlockMath math="\mathbf{v}(\mathbf{x}_s,s)\;\approx\;\frac{\mathbf{x}_s-\mathbf{g}_\theta(\mathbf{x}_s,s,s)}{s}." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                This is why <InlineMath math="\mathbf{g}_\theta(\cdot,s,s)" /> matters in CTM: it acts as a local direction field that we can reuse to build short moves and form training targets.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                CTM extends CM's <em>self-consistency</em> into the natural flow-map principle called the <em>semigroup property</em>. The idea is simple: a long jump should agree with two shorter jumps stitched together. Concretely, for any intermediate time <InlineMath math="u" /> between <InlineMath math="s" /> and <InlineMath math="t" />, the true flow maps satisfy
              </p>

              <BlockMath math="\Psi_{s\to t} \;=\; \Psi_{u\to t}\circ \Psi_{s\to u}." />

              <div className="mb-3">
                <img
                  src="/assets/semigroup.svg"
                  alt="Semigroup property visualization"
                  className="block w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%2364748b"%3EPlaceholder: Add your image to /public/assets/%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                So CTM enforces the same idea with its learned map: a <em>big jump</em> should agree with <em>two smaller jumps</em> stitched at <InlineMath math="u" />. Since the oracle maps are unavailable, CTM uses a stop-gradient self-target:
              </p>

              <BlockMath math="\Psi_{s\to t}(\mathbf{x}_s) \;\approx\; \mathbf{G}_{\theta^-}\Bigl(\Psi_{s\to u}(\mathbf{x}_s),\,u,\,t\Bigr)," />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Finally, <InlineMath math="\Psi_{s\to u}(\mathbf{x}_s)" /> can be approximated in two ways. In <em>distillation</em>, we compute it by running a few solver steps of a pre-trained diffusion teacher, starting from <InlineMath math="\mathbf{x}_s" /> and integrating from time <InlineMath math="s" /> to time <InlineMath math="u" />:
              </p>

              <BlockMath math="\Psi_{s\to u}(\mathbf{x}_s) \approx \text{few solver steps using the pre-trained diffusion teacher, from } s \text{ to } u." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                In <em>from scratch</em> training, because <InlineMath math="\mathbf{g}_\theta(\cdot,s,s)" /> reproduces the instantaneous drift of PF-ODE, we approximate <InlineMath math="\Psi_{s\to u}(\mathbf{x}_s)" /> using CTM itself by rolling out a short self-teacher trajectory driven by the local drift implied by <InlineMath math="\mathbf{g}_\theta(\cdot,s,s)" />:
              </p>

              <BlockMath math="\Psi_{s\to u}(\mathbf{x}_s) \approx \text{few solver steps using } \mathbf{g}_\theta(\cdot,s,s) \text{ from } s \text{ to } u." />

              <div className="mb-3">
                <img
                  src="/assets/ctm-target.svg"
                  alt="CTM visualization"
                  className="block w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%2364748b"%3EPlaceholder: Add your image to /public/assets/%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-6 mb-3">
                Mean Flow (MF)
              </h4>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                MF keeps the same end goal of fast, accurate jumps for learning the <em>general</em> flow map <InlineMath math="\Psi_{s\to t}" />, but it changes <em>what</em> the network predicts and <em>how</em> it is trained compared to CTM. Instead of outputting the endpoint jump directly, MF asks for an <em>average integration</em> over the interval, which we can view as the average slope of the flow map:
              </p>

              <BlockMath math="\mathbf{h}(\mathbf{x}_s,s,t) := \frac{1}{t-s}\int_s^t \mathbf{v}\bigl(\mathbf{x}(u),u\bigr)\,\mathrm{d}u, \qquad \mathbf{h}_\theta(\mathbf{x}_s,s,t)\approx \mathbf{h}(\mathbf{x}_s,s,t)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Once we have this slope-like quantity, the jump is recovered by a simple reconstruction:
              </p>

              <BlockMath math="\Psi_{s\to t}(\mathbf{x}_s)\approx \mathbf{x}_s+(t-s)\,\mathbf{h}_\theta(\mathbf{x}_s,s,t)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                This is often <em>easier to learn</em> in practice: predicting an average drift is like learning a reliable slope that can be reused across different step sizes, instead of chasing a single fragile endpoint.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                MF still needs supervision, so the question is how to build a usable target for <InlineMath math="\mathbf{h}" />. The key is a small calculus fact. Starting from the definition
              </p>

              <BlockMath math="(t-s)\,\mathbf{h}(\mathbf{x}_s,s,t)=\int_s^t \mathbf{v}\bigl(\mathbf{x}(u),u\bigr)\,\mathrm{d}u," />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                we differentiate both sides with respect to the start time <InlineMath math="s" />. Two things then happen at once: the interval length changes, and the starting state <InlineMath math="\mathbf{x}_s" /> itself slides along the trajectory with
              </p>

              <BlockMath math="\frac{\mathrm{d}}{\mathrm{d}s}\mathbf{x}_s=\mathbf{v}(\mathbf{x}_s,s)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Putting these together yields an identity that expresses the average slope in terms of the <em>instantaneous drift</em> at <InlineMath math="s" />, plus correction terms involving the derivatives of <InlineMath math="\mathbf{h}" />:
              </p>

              <BlockMath math="\mathbf{h}(\mathbf{x}_s,s,t) = \mathbf{v}(\mathbf{x}_s,s) - (s-t)\Bigl( \mathbf{v}(\mathbf{x}_s,s)\,\partial_{\mathbf{x}} \mathbf{h}(\mathbf{x}_s,s,t) + \partial_{s} \mathbf{h}(\mathbf{x}_s,s,t) \Bigr)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                This is the <em>MF identity</em> handle: it turns an integral quantity into a local relation we can enforce during training.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Therefore, MF turns the MF identity into a practical training signal by <em>freezing</em> the derivative terms with a stop-gradient copy <InlineMath math="\mathbf{h}_{\theta^-}" />. This gives us a usable proxy for the oracle mean flow <InlineMath math="\mathbf{h}" />:
              </p>

              <BlockMath math="\mathbf{h}(\mathbf{x}_s,s,t) \approx \mathbf{v}(\mathbf{x}_s,s) - (s-t)\Bigl( \mathbf{v}(\mathbf{x}_s,s)\,\partial_{\mathbf{x}} \mathbf{h}_{\theta^-}(\mathbf{x}_s,s,t) + \partial_{s} \mathbf{h}_{\theta^-}(\mathbf{x}_s,s,t) \Bigr)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                MF still needs the oracle instantaneous drift <InlineMath math="\mathbf{v}(\mathbf{x}_s,s)" />. In practice we plug in an estimate <InlineMath math="\widehat{\mathbf{v}}(\mathbf{x}_s,s)" /> in one of two ways. With (i) <em>distillation</em>, a pre-trained diffusion model provides this velocity estimate. With (ii) <em>from scratch</em> training, we use the forward-corruption rule itself: if <InlineMath math="\mathbf{x}_s" /> was generated from a clean sample <InlineMath math="\mathbf{x}_0" /> using the same noise draw <InlineMath math="\boldsymbol{\epsilon}" />, then the conditional mean path implies a closed-form velocity at time <InlineMath math="s" />, giving a direct estimate
              </p>

              <BlockMath math="\widehat{\mathbf{v}}(\mathbf{x}_s,s)=\alpha_s'\mathbf{x}_0 +\sigma_s' \boldsymbol{\epsilon}." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Putting these together yields MF's final regression target, a fully practical proxy for <InlineMath math="\mathbf{h}(\mathbf{x}_s,s,t)" />:
              </p>

              <BlockMath math="\mathbf{h}_{\theta^-}^{\text{tgt}}(\mathbf{x}_s,s,t) := \widehat{\mathbf{v}}(\mathbf{x}_s,s) - (s-t)\Bigl( \widehat{\mathbf{v}}(\mathbf{x}_s,s)\,\partial_{\mathbf{x}} \mathbf{h}_{\theta^-}(\mathbf{x}_s,s,t) + \partial_{s} \mathbf{h}_{\theta^-}(\mathbf{x}_s,s,t) \Bigr)." />

              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-8 mb-4">
                How the Three Flow Map Models Relate
              </h3>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                CTM contains CM as a special anchored case. If CTM always fixes the terminal time to <InlineMath math="t=0" />, then it only needs to learn the maps <InlineMath math="\Psi_{s\to 0}" />, which is exactly the CM setting.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                More broadly, CTM and MF are <em>mathematically related</em>: they aim at the same oracle flow map, but they choose different parameterizations of the same jump. One way to see this is to rewrite the same map <InlineMath math="\Psi_{t\to s}(\mathbf{x}_t)" /> in two equivalent-looking forms:
              </p>

              <div className="overflow-x-auto my-6">
                <BlockMath math="\Psi_{t\to s}(\mathbf{x}_t) = \frac{s}{t}\mathbf{x}_t + \frac{t-s}{t}\underbrace{\Bigl[\mathbf{x}_t+\frac{t}{t-s}\int_t^s \mathbf{v}(\mathbf{x}_u, u)\,\mathrm{d}u\Bigr]}_{\approx\,\mathbf{g}_\theta} = \mathbf{x}_t + (s-t)\underbrace{\Bigl[\frac{1}{s-t}\int_t^s \mathbf{v}(\mathbf{x}_u, u)\,\mathrm{d}u\Bigr]}_{\approx\,\mathbf{h}_\theta}." />
              </div>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Beyond being <em>mathematically related</em> at the level of parameterization, CTM and MF objectives are also connected. We start from the raw squared error
              </p>

              <BlockMath math="\bigl\|\mathbf{G}_\theta(\mathbf{x}_t,t,s)-\Psi_{t\to s}(\mathbf{x}_t)\bigr\|_2^2." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Using the CTM parameterization and a matching oracle decomposition, we have
              </p>

              <BlockMath math="\mathbf{G}_\theta(\mathbf{x}_t,t,s) = \frac{s}{t}\mathbf{x}_t+\frac{t-s}{t}\,\mathbf{g}_\theta(\mathbf{x}_t,t,s), \qquad \Psi_{t\to s}(\mathbf{x}_t) = \frac{s}{t}\mathbf{x}_t+\frac{t-s}{t}\Bigl(\mathbf{x}_t+\frac{t}{t-s}\int_t^s \mathbf{v}(\mathbf{x}_u,u)\,\mathrm{d}u\Bigr)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                The common base term <InlineMath math="\frac{s}{t}\mathbf{x}_t" /> cancels, so the squared error factors into a scale term and a residual mismatch:
              </p>

              <BlockMath math="\bigl\|\mathbf{G}_\theta(\mathbf{x}_t,t,s)-\Psi_{t\to s}(\mathbf{x}_t)\bigr\|_2^2 = \Bigl(\frac{t-s}{t}\Bigr)^2 \Bigl\| \mathbf{g}_\theta(\mathbf{x}_t,t,s) - \Bigl(\mathbf{x}_t+\frac{t}{t-s}\int_t^s \mathbf{v}(\mathbf{x}_u,u)\,\mathrm{d}u\Bigr) \Bigr\|_2^2." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                To relate this to MF, we consider the following network re-parametrization
              </p>

              <BlockMath math="\mathbf{g}_\theta(\mathbf{x}_t,t,s):=\mathbf{x}_t-t\,\mathbf{h}_\theta(\mathbf{x}_t,t,s)." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Inside the norm, the <InlineMath math="\mathbf{x}_t" /> terms cancel again, leaving an error purely in the averaged quantity:
              </p>

              <BlockMath math="\Bigl\| \mathbf{g}_\theta(\mathbf{x}_t,t,s) - \Bigl(\mathbf{x}_t+\frac{t}{t-s}\int_t^s \mathbf{v}(\mathbf{x}_u,u)\,\mathrm{d}u\Bigr) \Bigr\|_2^2 = t^2\Bigl\| \mathbf{h}_\theta(\mathbf{x}_t,t,s) - \Bigl(\frac{1}{s-t}\int_t^s \mathbf{v}(\mathbf{x}_u,u)\,\mathrm{d}u\Bigr) \Bigr\|_2^2." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Multiplying by the prefactor gives
              </p>

              <BlockMath math="\bigl\|\mathbf{G}_\theta(\mathbf{x}_t,t,s)-\Psi_{t\to s}(\mathbf{x}_t)\bigr\|_2^2 = (t-s)^2 \Bigl\| \mathbf{h}_\theta(\mathbf{x}_t,t,s) - \Bigl(\frac{1}{s-t}\int_t^s \mathbf{v}(\mathbf{x}_u,u)\,\mathrm{d}u\Bigr) \Bigr\|_2^2." />

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                In words, CTM measures error in "residual coordinates" <InlineMath math="\mathbf{g}_\theta" />, while MF measures error in "average-slope coordinates" <InlineMath math="\mathbf{h}_\theta" />. The algebra shows these objectives are <em>mathematically related</em>, differing only by a time-dependent scaling of scale <InlineMath math="t^2" />.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Flow map models all target the same underlying object: the <em>oracle flow map</em> <InlineMath math="\Psi_{s\to t}" /> that moves probability mass along the ideal PF-ODE. What differs is <em>which handle</em> we use to learn that map without ever querying it directly. The punchline is that CM, CTM, MF are not three unrelated recipes. They are three ways to learn the same oracle flow map using different parameterizations and different self-contained training signals. In practice, this is exactly how we turn "many tiny solver steps" into "a few accurate jumps" while staying faithful to the same density-evolution story we started from: move particles, conserve probability, and learn the map that performs the transport.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6 border-t pt-8 border-slate-200 dark:border-slate-700">
                Conclusion
              </h2>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                Modern diffusion models can look like a zoo of acronyms, but the underlying story is surprisingly simple. At heart, they are all ways to <em>transport probability mass</em> from a simple Gaussian distribution to the complicated data distribution progressively. Once you see generation as a <em>moving cloud of particles</em>, the math stops being mysterious: it is really just different forms of <em>time-varying change-of-variables</em>.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                From there, variational based, score-based, and flow-based diffusions differ less than their names suggest. They all <em>choose the same forward Gaussian snapshots</em> and then ask the network to predict <em>different but equivalent handles</em> on the reverse-time dynamics. What makes training workable in all three cases is the same move: the <em>conditional trick</em>. We replace an intractable marginal target (reverse kernel / score / velocity under <InlineMath math="p_t" />) with a tractable conditional target under <InlineMath math="p(\mathbf{x}_t\mid \mathbf{x}_0)" />, turning challenging problems into "solve a supervised regression problem".
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                But diffusion's classic payoff, high-fidelity samples, comes with a classic cost: <em>iterative sampling</em>. If we must integrate the reverse dynamics in many small steps, generation stays slow. Flow map models push the same diffusion template one step further: instead of learning <em>infinitesimal</em> updates and then integrating them, they aim to learn <em>time-jumps</em> of the PF-ODE directly. In other words, they try to approximate the map <InlineMath math="\Psi_{s\to t}" /> itself, so we can replace long chains of tiny steps with a handful of large, accurate jumps. CM, CTM, and MF are three concrete "handles" on this idea: each enforcing underlying flow-map structures to manufacture practical targets when the oracle flow map is unavailable.
              </p>

              <p className="leading-relaxed text-slate-700 dark:text-slate-300 mt-4">
                Stepping back, the big takeaway is optimistic: diffusion models are not a single method, but a <em>principle for building generators</em> from a prescribed forward path. Once we commit to "choose a forward corruption, then learn its reverse transport", there is room for many designs that trade off <em>stability</em>, <em>fidelity</em>, and <em>speed</em>. Flow maps are one promising direction, but likely not the last word. The exciting open space is to keep the same clean backbone: we define a forward transport process, and change-of-variables tells us how the distribution moves. Then we look for new <em>parameterizations</em> and <em>objectives</em>, which make <em>fast generation</em> as reliable as the best step-by-step samplers.
              </p>
            </section>
          </div>
        </article>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-500 transition-colors font-medium"
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
