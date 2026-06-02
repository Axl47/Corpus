import { Node, mergeAttributes } from '@tiptap/core';

// Inline page link rendered as a single atomic unit: the label text cannot be
// edited character-by-character, and a single Backspace removes the whole link.
// Serializes to inline HTML (<a data-page-link>) so it round-trips through
// @tiptap/markdown's inline-HTML token handling (same mechanism as ChildBlock),
// re-parsing back into this node rather than a plain link mark.
export const PageLink = Node.create({
  name: 'pageLink',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      href: { default: '#' },
      label: { default: '' },
      itemType: { default: 'page' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-page-link]',
        priority: 1100,
        getAttrs(el) {
          const e = el as HTMLElement;
          return {
            href: e.getAttribute('href') || '#',
            label: e.textContent || '',
            itemType: e.getAttribute('data-type') || 'page',
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        href: node.attrs.href,
        'data-page-link': '',
        'data-type': node.attrs.itemType,
      }),
      node.attrs.label || node.attrs.href,
    ];
  },

  // @tiptap/markdown v3 serializer — read via getExtensionField(ext, "renderMarkdown")
  // @ts-ignore — renderMarkdown is a @tiptap/markdown extension field, not in Tiptap core types
  renderMarkdown(node: any) {
    const { href, label, itemType } = node.attrs;
    const esc = (s: string) =>
      (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const escAttr = (s: string) => esc(s).replace(/"/g, '&quot;');
    return `<a data-page-link href="${escAttr(href)}" data-type="${escAttr(itemType || 'page')}">${esc(label || href)}</a>`;
  },
});
