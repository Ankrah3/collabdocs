import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";
import EditorToolbar from "./EditorToolbar";

interface DocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

export default function DocumentEditor({
  content,
  onChange,
  editable = true,
}: DocumentEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[420px] outline-none text-slate-700 text-base leading-8 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editable, editor]);

  return (
    <div>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
