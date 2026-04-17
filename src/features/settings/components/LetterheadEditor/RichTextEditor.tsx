import React, { useEffect, useCallback } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  ListIcon,
  ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useFileUpload } from '@/hooks/shared/useFileUpload' // ← adjust path if needed

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  align?: 'left' | 'center' | 'right'
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
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? 'bg-orange-100 text-orange-600'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

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
  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50/50">
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

      <ToolbarButton
        label="Align left"
        active={editor.isActive({ textAlign: 'left' })}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <AlignLeftIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Align center"
        active={editor.isActive({ textAlign: 'center' })}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <AlignCenterIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Align right"
        active={editor.isActive({ textAlign: 'right' })}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <AlignRightIcon className="w-3.5 h-3.5" />
      </ToolbarButton>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      <ToolbarButton
        label="Bullet list"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <ListIcon className="w-3.5 h-3.5" />
      </ToolbarButton>

      <div className="w-px h-4 bg-slate-200 mx-1" />

      <ToolbarButton
        label="Insert logo / image"
        active={false}
        onClick={onImageUpload}
        disabled={isUploading}
      >
        <ImageIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
    </div>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  align = 'left',
}: RichTextEditorProps) {
  const { upload, isUploading } = useFileUpload()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[120px] px-3 py-2 focus:outline-none text-slate-800',
        'data-placeholder': placeholder || '',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
    onCreate: ({ editor }) => {
      if (align) {
        editor.commands.setTextAlign(align)
      }
    },
  })

  // Sync external value changes (e.g. after save or data fetch)
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
        editor.chain().focus().setImage({ src: publicUrl, alt: 'Logo' }).run()
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