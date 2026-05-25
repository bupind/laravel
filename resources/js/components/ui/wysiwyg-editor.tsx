import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Italic, UnderlineIcon, Strikethrough,
    List, ListOrdered, Quote, Minus, Undo, Redo,
    Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Heading1, Heading2, Heading3, Code, RemoveFormatting,
} from 'lucide-react';
import React, { useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface WysiwygEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    minHeight?: number;
}

interface ToolbarButtonProps {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            title={title}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded transition-colors',
                'hover:bg-muted text-muted-foreground hover:text-foreground',
                active && 'bg-muted text-foreground',
                disabled && 'cursor-not-allowed opacity-40',
            )}
        >
            {children}
        </button>
    );
}

function ToolbarDivider() {
    return <div className="bg-border mx-0.5 h-5 w-px shrink-0" />;
}

export default function WysiwygEditor({
    value,
    onChange,
    placeholder = 'Tulis konten di sini...',
    disabled = false,
    className,
    minHeight = 200,
}: WysiwygEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: { keepMarks: true },
                orderedList: { keepMarks: true },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-primary underline underline-offset-2 cursor-pointer' },
            }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder }),
        ],
        content: value,
        editable: !disabled,
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    // Sync external value changes (e.g. form reset)
    useEffect(() => {
        if (!editor) return;
        const current = editor.getHTML();
        if (current !== value) {
            editor.commands.setContent(value ?? '', false);
        }
    }, [value]);

    // Sync disabled state
    useEffect(() => {
        editor?.setEditable(!disabled);
    }, [disabled, editor]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const prev = editor.getAttributes('link').href ?? '';
        const url = window.prompt('URL:', prev);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    if (!editor) return null;

    return (
        <div
            className={cn(
                'border-input bg-background rounded-md border text-sm shadow-xs transition-colors',
                disabled && 'opacity-60',
                className,
            )}
        >
            {/* ── Toolbar ── */}
            <div className="border-border flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
                {/* History */}
                <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                    <Undo className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                    <Redo className="size-3.5" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Headings */}
                <ToolbarButton title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                    <Heading1 className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                    <Heading2 className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                    <Heading3 className="size-3.5" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Marks */}
                <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
                    <Bold className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <Italic className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
                    <UnderlineIcon className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
                    <Strikethrough className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton title="Inline Code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
                    <Code className="size-3.5" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Alignment */}
                <ToolbarButton title="Align Left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
                    <AlignLeft className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton title="Align Center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
                    <AlignCenter className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton title="Align Right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
                    <AlignRight className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton title="Justify" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
                    <AlignJustify className="size-3.5" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Lists & blocks */}
                <ToolbarButton title="Bullet List" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                    <List className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton title="Ordered List" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                    <ListOrdered className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                    <Quote className="size-3.5" />
                </ToolbarButton>
                <ToolbarButton title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                    <Minus className="size-3.5" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Link */}
                <ToolbarButton title="Link" active={editor.isActive('link')} onClick={setLink}>
                    <LinkIcon className="size-3.5" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Clear formatting */}
                <ToolbarButton title="Clear Formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
                    <RemoveFormatting className="size-3.5" />
                </ToolbarButton>
            </div>

            {/* ── Editor area ── */}
            <EditorContent
                editor={editor}
                className={cn(
                    'wysiwyg-content px-3 py-2 focus-within:outline-none',
                    '[&_.tiptap]:outline-none',
                    '[&_.tiptap]:min-h-[var(--editor-min-h)]',
                    '[&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground',
                    '[&_.tiptap_p.is-editor-empty:first-child::before]:float-left',
                    '[&_.tiptap_p.is-editor-empty:first-child::before]:h-0',
                    '[&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none',
                    '[&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
                    // Prose styling
                    '[&_.tiptap_h1]:text-2xl [&_.tiptap_h1]:font-bold [&_.tiptap_h1]:mb-3',
                    '[&_.tiptap_h2]:text-xl [&_.tiptap_h2]:font-semibold [&_.tiptap_h2]:mb-2',
                    '[&_.tiptap_h3]:text-lg [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:mb-2',
                    '[&_.tiptap_p]:mb-2 [&_.tiptap_p]:leading-relaxed',
                    '[&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ul]:mb-2',
                    '[&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5 [&_.tiptap_ol]:mb-2',
                    '[&_.tiptap_li]:mb-0.5',
                    '[&_.tiptap_blockquote]:border-l-4 [&_.tiptap_blockquote]:border-border [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:italic [&_.tiptap_blockquote]:text-muted-foreground [&_.tiptap_blockquote]:my-2',
                    '[&_.tiptap_hr]:border-border [&_.tiptap_hr]:my-3',
                    '[&_.tiptap_code]:bg-muted [&_.tiptap_code]:rounded [&_.tiptap_code]:px-1 [&_.tiptap_code]:font-mono [&_.tiptap_code]:text-xs',
                    '[&_.tiptap_pre]:bg-muted [&_.tiptap_pre]:rounded-md [&_.tiptap_pre]:p-3 [&_.tiptap_pre]:font-mono [&_.tiptap_pre]:text-xs [&_.tiptap_pre]:overflow-x-auto',
                    '[&_.tiptap_a]:text-primary [&_.tiptap_a]:underline [&_.tiptap_a]:underline-offset-2',
                )}
                style={{ '--editor-min-h': `${minHeight}px` } as React.CSSProperties}
            />
        </div>
    );
}
