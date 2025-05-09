import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser, DOMSerializer } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function Test1() {
	const editorRef = useRef<HTMLDivElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);
	const [view, setView] = useState<EditorView | null>(null);

	const handleSetClick = useCallback(() => {
		if (!view) return;
		const serializer = DOMSerializer.fromSchema(view.state.schema);
		const fragment = serializer.serializeFragment(view.state.doc.content);

		if (contentRef.current) {
			contentRef.current.innerHTML = '';
			contentRef.current.appendChild(fragment);
		}
	}, [view]);

	useEffect(() => {
		if (!editorRef.current || !contentRef.current) return;
		const mySchema = new Schema({
			nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
			marks: schema.spec.marks,
		});

		const _state = EditorState.create({
			doc: DOMParser.fromSchema(mySchema).parse(contentRef.current),
			plugins: [keymap(baseKeymap), ...exampleSetup({ schema: mySchema })],
		});

		const _view = new EditorView(editorRef.current, {
			state: _state,
			dispatchTransaction(tr) {
				const newState = _view.state.apply(tr);
				_view.updateState(newState);
			},
		});

		// const serializer = DOMSerializer.fromSchema(newState.schema);
		// const fragment = serializer.serializeFragment(_view.state.doc.content);

		// if (contentRef.current) {
		// 	contentRef.current.innerHTML = '';
		// 	contentRef.current.appendChild(fragment);
		// }
		setView(_view);

		return () => {
			// 컴포넌트 언마운트 시 에디터 정리
			_view?.destroy();
			setView(null);
		};
	}, []);

	return (
		<div className="p-4 h-full w-full">
			<div className="flex w-full items-center">
				<div>test-prosemirror</div>
				<button className="border px-2 rounded-full" onClick={handleSetClick}>
					editor -{'>'} DOM
				</button>
			</div>
			<div className="p-4 bg-white border rounded-md editor" ref={editorRef}></div>
			<div ref={contentRef}>
				<h3>Hello ProseMirror</h3>
				<p>This is editable text. You can focus it and start typing.</p>
				<p>
					To apply styling, you can select a piece of text and manipulate its styling from the menu. The basic schema supports <em>emphasis</em>,{' '}
					<strong>strong text</strong>, <a href="http://marijnhaverbeke.nl/blog">links</a>, <code>code font</code>, and images.
				</p>
				<p>
					Block-level structure can be manipulated with key bindings (try ctrl-shift-2 to create a level 2 heading, or enter in an empty textblock to
					exit the parent block), or through the menu.
				</p>
			</div>
		</div>
	);
}
