import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser, Fragment, Schema, Slice } from 'prosemirror-model';
import { exampleSetup } from 'prosemirror-example-setup';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { schema } from 'prosemirror-schema-basic';
import { useCallback, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import useControlEditor from '../../hooks/useControlEditor';

export default function Test10() {
	const editorRef = useRef<HTMLDivElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);
	const { setView, view } = useControlEditor();

	const handleClick = useCallback(() => {
		if (!view?.state.doc) return;

		const { to, from } = view.state.selection;

		const paragraph1Node = view.state.schema.nodes.paragraph.create({}, view.state.schema.text('handleClick1!'));
		const paragraph2Node = view.state.schema.nodes.paragraph.create({}, view.state.schema.text('handleClick2!'));

		const fragment = Fragment.fromArray([paragraph1Node, paragraph2Node]);
		// const fragment = Fragment.from([paragraph1Node, paragraph2Node]);

		const slice = new Slice(fragment, 0, 0);

		// const tr = view.state.tr.insert(view.state.selection.from, fragment);
		const tr = view.state.tr.replace(from, to, slice);
		console.log('🚀 handleClick ~ tr');

		// const tr = view.state.tr.replaceRange(from, to, slice);
		// const tr = view.state.tr.replaceSelection(slice);
		// const tr = view.state.tr.replaceRangeWith(from, to, paragraph1Node);
		// const tr = view.state.tr.replaceSelectionWith(paragraph1Node);

		// view.dispatch(tr);
		const _state = view.state.apply(tr);
		view.updateState(_state);
	}, [view]);

	useEffect(() => {
		if (!editorRef.current || !contentRef.current) return;

		const basicSchema = new Schema({
			nodes: schema.spec.nodes,
			marks: schema.spec.marks,
		});
		const customKey = { pluginA: new PluginKey('pluginA'), pluginB: new PluginKey('pluginB') };

		function testPluginA() {
			return new Plugin({
				key: customKey.pluginA,
				state: {
					init() {
						return { alreadyApplied: false };
					},
					apply(tr, value) {
						console.log('🚀 pluginA ~ apply ~ tr:', tr, value);
						const pluginMeta = tr.getMeta(customKey.pluginA);
						if (pluginMeta && pluginMeta.alreadyApplied) {
							return { alreadyApplied: true };
						}
						return value;
					},
				},
				// filterTransaction(tr, state) {
				// 	if (tr.docChanged) return true;
				// 	return false;
				// },
				appendTransaction(transactions, oldState, newState) {
					console.log('On pluginA');
					const pluginState = this.getState(newState);
					if (pluginState.alreadyApplied) return null;
					const shouldRun = transactions.some((tr) => !tr.getMeta(this?.key || 'pluginA'));
					if (!shouldRun) return null;

					console.log('🚀 plugin ~ appendTransaction : A', pluginState.alreadyApplied, transactions);

					const { from, to } = newState.selection;
					const paragraph1Node = newState.schema.nodes.paragraph.create({}, newState.schema.text('Hello, worldA1!'));
					const paragraph2Node = newState.schema.nodes.paragraph.create({}, newState.schema.text('Hello, worldA2!'));

					const fragment = Fragment.fromArray([paragraph1Node, paragraph2Node]);

					const slice = new Slice(fragment, 0, 0);

					const tr = newState.tr.replace(from, to, slice);
					console.log('pluginA - setMeta - before');
					if (this.key) tr.setMeta(this.key, { alreadyApplied: true });
					console.log('pluginA - setMeta - after');
					return tr;
				},
			});
		}
		function testPluginB() {
			return new Plugin({
				key: customKey.pluginB,
				state: {
					init() {
						return { alreadyApplied: false };
					},
					apply(tr, value) {
						console.log('🚀 pluginB ~ apply ~ tr:', tr, value);
						const pluginMeta = tr.getMeta(customKey.pluginB);
						if (pluginMeta && pluginMeta.alreadyApplied) {
							return { alreadyApplied: true };
						}
						return value;
					},
				},
				// filterTransaction(tr, state) {
				// 	if (tr.docChanged) return true;
				// 	return false;
				// },
				appendTransaction(transactions, oldState, newState) {
					console.log('On pluginB');
					const pluginState = this.getState(newState);
					if (pluginState.alreadyApplied) return null;
					const shouldRun = transactions.some((tr) => !tr.getMeta(this?.key || 'pluginB'));
					if (!shouldRun) return null;

					console.log('🚀 plugin ~ appendTransaction : B', pluginState.alreadyApplied, transactions);

					const { from, to } = newState.selection;
					const paragraph1Node = newState.schema.nodes.paragraph.create({}, newState.schema.text('Hello, worldB1!'));
					const paragraph2Node = newState.schema.nodes.paragraph.create({}, newState.schema.text('Hello, worldB2!'));

					const fragment = Fragment.fromArray([paragraph1Node, paragraph2Node]);

					const slice = new Slice(fragment, 0, 0);

					const tr = newState.tr.replace(from, to, slice);
					console.log('pluginB - setMeta - before');
					if (this.key) tr.setMeta(this.key, { alreadyApplied: true });
					console.log('pluginB - setMeta - after');
					return tr;
				},
			});
		}

		const _state = EditorState.create({
			schema: basicSchema,
			doc: DOMParser.fromSchema(basicSchema).parse(contentRef.current),
			plugins: [testPluginA(), testPluginB(), keymap(baseKeymap), ...exampleSetup({ schema: basicSchema })],
			// plugins: [testPluginB(), keymap(baseKeymap), ...exampleSetup({ schema: basicSchema })],
		});

		const _view = new EditorView(editorRef.current, {
			state: _state,
			dispatchTransaction(tr) {
				console.log('🚀 dispatchTransaction ~ before tr', tr);

				const newState = _view.state.apply(tr);
				console.log('🚀 dispatchTransaction ~ after tr', _view.state.tr);
				// newState.plugins.forEach((plugin) => {
				// 	const pluginState = plugin.getState(newState);
				// 	if (pluginState?.alreadyApplied) {
				// 		newState.tr.setMeta(plugin, { alreadyApplied: false });
				// 	}
				// });

				_view.updateState(newState);
			},
			// decorations(state) {
			// 	console.log('🚀 EditorView ~ decorations');
			// 	const decorations = [];
			// 	const { from, empty } = state.selection;

			// 	// 커서 위치에 위젯 삽입
			// 	if (empty) {
			// 		const cursorWidget = Decoration.widget(from, () => {
			// 			const span = document.createElement('span');
			// 			span.textContent = '📍';
			// 			span.className = 'cursor-widget';
			// 			return span;
			// 		});
			// 		decorations.push(cursorWidget);
			// 	}

			// 	return DecorationSet.create(state.doc, decorations);
			// },
		});

		setView(_view);

		return () => {
			console.log('언마운트됨!!!');
			// 컴포넌트 언마운트 시 에디터 정리
			_view?.destroy();
		};
	}, [setView]);

	return (
		<div className="p-4 h-full w-full">
			<div className="flex w-full items-center">
				<div>test-prosemirror(plugin 연습)</div>
				<button className="border px-2 rounded-full" onClick={handleClick}>
					tr handle
				</button>
			</div>
			<div className={clsx('p-4 bg-white border rounded-md editor relative')} ref={editorRef}></div>
			<div ref={contentRef}>
				<p>dino image test!!</p>
				<h1>Heading1</h1>
				<h2>Heading2</h2>
				<h3>Heading3</h3>
				<blockquote>
					<p>This is editable text. You can focus it and start typing.</p>
				</blockquote>
				<p>
					TODO styling, you can select a piece of text and manipulate its styling from the menu. The basic schema supports <em>emphasis</em>,{' '}
					<strong>strong text</strong>, <a href="http://marijnhaverbeke.nl/blog">links</a>, <code>code font</code>, and images.
				</p>
			</div>
		</div>
	);
}
