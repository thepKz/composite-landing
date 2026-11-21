import { useEffect, useReducer } from 'react';
import type { Editor } from '@tiptap/react';

/** Vẽ lại thành phần con mỗi khi trình soạn đổi, để cả trang soạn bài không phải vẽ lại theo từng phím. */
export function useEditorTick(editor: Editor | null) {
  const [, bump] = useReducer((value: number) => value + 1, 0);
  useEffect(() => {
    if (!editor) return;
    editor.on('transaction', bump);
    editor.on('focus', bump);
    editor.on('blur', bump);
    return () => { editor.off('transaction', bump); editor.off('focus', bump); editor.off('blur', bump); };
  }, [editor]);
}
