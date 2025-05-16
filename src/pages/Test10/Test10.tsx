import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser, Fragment, Schema, Slice } from 'prosemirror-model';
import { exampleSetup } from 'prosemirror-example-setup';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { schema } from 'prosemirror-schema-basic';
import { useCallback, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import useControlEditor from '../../hooks/useControlEditor';
import { foldPlugin } from './foldPlugin';

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
        const slice = new Slice(fragment, 0, 0);
        const tr = view.state.tr.replace(from, to, slice);
        view.dispatch(tr);
    }, [view]);

    useEffect(() => {
        if (!editorRef.current || !contentRef.current) return;

        const basicSchema = new Schema({
            nodes: schema.spec.nodes.append({
                section: {
                    content: 'sectionTitle sectionContent',
                    group: 'block',
                    attrs: { folded: { default: true } },
                    parseDOM: [
                        {
                            tag: 'section',
                            getAttrs(dom) {
                                return { folded: dom.classList.contains('folded') };
                            },
                        },
                    ],
                    // 이후 nodeView를 작성할 예정이므로 toDOM 생략 가능
                },
                sectionTitle: {
                    content: 'inline*',
                    group: 'section',
                    parseDOM: [{ tag: 'div.section-title' }],
                    toDOM() {
                        return ['div', { class: 'section-title' }, 0];
                    },
                },
                sectionContent: {
                    content: 'block+',
                    group: 'section',
                    parseDOM: [{ tag: 'div.section-content' }],
                    toDOM() {
                        return ['div', { class: 'section-content' }, 0];
                    },
                },
            }),
            // nodes: schema.spec.nodes,
            marks: schema.spec.marks,
        });

        const _state = EditorState.create({
            schema: basicSchema,
            doc: DOMParser.fromSchema(basicSchema).parse(contentRef.current),
            plugins: [foldPlugin, keymap(baseKeymap), ...exampleSetup({ schema: basicSchema })],
        });

        const _view = new EditorView(editorRef.current, {
            state: _state,
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
                <p>
                    dino image <b>test</b>!!
                </p>
                <h1>Heading1</h1>
                <h2>Heading2</h2>
                <h3>Heading3</h3>
                <section className="section-node folded">
                    <button className="toggle-button"></button>

                    <div className="content-container">
                        <div className="section-title">
                            <strong>Section</strong>
                            <em>Title</em>
                        </div>

                        <div className="section-content">
                            <p>
                                This is
                                <em>example</em>
                                <strong> editor text </strong>
                            </p>
                        </div>
                    </div>
                </section>
                <section className="section-node ">
                    <button className="toggle-button"></button>

                    <div className="content-container">
                        <div className="section-title">
                            <strong>Section</strong>
                            <em>Title</em>
                        </div>

                        <div className="section-content">
                            <p>
                                This is
                                <em>example</em>
                                <strong> editor text </strong>
                            </p>
                        </div>
                    </div>
                </section>
                <img src="https://prosemirror.net/img/dino/stegosaurus.png" title="stegosaurus" />
                <p>
                    TODO styling, <del>you can select</del> a piece of text and manipulate its styling from the menu. The basic schema supports{' '}
                    <em>emphasis</em>, <strong>strong text</strong>, <a href="http://marijnhaverbeke.nl/blog">links</a>, <code>code font</code>, and images.
                </p>
            </div>
        </div>
    );
}
