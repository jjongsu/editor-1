import { useRef, useEffect } from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { schema as baseSchema } from 'prosemirror-schema-basic';
import { undo, redo, history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { DOMParser } from 'prosemirror-model';

export default function Editor() {
	const editorRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!editorRef.current) return;

		// EditorState 생성
		const state = EditorState.create({
			schema: baseSchema,
			doc: DOMParser.fromSchema(baseSchema).parse(editorRef.current),
			plugins: [history(), keymap({ 'Mod-z': undo, 'Shift-Mod-z': redo }), keymap(baseKeymap)],
		});

		// EditorView 생성
		const view = new EditorView(editorRef.current, {
			state,
			dispatchTransaction(transaction) {
				console.log('Document size went from', transaction.before.content.size, 'to', transaction.doc.content.size);
				const newState = view.state.apply(transaction);
				view.updateState(newState);
			},
			handleDoubleClick(view, pos, event) {
				console.log(view, pos, event);
			},
			// editable(state) {
			// 	return state.doc.content.size < 10;
			// },
		});

		return () => {
			console.log('unmount!!');
			// 컴포넌트 언마운트 시 에디터 정리
			view.destroy();
		};
	}, []);

	return <div className="prose mx-auto p-4 bg-white shadow rounded-md" ref={editorRef}></div>;
}
