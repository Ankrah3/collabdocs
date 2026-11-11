import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Undo2,
  Redo2,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const editable = editor.isEditable;

  const buttonClass = (active: boolean) =>
    `rounded-lg p-2 transition ${
      active
        ? "bg-indigo-500/20 text-indigo-300"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    } disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent`;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-1 border-b border-slate-200 pb-4">
      <button
        type="button"
        title="Bold"
        disabled={!editable}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive("bold"))}
      >
        <Bold size={18} />
      </button>

      <button
        type="button"
        title="Italic"
        disabled={!editable}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive("italic"))}
      >
        <Italic size={18} />
      </button>

      <button
        type="button"
        title="Underline"
        disabled={!editable}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={buttonClass(editor.isActive("underline"))}
      >
        <UnderlineIcon size={18} />
      </button>

      <div className="mx-2 h-6 w-px bg-slate-200" />

      <button
        type="button"
        title="Heading 1"
        disabled={!editable}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 1 }))}
      >
        <Heading1 size={18} />
      </button>

      <button
        type="button"
        title="Heading 2"
        disabled={!editable}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive("heading", { level: 2 }))}
      >
        <Heading2 size={18} />
      </button>

      <div className="mx-2 h-6 w-px bg-slate-200" />

      <button
        type="button"
        title="Bullet list"
        disabled={!editable}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive("bulletList"))}
      >
        <List size={18} />
      </button>

      <button
        type="button"
        title="Numbered list"
        disabled={!editable}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive("orderedList"))}
      >
        <ListOrdered size={18} />
      </button>

      <div className="mx-2 h-6 w-px bg-slate-200" />

      <button
        type="button"
        title="Undo"
        disabled={!editable || !editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
        className={buttonClass(false)}
      >
        <Undo2 size={18} />
      </button>

      <button
        type="button"
        title="Redo"
        disabled={!editable || !editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
        className={buttonClass(false)}
      >
        <Redo2 size={18} />
      </button>
    </div>
  );
}
