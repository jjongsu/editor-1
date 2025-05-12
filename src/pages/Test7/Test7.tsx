import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
// import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { useEffect, useRef } from 'react';
import useControlEditor from '../../hooks/useControlEditor';
import { marks } from './check/mark';
import { customKeymap } from './check/customKeymap';

export default function Test7() {
	const editorRef = useRef<HTMLDivElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);
	const { setView, handleGetJson, handleSetClick } = useControlEditor();

	// del, mark, small, ins, sub, sup

	useEffect(() => {
		if (!editorRef.current || !contentRef.current) return;
		const mySchema = new Schema({
			// nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
			nodes: schema.spec.nodes,
			marks: {
				...marks,
				del: {
					parseDOM: [{ tag: 'del' }, { style: 'text-decoration-line: line-through;' }],
					toDOM() {
						return ['del', 0];
					},
				},
			},
		});

		console.log(schema.spec.marks, baseKeymap, exampleSetup({ schema: mySchema }));

		const _state = EditorState.create({
			doc: DOMParser.fromSchema(mySchema).parse(contentRef.current),
			plugins: [keymap(baseKeymap), ...exampleSetup({ schema: mySchema }), customKeymap(mySchema)],
		});

		const _view = new EditorView(editorRef.current, {
			state: _state,
			dispatchTransaction(tr) {
				const newState = _view.state.apply(tr);
				_view.updateState(newState);
			},
		});
		setView(_view);

		return () => {
			// 컴포넌트 언마운트 시 에디터 정리
			_view?.destroy();
			setView(null);
		};
	}, [setView]);

	return (
		<div className="p-4 h-full w-full">
			<div className="flex w-full items-center">
				<div>test-prosemirror(기본 link,em,strong,code + (custom : del, 단축키 : Mod-k))</div>
				<button className="border px-2 rounded-full" onClick={() => handleSetClick({ contentDiv: contentRef.current })}>
					editor -{'>'} DOM
				</button>
				<button className="border px-2 rounded-full" onClick={handleGetJson}>
					GET JSON
				</button>
			</div>
			<div className="p-4 bg-white border rounded-md editor" ref={editorRef}></div>
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
					To apply styling, <del>you can select a piece</del> of text and manipulate its styling from the menu. The basic schema supports{' '}
					<em>emphasis</em>, <strong>strong text</strong>, <a href="http://marijnhaverbeke.nl/blog">links</a>, <code>code font</code>, and images.
				</p>
				<img src="https://prosemirror.net/img/dino/stegosaurus.png" title="stegosaurus" />
			</div>
		</div>
	);
}
