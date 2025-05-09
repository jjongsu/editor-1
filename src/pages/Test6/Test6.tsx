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

export default function Test6() {
	const editorRef = useRef<HTMLDivElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!editorRef.current || !contentRef.current) return;

		const basicSchema = new Schema({
			nodes: schema.spec.nodes,
			marks: schema.spec.marks,
		});

		console.log(basicSchema);

		const _state = EditorState.create({
			schema: basicSchema,
			doc: DOMParser.fromSchema(basicSchema).parse(contentRef.current),
			plugins: [keymap(baseKeymap), ...exampleSetup({ schema: basicSchema })],
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
				<div>test-prosemirror(checkbox)</div>
			</div>
			<div className={clsx('p-4 bg-white border rounded-md editor relative')} ref={editorRef}></div>
			<div ref={contentRef}>
				<h1>Heading1</h1>
				<h2>Heading2</h2>
				<h3>Heading3</h3>
				<blockquote>
					<p>This is editable text. You can focus it and start typing.</p>
					<div className="check-node flex items-center">
						<input type="checkbox" defaultChecked={false} className="check-input-node mx-1"></input>
						<p className="check-text-node">This is editable text. You can focus it and start typing.</p>
					</div>
				</blockquote>
				<div className="check-node flex items-center">
					<input type="checkbox" defaultChecked={false} className="check-input-node mx-1"></input>
					<p className="check-text-node">This is editable text. You can focus it and start typing.</p>
				</div>
				<p>
					To apply styling, you can select a piece of text and manipulate its styling from the menu. The basic schema supports <em>emphasis</em>,{' '}
					<strong>strong text</strong>, <a href="http://marijnhaverbeke.nl/blog">links</a>, <code>code font</code>, and images.
				</p>
				<img src="https://prosemirror.net/img/dino/stegosaurus.png" title="stegosaurus" />
				<p>dino image test!!</p>

				<section>
					<p>toggle title</p>
					<div className="content-container">adasd</div>
				</section>
			</div>
		</div>
	);
}
