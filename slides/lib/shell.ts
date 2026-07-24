// Render terminal lines into the inner HTML of a `.dc-shell` panel: HTML-escape
// each line, then map `{badge}…{/badge}` / `{mark}…{/mark}` to accent spans and
// join with newlines (the panel's `white-space: pre` keeps the line breaks).
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function renderShell(lines: string[]): string {
  return lines
    .map(l =>
      esc(l)
        .replace(/\{badge\}([\s\S]*?)\{\/badge\}/g, '<span class="badge">$1</span>')
        .replace(/\{mark\}([\s\S]*?)\{\/mark\}/g, '<span class="mark">$1</span>'),
    )
    .join('\n')
}
