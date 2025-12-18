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

          const indentClass =
            it.kind === 'section' ? 'pl-5' : 'pl-0'; // indent subsections like 1.1 / A.1

          return (
            <div key={it.key} className={`flex items-baseline ${indentClass}`}>
              {/* title (truncate keeps one-line so leader/page align perfectly) */}
              <span className={`min-w-0 flex-[0_1_auto] truncate ${titleClass}`} title={it.title}>
                {it.title}
              </span>

              {/* dotted leader (auto-fills remaining width, no manual dot counting) */}
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
