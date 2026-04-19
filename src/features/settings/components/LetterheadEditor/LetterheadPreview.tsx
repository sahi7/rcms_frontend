// src/features/settings/components/LetterheadEditor/LetterheadPreview.tsx
//
// Same shape as your original, but now honors optional per-column widths
// (percent of row). If widths aren't set, it falls back to even 3-column flex
// — identical behavior to before.
import { Letterhead } from '@/types/letterhead'
interface Props {
  letterhead: Letterhead
  // Optional widths coming from the editor. Percent values that sum to ~100.
  widths?: {
    left: number
    center: number
    right: number
  }
}
function Block({
  html,
  align,
  widthPct,
}: {
  html: string
  align: 'left' | 'center' | 'right'
  widthPct?: number
}) {
  return (
    <div
      className="text-xs text-slate-700 min-w-0 [&_p]:m-0 [&_p]:leading-snug [&_ul]:pl-4 [&_ol]:pl-4 [&_img]:inline-block"
      style={{
        textAlign: align,
        // If a width is provided, use flex-basis; otherwise fill equally.
        flex: widthPct ? `0 0 ${widthPct}%` : '1 1 0%',
        maxWidth: widthPct ? `${widthPct}%` : undefined,
      }}
      dangerouslySetInnerHTML={{
        __html: html || `<p class="text-slate-300 italic">Empty</p>`,
      }}
    />
  )
}
export function LetterheadPreview({ letterhead, widths }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Faux page */}
      <div className="bg-slate-100 p-4 sm:p-6">
        <div className="mx-auto max-w-2xl bg-white shadow-md">
          <div className="px-6 pt-6 pb-4 border-b-2 border-slate-900">
            <div className="flex items-start gap-4">
              <Block
                html={letterhead.left_html}
                align="left"
                widthPct={widths?.left}
              />
              <Block
                html={letterhead.center_html}
                align="center"
                widthPct={widths?.center}
              />
              <Block
                html={letterhead.right_html}
                align="right"
                widthPct={widths?.right}
              />
            </div>
          </div>
          <div className="px-6 py-8 space-y-2">
            <div className="h-2 w-40 bg-slate-200 rounded" />
            <div className="h-2 w-full bg-slate-100 rounded" />
            <div className="h-2 w-5/6 bg-slate-100 rounded" />
            <div className="h-2 w-4/6 bg-slate-100 rounded" />
            <p className="text-[10px] text-slate-400 pt-4">
              Preview — this is how the letterhead will appear at the top of
              generated PDFs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
