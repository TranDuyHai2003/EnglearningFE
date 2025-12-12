"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Heading1,
  Heading2,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Youtube.configure({ controls: true, nocookie: true }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 overflow-auto",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addYoutube = () => {
    const url = window.prompt("YouTube URL:");
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 rounded-md border p-1">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 1 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" onPressedChange={addLink} pressed={editor.isActive("link")}>
            <LinkIcon className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" onPressedChange={addImage}>
            <ImageIcon className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" onPressedChange={addYoutube}>
            <YoutubeIcon className="h-4 w-4" />
        </Toggle>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
