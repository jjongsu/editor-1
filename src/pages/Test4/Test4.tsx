import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser, Schema } from 'prosemirror-model';
import { exampleSetup } from 'prosemirror-example-setup';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { useEffect, useRef } from 'react';

export default function Test3() {
	const editorRef = useRef<HTMLDivElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!editorRef.current || !contentRef.current) return;

		const basicSchema = new Schema({
			// nodes: schema.spec.nodes,
			nodes: {
				doc: { content: 'block+' },
				paragraph: {
					group: 'block',
					content: 'text*',
					parseDOM: [{ tag: 'p' }],
					toDOM() {
						return ['p', 0];
					},
				},
				blockquote: {
					group: 'block',
					content: 'block+',
					parseDOM: [{ tag: 'blockquote' }],
					toDOM() {
						return ['blockquote', 0];
					},
				},
				text: {
					group: 'inline',
					inline: true,
				},
				heading: {
					attrs: { level: { default: 1, validate: 'number' } },
					content: 'inline*',
					group: 'block',
					defining: true,
					parseDOM: [
						{ tag: 'h1', attrs: { level: 1 } },
						{ tag: 'h2', attrs: { level: 2 } },
						{ tag: 'h3', attrs: { level: 3 } },
						{ tag: 'h4', attrs: { level: 4 } },
						{ tag: 'h5', attrs: { level: 5 } },
						{ tag: 'h6', attrs: { level: 6 } },
					],
					toDOM(node) {
						return ['h' + node.attrs.level, 0];
					},
				},
				section: {
					group: 'block',
					content: 'block+',
					attrs: { folded: { default: true } },
					parseDOM: [
						{
							tag: 'section',
							getAttrs(dom) {
								return { folded: dom.classList.contains('folded') };
							},
						},
					],
					toDOM(node) {
						const folded = node.attrs.folded ? 'folded' : '';
						return [
							'section',
							{ class: `section-node ${folded}` },
							['button', { class: 'toggle-button' }],
							['div', { class: 'content-container' }, 0],
						];
					},
				},
			},
			// marks: schema.spec.marks,
		});

		function maxSizePlugin(max: number) {
			let charCountEl: HTMLDivElement;

			return new Plugin({
				props: {
					editable(state) {
						return state.doc.content.size < max;
					},
				},
				view(editorView) {
					// 표시할 엘리먼트 생성
					charCountEl = document.createElement('div');
					charCountEl.style.cssText = 'position: absolute; bottom: 5px; right: 10px; font-size: 12px; color: gray;';
					editorView.dom.parentNode?.appendChild(charCountEl);

					// 표시
					const updateCharCount = () => {
						const size = editorView.state.doc.content.size;
						charCountEl.textContent = `${size}/${max} 글자`;
					};
					updateCharCount();

					return {
						update(view, prevState) {
							if (prevState.doc !== view.state.doc) {
								updateCharCount();
							}
						},
						destroy() {
							charCountEl.remove();
						},
					};
				},
			});
		}

		const _state = EditorState.create({
			schema: basicSchema,
			doc: DOMParser.fromSchema(basicSchema).parse(contentRef.current),
			// plugins: [keymap(baseKeymap), ...exampleSetup({ schema: basicSchema })],
			plugins: [keymap(baseKeymap), maxSizePlugin(350), ...exampleSetup({ schema: basicSchema })],
		});

		const _view = new EditorView(editorRef.current, {
			state: _state,
			dispatchTransaction(tr) {
				const newState = _view.state.apply(tr);
				_view.updateState(newState);
			},
		});

		return () => {
			// 컴포넌트 언마운트 시 에디터 정리
			_view?.destroy();
		};
	}, []);

	return (
		<div className="p-4 h-full w-full">
			<div className="flex w-full items-center">
				<div>test-prosemirror(schema)</div>
			</div>
			<div className="p-4 bg-white border rounded-md editor relative" ref={editorRef}></div>
			<div ref={contentRef}>
				<h1>Heading1</h1>
				<h2>Heading2</h2>
				<h3>Heading3</h3>
				<blockquote>
					<p>This is editable text. You can focus it and start typing.</p>
				</blockquote>
				<p>
					To apply styling, you can select a piece of text and manipulate its styling from the menu. The basic schema supports <em>emphasis</em>,{' '}
					<strong>strong text</strong>, <a href="http://marijnhaverbeke.nl/blog">links</a>, <code>code font</code>, and images.
				</p>
				{/* <img src="https://prosemirror.net/img/dino/stegosaurus.png" title="stegosaurus" /> */}
				<p>dino image test!!</p>

				<section>
					<p>toggle title</p>
					<div className="content-container">adasd</div>
				</section>
			</div>
		</div>
	);
}
