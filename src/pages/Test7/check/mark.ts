import { MarkSpec } from 'prosemirror-model';

export const marks: { [key: string]: MarkSpec } = {
	/// A link. Has `href` and `title` attributes. `title`
	/// defaults to the empty string. Rendered and parsed as an `<a>`
	/// element.
	link: {
		attrs: {
			href: { validate: 'string' },
			title: { default: null, validate: 'string|null' },
		},
		inclusive: false,
		parseDOM: [
			{
				tag: 'a[href]',
				getAttrs(dom: HTMLElement) {
					return { href: dom.getAttribute('href'), title: dom.getAttribute('title') };
				},
			},
		],
		toDOM(node) {
			const { href = '', title = '' } = node.attrs;
			return ['a', { href, title }, 0];
		},
	},

	/// An emphasis mark. Rendered as an `<em>` element. Has parse rules
	/// that also match `<i>` and `font-style: italic`.
	em: {
		parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }, { style: 'font-style=normal', clearMark: (m) => m.type.name == 'em' }],
		toDOM() {
			return ['em', 0];
		},
	},

	/// A strong mark. Rendered as `<strong>`, parse rules also match
	/// `<b>` and `font-weight: bold`.
	strong: {
		parseDOM: [
			{ tag: 'strong' },
			// This works around a Google Docs misbehavior where
			// pasted content will be inexplicably wrapped in `<b>`
			// tags with a font-weight normal.
			{ tag: 'b', getAttrs: (node: HTMLElement) => node.style.fontWeight != 'normal' && null },
			{ style: 'font-weight=400', clearMark: (m) => m.type.name == 'strong' },
			{ style: 'font-weight', getAttrs: (value: string) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null },
		],
		toDOM() {
			return ['strong', 0];
		},
	},

	/// Code font mark. Represented as a `<code>` element.
	code: {
		code: true,
		parseDOM: [{ tag: 'code' }],
		toDOM() {
			return ['code', 0];
		},
	},
};
