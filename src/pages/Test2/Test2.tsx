import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser, DOMSerializer, NodeSpec } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { exampleSetup } from 'prosemirror-example-setup';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { useEffect, useRef } from 'react';
import { MenuItem } from 'prosemirror-menu';
import { buildMenuItems } from 'prosemirror-example-setup';

const dinos = ['brontosaurus', 'stegosaurus', 'triceratops', 'tyrannosaurus', 'pterodactyl'];

export default function Test2() {
	const editorRef = useRef<HTMLDivElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!editorRef.current || !contentRef.current) return;
		const dinoNodeSpec: NodeSpec = {
			attrs: { type: { default: 'brontosaurus' } },
			inline: true,
			group: 'inline',
			draggable: true,
			toDOM: (node) => [
				'img',
				{
					'dino-type': node.attrs.type,
					src: 'https://prosemirror.net/img/dino/' + node.attrs.type + '.png',
					title: node.attrs.type,
					class: 'dinosaur',
				},
			],
			parseDOM: [
				{
					tag: 'img[dino-type]',
					getAttrs: (dom) => {
						const type = dom.getAttribute('dino-type');
						return dinos.indexOf(type || '') > -1 ? { type } : false;
					},
				},
			],
		};
		const dinoSchema = new Schema({
			nodes: schema.spec.nodes.addBefore('image', 'dino', dinoNodeSpec),
			marks: schema.spec.marks,
		});

		const dinoType = dinoSchema.nodes.dino;

		function insertDino(type: string) {
			return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
				const { $from } = state.selection;
				const index = $from.index();
				if (!$from.parent.canReplaceWith(index, index, dinoType)) return false;
				if (dispatch) dispatch(state.tr.replaceSelectionWith(dinoType.create({ type })));
				return true;
			};
		}

		// Ask example-setup to build its basic menu
		const menu = buildMenuItems(dinoSchema);

		// Add a dino-inserting item for each type of dino
		dinos.forEach((name) => {
			menu.insertMenu.content.push(
				new MenuItem({
					title: 'Insert ' + name,
					label: name.charAt(0).toUpperCase() + name.slice(1),
					enable(state) {
						return insertDino(name)(state);
					},
					run: insertDino(name),
				})
			);
		});

		const _state = EditorState.create({
			doc: DOMParser.fromSchema(dinoSchema).parse(contentRef.current),
			plugins: [keymap(baseKeymap), ...exampleSetup({ schema: dinoSchema, menuContent: menu.fullMenu })],
		});

		const _view = new EditorView(editorRef.current, {
			state: _state,
			dispatchTransaction(tr) {
				const newState = _view.state.apply(tr);
				_view.updateState(newState);

				const serializer = DOMSerializer.fromSchema(newState.schema);
				const fragment = serializer.serializeFragment(_view.state.doc.content);

				if (contentRef.current) {
					contentRef.current.innerHTML = '';
					contentRef.current.appendChild(fragment);
				}
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
				<div>test-prosemirror(images)</div>
			</div>
			<div className="p-4 bg-white border rounded-md editor" ref={editorRef}></div>
			<div ref={contentRef}>
				<h3>Test Dino Image</h3>
				<p>This is editable text. You can focus it and start typing.</p>
				<p>
					To apply styling, you can select a piece of text and manipulate its styling from the menu. The basic schema supports <em>emphasis</em>,{' '}
					<strong>strong text</strong>, <a href="http://marijnhaverbeke.nl/blog">links</a>, <code>code font</code>, and images.
				</p>
				<img dino-type="stegosaurus" src="https://prosemirror.net/img/dino/stegosaurus.png" title="stegosaurus" className="dinosaur" />
				<p>dino image test!!</p>
			</div>
		</div>
	);
}
