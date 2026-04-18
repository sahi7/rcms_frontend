import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  createElement,
} from 'react'
// src/features/settings/components/LetterheadEditor/RichTextEditor.tsx
//
// Full-featured Tiptap editor for letterheads.
//
// ── Why this file looks different from your previous attempt ──────────────
// The official `@tiptap/extension-image` has NO `resize` option. That is why
// every { resize: { enabled, directions, ... } } config you tried did nothing
// (Tiptap silently drops unknown options). Image resizing is a Tiptap Pro
// (paid) feature in their hosted extensions.
//
// To keep this free + self-contained, we extend the official Image node with
// a custom React NodeView that renders drag handles on 4 corners and writes
// the new width/height back into the node's attributes. The HTML output is
// standard `<img width="..." height="..." style="...">` — so it renders the
// same way in your PDF pipeline.
//
// References:
// - Tiptap NodeViews:           https://tiptap.dev/docs/editor/guide/node-views/react
// - Extending Image node:       https://tiptap.dev/docs/editor/api/nodes/image
// - Custom attributes pattern:  https://tiptap.dev/docs/editor/guide/custom-extensions
// - FontSize recipe (official): https://tiptap.dev/docs/examples/advanced/custom-extensions
// ──────────────────────────────────────────────────────────────────────────

import {
  useEditor,
  EditorContent,
  Editor,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  NodeViewProps,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import Link from '@tiptap/extension-link'
import { Extension } from '@tiptap/core'
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  ListIcon,
  ListOrderedIcon,
  ImageIcon,
  LinkIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  PilcrowIcon,
  PaletteIcon,
  RemoveFormattingIcon,
  Undo2Icon,
  Redo2Icon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useFileUpload } from '@/hooks/shared/useFileUpload'
// ─────────────────────────────────────────────────────────────────────────────
// 1) FontSize mark — official Tiptap recipe on top of TextStyle.
//    https://tiptap.dev/docs/examples/advanced/custom-extensions#add-the-fontsize-extension
// ─────────────────────────────────────────────────────────────────────────────
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'] as string[],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => (el as HTMLElement).style.fontSize || null,
            renderHTML: (attrs) => {
              if (!attrs.fontSize) return {}
              return {
                style: `font-size: ${attrs.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize:
        (size) =>
        ({ chain }) =>
          chain()
            .setMark('textStyle', {
              fontSize: size,
            })
            .run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain()
            .setMark('textStyle', {
              fontSize: null,
            })
            .removeEmptyTextStyle()
            .run(),
    }
  },
})
// ─────────────────────────────────────────────────────────────────────────────
// 2) Resizable image — custom NodeView with corner drag handles.
//    The base Image extension handles parse/serialize; we only add:
//      - width/height attributes
//      - a React NodeView that renders handles and updates attrs on drag
// ─────────────────────────────────────────────────────────────────────────────
function ResizableImageView({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [dragging, setDragging] = useState(false)
  const startResize = useCallback(
    (e: React.MouseEvent, corner: 'br' | 'bl' | 'tr' | 'tl') => {
      e.preventDefault()
      e.stopPropagation()
      if (!imgRef.current) return
      const img = imgRef.current
      const startX = e.clientX
      const startW = img.offsetWidth
      const startH = img.offsetHeight
      const ratio = startH / Math.max(startW, 1)
      const xSign = corner === 'br' || corner === 'tr' ? 1 : -1
      setDragging(true)
      const onMove = (ev: MouseEvent) => {
        const dx = (ev.clientX - startX) * xSign
        const newW = Math.max(40, Math.round(startW + dx))
        const newH = Math.round(newW * ratio) // preserve aspect ratio
        updateAttributes({
          width: newW,
          height: newH,
        })
      }
      const onUp = () => {
        setDragging(false)
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [updateAttributes],
  )
  const { src, alt, title, width, height } = node.attrs as {
    src: string
    alt?: string
    title?: string
    width?: number | string | null
    height?: number | string | null
  }
  const showHandles = selected || dragging
  return (
    <NodeViewWrapper
      as="span"
      className="relative inline-block align-baseline"
      data-drag-handle
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt || ''}
        title={title || ''}
        // width/height are stored as plain numbers → also serialized to HTML
        width={width ?? undefined}
        height={height ?? undefined}
        className={`max-w-full h-auto rounded-sm ${showHandles ? 'ring-2 ring-orange-500/60' : ''}`}
        draggable={false}
      />
      {showHandles && (
        <>
          {(['tl', 'tr', 'bl', 'br'] as const).map((c) => {
            const pos =
              c === 'tl'
                ? 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize'
                : c === 'tr'
                  ? 'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize'
                  : c === 'bl'
                    ? 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize'
                    : 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize'
            return (
              <span
                key={c}
                onMouseDown={(e) => startResize(e, c)}
                className={`absolute w-3 h-3 bg-white border-2 border-orange-500 rounded-sm ${pos}`}
                aria-label={`Resize ${c}`}
              />
            )
          })}
        </>
      )}
    </NodeViewWrapper>
  )
}
const ResizableImage = Image.extend({
  name: 'image',
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => {
          const w = (el as HTMLElement).getAttribute('width')
          return w ? parseInt(w, 10) : null
        },
        renderHTML: (attrs) =>
          attrs.width
            ? {
                width: attrs.width,
              }
            : {},
      },
      height: {
        default: null,
        parseHTML: (el) => {
          const h = (el as HTMLElement).getAttribute('height')
          return h ? parseInt(h, 10) : null
        },
        renderHTML: (attrs) =>
          attrs.height
            ? {
                height: attrs.height,
              }
            : {},
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView)
  },
})
// ─────────────────────────────────────────────────────────────────────────────
// 3) Toolbar pieces
// ─────────────────────────────────────────────────────────────────────────────
interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}
function ToolbarButton({
  active,
  onClick,
  children,
  label,
  disabled = false,
}: {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`p-1.5 rounded-md transition-colors ${active ? 'bg-orange-100 text-orange-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}
const FONT_SIZES = [
  '10px',
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
  '28px',
  '32px',
  '40px',
  '48px',
]
const FONT_FAMILIES = [
  {
    label: 'Default',
    value: '',
  },
  {
    label: 'Sans',
    value: 'ui-sans-serif, system-ui, sans-serif',
  },
  {
    label: 'Serif',
    value: 'Georgia, "Times New Roman", serif',
  },
  {
    label: 'Mono',
    value: 'ui-monospace, "Geist Mono", monospace',
  },
  {
    label: 'Geist',
    value: '"Geist", sans-serif',
  },
]
function Toolbar({
  editor,
  onImageUpload,
  isUploading,
}: {
  editor: Editor | null
  onImageUpload: () => void
  isUploading: boolean
}) {
  if (!editor) return null
  const currentFontSize: string =
    (editor.getAttributes('textStyle').fontSize as string) || ''
  const currentFontFamily: string =
    (editor.getAttributes('textStyle').fontFamily as string) || ''
  const currentColor: string =
    (editor.getAttributes('textStyle').color as string) || '#1f2937'
  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL', prev || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({
        href: url,
      })
      .run()
  }
  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50/50">
      {/* Headings / paragraph */}
      <ToolbarButton
        label="Paragraph"
        active={editor.isActive('paragraph')}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <PilcrowIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 1"
        active={editor.isActive('heading', {
          level: 1,
        })}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleHeading({
              level: 1,
            })
            .run()
        }
      >
        <Heading1Icon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 2"
        active={editor.isActive('heading', {
          level: 2,
        })}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleHeading({
              level: 2,
            })
            .run()
        }
      >
        <Heading2Icon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={editor.isActive('heading', {
          level: 3,
        })}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleHeading({
              level: 3,
            })
            .run()
        }
      >
        <Heading3Icon className="w-3.5 h-3.5" />
      </ToolbarButton>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      {/* Font family */}
      <select
        aria-label="Font family"
        title="Font family"
        className="text-xs bg-transparent border border-slate-200 rounded-md px-1.5 py-1 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500/40"
        value={currentFontFamily}
        onChange={(e) => {
          const v = e.target.value
          if (v === '') editor.chain().focus().unsetFontFamily().run()
          else editor.chain().focus().setFontFamily(v).run()
        }}
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.label} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      {/* Font size */}
      <select
        aria-label="Font size"
        title="Font size"
        className="text-xs bg-transparent border border-slate-200 rounded-md px-1.5 py-1 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500/40"
        value={currentFontSize}
        onChange={(e) => {
          const v = e.target.value
          if (v === '') editor.chain().focus().unsetFontSize().run()
          else editor.chain().focus().setFontSize(v).run()
        }}
      >
        <option value="">Size</option>
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {/* Color */}
      <label
        className="flex items-center gap-1 p-1 rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer"
        title="Text color"
      >
        <PaletteIcon className="w-3.5 h-3.5" />
        <input
          type="color"
          value={currentColor}
          onChange={(e) =>
            editor.chain().focus().setColor(e.target.value).run()
          }
          className="w-4 h-4 border-0 bg-transparent cursor-pointer p-0"
        />
      </label>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      {/* Inline marks */}
      <ToolbarButton
        label="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <BoldIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <ItalicIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="w-3.5 h-3.5" />
      </ToolbarButton>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      {/* Alignment */}
      <ToolbarButton
        label="Align left"
        active={editor.isActive({
          textAlign: 'left',
        })}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <AlignLeftIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Align center"
        active={editor.isActive({
          textAlign: 'center',
        })}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <AlignCenterIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Align right"
        active={editor.isActive({
          textAlign: 'right',
        })}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <AlignRightIcon className="w-3.5 h-3.5" />
      </ToolbarButton>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      {/* Lists */}
      <ToolbarButton
        label="Bullet list"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <ListIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Ordered list"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrderedIcon className="w-3.5 h-3.5" />
      </ToolbarButton>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      {/* Link + Image */}
      <ToolbarButton
        label="Add link"
        active={editor.isActive('link')}
        onClick={setLink}
      >
        <LinkIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Insert logo / image"
        onClick={onImageUpload}
        disabled={isUploading}
      >
        <ImageIcon className="w-3.5 h-3.5" />
      </ToolbarButton>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      <ToolbarButton
        label="Clear formatting"
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
      >
        <RemoveFormattingIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo2Icon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo2Icon className="w-3.5 h-3.5" />
      </ToolbarButton>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────
// 4) Editor component
// ─────────────────────────────────────────────────────────────────────────────
export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const { upload, isUploading } = useFileUpload()
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      // TextStyle must come before FontSize / Color / FontFamily — they all
      // attach attributes to the textStyle mark.
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-orange-600 underline',
        },
      }),
      ResizableImage.configure({
        inline: true,
        allowBase64: false,
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[160px] px-3 py-3 focus:outline-none text-slate-800',
        'data-placeholder': placeholder || '',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
  })
  // Sync external value changes (unchanged from your original)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const next = value || ''
    if (current !== next && !(current === '<p></p>' && next === '')) {
      editor.commands.setContent(next, false)
    }
  }, [value, editor])
  const handleImageUpload = useCallback(async () => {
    if (!editor) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const { publicUrl } = await upload(file, 'letterhead')
        // Insert image with a sensible default width; NodeView handles resize.
        editor
          .chain()
          .focus()
          .setImage({
            src: publicUrl,
            alt: 'Logo',
          })
          // updateAttributes on the just-inserted node via command
          .updateAttributes('image', {
            width: 160,
          })
          .run()
      } catch (err: any) {
        toast.error(err.message || 'Failed to upload image')
      }
    }
    input.click()
  }, [upload, editor])
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition">
      <Toolbar
        editor={editor}
        onImageUpload={handleImageUpload}
        isUploading={isUploading}
      />
      <EditorContent editor={editor} />
    </div>
  )
}
