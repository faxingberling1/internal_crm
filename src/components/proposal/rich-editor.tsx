"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Quote,
    Undo,
    Redo,
    ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichEditor({ content, onChange, placeholder, className }: RichEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg',
                },
            }),
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = window.prompt('Enter image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <div className={cn('border border-zinc-200 rounded-2xl overflow-hidden bg-white', className)}>
            {/* Toolbar */}
            <div className="flex items-center space-x-1 p-2 border-b border-zinc-100 bg-zinc-50">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn(
                        'p-2 rounded-lg hover:bg-white transition-colors',
                        editor.isActive('bold') ? 'bg-purple-100 text-purple-600' : 'text-zinc-600'
                    )}
                    type="button"
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn(
                        'p-2 rounded-lg hover:bg-white transition-colors',
                        editor.isActive('italic') ? 'bg-purple-100 text-purple-600' : 'text-zinc-600'
                    )}
                    type="button"
                >
                    <Italic className="h-4 w-4" />
                </button>

                <div className="w-px h-6 bg-zinc-200 mx-1" />

                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={cn(
                        'p-2 rounded-lg hover:bg-white transition-colors',
                        editor.isActive('heading', { level: 1 }) ? 'bg-purple-100 text-purple-600' : 'text-zinc-600'
                    )}
                    type="button"
                >
                    <Heading1 className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn(
                        'p-2 rounded-lg hover:bg-white transition-colors',
                        editor.isActive('heading', { level: 2 }) ? 'bg-purple-100 text-purple-600' : 'text-zinc-600'
                    )}
                    type="button"
                >
                    <Heading2 className="h-4 w-4" />
                </button>

                <div className="w-px h-6 bg-zinc-200 mx-1" />

                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn(
                        'p-2 rounded-lg hover:bg-white transition-colors',
                        editor.isActive('bulletList') ? 'bg-purple-100 text-purple-600' : 'text-zinc-600'
                    )}
                    type="button"
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn(
                        'p-2 rounded-lg hover:bg-white transition-colors',
                        editor.isActive('orderedList') ? 'bg-purple-100 text-purple-600' : 'text-zinc-600'
                    )}
                    type="button"
                >
                    <ListOrdered className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={cn(
                        'p-2 rounded-lg hover:bg-white transition-colors',
                        editor.isActive('blockquote') ? 'bg-purple-100 text-purple-600' : 'text-zinc-600'
                    )}
                    type="button"
                >
                    <Quote className="h-4 w-4" />
                </button>

                <div className="w-px h-6 bg-zinc-200 mx-1" />

                <button
                    onClick={addImage}
                    className="p-2 rounded-lg hover:bg-white transition-colors text-zinc-600"
                    type="button"
                >
                    <ImageIcon className="h-4 w-4" />
                </button>

                <div className="flex-1" />

                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-2 rounded-lg hover:bg-white transition-colors text-zinc-600 disabled:opacity-30"
                    type="button"
                >
                    <Undo className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-2 rounded-lg hover:bg-white transition-colors text-zinc-600 disabled:opacity-30"
                    type="button"
                >
                    <Redo className="h-4 w-4" />
                </button>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} />
        </div>
    );
}
