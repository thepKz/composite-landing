'use client';
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import Placeholder from '@tiptap/extension-placeholder';
import { imageAlignments, imageWidths } from '@/lib/rich-text';

/** Ảnh trong bài, hiển thị như trang công khai: có chú thích gõ ngay dưới ảnh, căn lề và bề rộng. */
function ImageView({ node, selected, updateAttributes }: NodeViewProps) {
  const { src, alt, title, align, width } = node.attrs as { src: string; alt: string; title: string; align: string; width: number };
  return <NodeViewWrapper as="figure" className="ed-figure" data-align={align || 'center'} data-selected={selected ? 'true' : 'false'} contentEditable={false}>
    <div className="ed-figure-frame" style={{ width: align === 'wide' ? undefined : `${align === 'left' ? Math.min(width || 100, 60) : width || 100}%` }} data-drag-handle>
      <img src={src} alt={alt || ''} draggable={false} />
      {!String(alt || '').trim() && <span className="ed-alt-flag">Thiếu mô tả ảnh</span>}
    </div>
    <figcaption>
      <input value={title || ''} maxLength={500} placeholder="Thêm chú thích dưới ảnh (không bắt buộc)" aria-label="Chú thích ảnh" onChange={event => updateAttributes({ title: event.target.value })} />
    </figcaption>
  </NodeViewWrapper>;
}

const ImageFigure = Image.extend({
  draggable: true,
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align') || 'center',
        renderHTML: attributes => ({ 'data-align': (imageAlignments as readonly string[]).includes(attributes.align) ? attributes.align : 'center' }),
      },
      width: {
        default: 100,
        parseHTML: element => Number(element.getAttribute('data-width')) || 100,
        renderHTML: attributes => ({ 'data-width': (imageWidths as readonly number[]).includes(Number(attributes.width)) ? attributes.width : 100 }),
      },
    };
  },
  addNodeView() { return ReactNodeViewRenderer(ImageView); },
});

const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() { return { src: { default: null }, alt: { default: '' }, title: { default: '' } }; },
  parseHTML() { return [{ tag: 'video[src]' }]; },
  renderHTML({ HTMLAttributes }) { return ['video', mergeAttributes(HTMLAttributes, { controls: true, preload: 'metadata' })]; },
});

export function buildExtensions() {
  return [
    StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } } }),
    ImageFigure.configure({ allowBase64: false }),
    TableKit.configure({ table: { resizable: false } }),
    Placeholder.configure({ placeholder: 'Bắt đầu viết, hoặc gõ dấu / để chèn tiêu đề, ảnh, bảng.' }),
    Video,
  ];
}
