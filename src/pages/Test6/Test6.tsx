import { EditorState } from 'prosemirror-state';
// import { EditorView, DecorationSet, Decoration } from 'prosemirror-view';
import { EditorView } from 'prosemirror-view';
import { DOMParser, Schema } from 'prosemirror-model';
import { exampleSetup } from 'prosemirror-example-setup';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { schema } from 'prosemirror-schema-basic';
import { customKeymap } from './check/customKey';

export default function Test6() {
	const editorRef = useRef<HTMLDivElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!editorRef.current || !contentRef.current) return;

		const basicSchema = new Schema({
			nodes: {
				doc: { content: 'block+' },
				paragraph: {
					content: 'inline*',
					group: 'block',
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
				},
				hard_break: {
					group: 'inline',
					inline: true,
					parseDOM: [{ tag: 'br' }],
					selectable: false,
					toDOM() {
						return ['br', { class: 'ProseMirror-trailingBreak' }];
					},
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
				image: {
					inline: true,
					attrs: {
						src: { validate: 'string' },
						alt: { default: null, validate: 'string|null' },
						title: { default: null, validate: 'string|null' },
					},
					group: 'inline',
					draggable: true,
					parseDOM: [
						{
							tag: 'img[src]',
							getAttrs(dom) {
								return {
									src: dom.getAttribute('src'),
									title: dom.getAttribute('title'),
									alt: dom.getAttribute('alt'),
								};
							},
						},
					],
					toDOM(node) {
						const { src = '', alt = '', title = '' } = node.attrs;
						return ['img', { src, alt, title }];
					},
				},
				horizontal_rule: {
					group: 'block',
					parseDOM: [{ tag: 'hr' }],
					toDOM() {
						return ['hr'];
					},
				},
				taskList: {
					group: 'block',
					content: 'taskItem+',
					parseDOM: [{ tag: 'ul[data-type="taskList"]' }],
					toDOM() {
						return ['ul', { 'data-type': 'taskList' }, 0];
					},
				},
				taskItem: {
					// content: 'paragraph block*',
					content: 'paragraph+',
					// "paragraph block*" : "paragraph+"
					defining: true,
					attrs: {
						checked: { default: false },
					},
					parseDOM: [
						{
							tag: 'li',
							getAttrs(dom) {
								// li element에서 data-checked를 확인
								const liChecked = dom.getAttribute('data-checked');
								if (liChecked) {
									return { checked: liChecked === 'true' };
								}
								// li element에서 확인이 불가한 경우 input checkbox에서 확인
								const input = dom.querySelector('input[type=checkbox]') as HTMLInputElement | null;
								return { checked: input?.checked || false };
							},
						},
					],
					toDOM(node) {
						return [
							'li',
							{ 'data-checked': node.attrs.checked ? 'true' : 'false' },
							['label', ['input', { type: 'checkbox', checked: node.attrs.checked ? 'checked' : null }], ['span']],
							['div', node.attrs.checked ? { class: 'line-through opacity-50' } : {}, 0],
						];
					},
				},
			},
			marks: schema.spec.marks,
		});

		const _state = EditorState.create({
			schema: basicSchema,
			doc: DOMParser.fromSchema(basicSchema).parse(contentRef.current),
			plugins: [customKeymap, keymap(baseKeymap), ...exampleSetup({ schema: basicSchema })],
		});

		const _view = new EditorView(editorRef.current, {
			state: _state,
			dispatchTransaction(tr) {
				const newState = _view.state.apply(tr);
				_view.updateState(newState);
			},
			// decorations(state) {
			// 	const decorations = [];
			// 	const { from, empty } = state.selection;

			// 	// 1. 커서 위치에 위젯 삽입
			// 	if (empty) {
			// 		const cursorWidget = Decoration.widget(from, () => {
			// 			const span = document.createElement('span');
			// 			span.textContent = '📍';
			// 			span.className = 'cursor-widget';
			// 			return span;
			// 		});
			// 		decorations.push(cursorWidget);
			// 	}

			// 	// 2. 문서 내 "TODO" 텍스트 하이라이팅
			// 	const regex = /\bTODO\b/g;
			// 	state.doc.descendants((node, pos) => {
			// 		if (node.isText) {
			// 			let match;
			// 			while ((match = regex.exec(node.text || '')) !== null) {
			// 				const start = pos + match.index;
			// 				const end = start + match[0].length;
			// 				decorations.push(Decoration.inline(start, end, { class: 'todo-highlight' }));
			// 			}
			// 		}
			// 	});

			// 	return DecorationSet.create(state.doc, decorations);
			// },
		});

		return () => {
			// 컴포넌트 언마운트 시 에디터 정리
			_view?.destroy();
		};
	}, []);

	return (
		<div className="p-4 h-full w-full">
			<div className="flex w-full items-center">
				<div>test-prosemirror(taskList)</div>
			</div>
			<div className={clsx('p-4 bg-white border rounded-md editor relative')} ref={editorRef}></div>
			<div ref={contentRef} className="custom-editor">
				<h1>Heading1</h1>
				<h2>Heading2</h2>
				<h3>Heading3</h3>
				<blockquote>
					<p>This is editable text. You can focus it and start typing.</p>
				</blockquote>

				<ul data-type="taskList">
					<li>
						<label>
							<input type="checkbox" />
							<span></span>
						</label>
						<div>
							<p>체크리스트1 false</p>
						</div>
					</li>
					<li>
						<label>
							<input type="checkbox" defaultChecked={true} />
							<span></span>
						</label>
						<div>
							<p>
								체크리스트2 true
								<br />
								체크리스트2 content
							</p>
						</div>
					</li>
					<li>
						<label>
							<input type="checkbox" />
							<span></span>
						</label>
						<div>
							<p>체크리스트3</p>
						</div>
					</li>
					<li>
						<label>
							<input type="checkbox" />
							<span></span>
						</label>
						<div>
							<p></p>
						</div>
					</li>
				</ul>

				<p>
					To apply styling, you can select a piece of text and manipulate its styling from the menu. The basic schema supports <em>emphasis</em>,{' '}
					<strong>strong text</strong>, <a href="http://marijnhaverbeke.nl/blog">links</a>, <code>code font</code>, and images.
				</p>
				<img src="https://prosemirror.net/img/dino/stegosaurus.png" title="stegosaurus" />
			</div>
		</div>
	);
}
