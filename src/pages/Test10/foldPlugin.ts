import { PluginKey, Plugin, Selection } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { Node } from 'prosemirror-model';

const FOLD_PLUGIN_KEY = new PluginKey('foldPlugin');

// Fold Plugin 정의
export const foldPlugin = new Plugin({
    key: FOLD_PLUGIN_KEY,
    state: {
        init() {
            // state 초기화
            return DecorationSet.empty;
        },
        apply(tr, value) {
            // decoration인 기존 value를 tr에 따라 doc에 매핑
            value = value.map(tr.mapping, tr.doc);
            // setMeta로 설정한 메타데이터를 PluginKey로 가져오기
            const metaData = tr.getMeta(FOLD_PLUGIN_KEY);
            // 노드를 접으려는 경우
            if (metaData && metaData.folded) {
                const node = tr.doc.nodeAt(metaData.pos);
                if (node && node.type.name === 'section') {
                    // DecorationSet에 Decoration 추가
                    value = value.add(tr.doc, [
                        Decoration.node(
                            metaData.pos,
                            metaData.pos + node.nodeSize,
                            {},
                            { folded: true } // folded상태를 true로
                        ),
                    ]);
                }
            }
            // 노드를 펼치려는 경우
            else if (metaData) {
                // DecorationSet에서 sectionNode의 시작위치에 적용된 decoration을 모두 찾기
                const decorationsOnSectionNode = value.find(metaData.pos + 1, metaData.pos + 1);
                // DecorationSet에서 Decoration 제거
                if (decorationsOnSectionNode.length) value = value.remove(decorationsOnSectionNode);
            }
            // 변경된 state 반환 -> 이 newState로 view가 업데이트 된다
            return value;
        },
    },
    props: {
        // view에 적용할 decorationSet를 반환하는 콜백함수 -> 아래 new SectionView에 전달된 decorations에 해당
        decorations(state) {
            return this.getState(state);
        },
        //state.apply 후 반환된 newState를 통해 update할 nodeView들을 정의
        nodeViews: {
            section: (node, view, getPos, decorations) => new SectionView(node, view, getPos, decorations),
        },
    },
});

export class SectionView {
    node: Node;
    view: EditorView;
    getPos: () => number | undefined;
    folded: boolean;
    dom: HTMLElement;
    toggleButton: HTMLButtonElement;
    contentContainer: HTMLDivElement;
    sectionTitle: HTMLDivElement;
    sectionContent: HTMLDivElement;
    contentDOM: HTMLDivElement;
    constructor(node: Node, view: EditorView, getPos: () => number | undefined, decorations: readonly Decoration[]) {
        this.node = node;
        this.view = view;
        this.getPos = getPos;

        // 초기 상태 설정 -> decorations에 folded 정보가 있으면 true
        this.folded = decorations.some((d) => d.spec.folded);
        decorations.forEach((d) => console.log(d));

        // document node를 표현하는 outer DOM 생성
        this.dom = document.createElement('section');
        this.dom.className = 'section-node';
        this.dom.style.display = 'flex';
        this.dom.style.alignItems = 'start';

        // 토글 버튼 생성
        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'toggle-button';
        this.toggleButton.innerHTML = '>';

        this.toggleButton.addEventListener('mousedown', (event) => this.onClickToggleBtn(view, getPos, event));
        this.dom.appendChild(this.toggleButton);

        // 토글 제목과 내용을 감싸는 contentContainer 생성
        this.contentContainer = document.createElement('div');
        this.contentContainer.className = 'content-container';

        // 토글 제목 생성
        this.sectionTitle = document.createElement('div');
        this.sectionTitle.className = 'section-title';
        this.contentContainer.appendChild(this.sectionTitle);

        // 토글 내용 생성
        this.sectionContent = document.createElement('div');
        this.sectionContent.className = 'section-content';
        this.contentContainer.appendChild(this.sectionContent);

        this.dom.appendChild(this.contentContainer);

        // 콘텐츠 DOM으로 contentContainer 지정
        this.contentDOM = this.contentContainer;

        // 토글 상태를 초기 folded의 속성값으로 초기화
        this.updateSectionView(this.folded);
    }

    // 토글 버튼의 클릭 이벤트 핸들러
    onClickToggleBtn(view: EditorView, getPos: () => number | undefined, event: MouseEvent) {
        event.preventDefault();
        // // 접힘 상태 전환
        // const newFoldedState = !this.folded;

        // // 우선 DOM 상태 업데이트
        // this.updateSectionView(newFoldedState);

        setFoldedState(view, !this.folded, getPos());
    }

    update(node: Node, deco: readonly Decoration[]) {
        // section 노드가 아닌 경우 업데이트하지 않는다.
        if (node.type.name !== 'section') return false;

        // 현재 노드가 접힌(folded) 상태인지 확인 (decoration에서 folded 값을 검사)
        const folded = deco.some((d) => d.spec.folded);
        // 접힘 상태가 이전 상태와 다르다면 접힘 상태(folded) 업데이트
        if (folded !== this.folded) this.updateSectionView(folded);

        return true;
    }

    /** schema를 통해 toDOM한 이후에 다시 element 재정의 */
    private _updateElement() {
        const _sectionContent = this.contentContainer.querySelector<HTMLDivElement>('.section-content');
        const _sectionTitle = this.contentContainer.querySelector<HTMLDivElement>('.section-title');
        if (_sectionContent) this.sectionContent = _sectionContent;
        if (_sectionTitle) this.sectionTitle = _sectionTitle;
    }

    // sectionView를 업데이트
    updateSectionView(folded: boolean) {
        this.folded = folded;
        this._updateElement();

        console.log(this.sectionContent);

        // folded 상태에 따라 클래스명 추가/제거, 토글 버튼 아이콘 변경, sectionContent 표시/숨김
        if (folded) {
            this.dom.classList.add('folded'); // folded가 true일 때 클래스 추가
            this.toggleButton.style.transform = 'rotate(0)'; // 아이콘 90도 회전(> -> v)
            this.sectionContent.style.display = 'none';
        } else {
            this.dom.classList.remove('folded'); // folded가 false일 때 클래스 제거
            this.toggleButton.style.transform = 'rotate(90deg)'; // 회전 초기화
            this.sectionContent.style.display = '';
        }
    }
}
function setFoldedState(view: EditorView, folded: boolean, pos = 0) {
    // view 전체 객체에서 pos(위치)에 해당하는 노드를 가져온다.
    const section = view.state.doc.nodeAt(pos);
    // pos에 위치한 노드가 section 노드인 경우에만 내부 로직 실행
    if (section && section.type.name === 'section') {
        // 트랜잭션 생성
        const tr = view.state.tr;

        // 트랜잭션에 PluginKey를 key로 하는 meta data 추가
        tr.setMeta(FOLD_PLUGIN_KEY, { pos, folded });

        // 현재 선택상태/커서위치 에서 접힌 섹션의 끝 위치 계산
        // from, to : 현재 selection에 대한 시작과 끝의 index
        // pos, endPos : 노드 시작/끝 위치
        const { from, to } = view.state.selection;
        const endPos = pos + section.nodeSize;

        // section node 내 커서가 있는 경우 접힌 이후에는 해당 위치가 유효하지 않으므로 이를 재조정
        if (from < endPos && to > pos) {
            /*
                각각 섹션의 끝/시작 위치에서 시작해 앞(1)/뒤(-1)로 유효한 선택 위치를 찾음.
                endPos로부터 탐색한 유효한 커서위치가 존재하면 해당 결과를 사용하고
                그렇지 않은경우 pos로부터의 유효한 커서위치를 찾는다.
                둘 다 null을 반환하는 경우 newSel은 null이 된다.
            */
            const newSel = Selection.findFrom(view.state.doc.resolve(endPos), 1) || Selection.findFrom(view.state.doc.resolve(pos), -1);
            if (newSel) tr.setSelection(newSel);
        }
        // dispatch를 통해 EditorState.apply -> EditorView.updateState
        view.dispatch(tr);
    }
}
