import { Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorView, NodeView } from 'prosemirror-view';

export class CheckNodeView implements NodeView {
	dom: HTMLElement;
	contentDOM: HTMLElement;
	checkbox: HTMLInputElement;

	constructor(private node: ProseMirrorNode, private view: EditorView, private getPos: () => number) {
		this.dom = document.createElement('div');
		this.dom.className = 'check-node flex items-center';

		this.checkbox = document.createElement('input');
		this.checkbox.type = 'checkbox';
		this.checkbox.checked = node.attrs.checked;
		this.checkbox.className = 'mx-1';

		this.checkbox.addEventListener('change', this.handleChange);

		this.contentDOM = document.createElement('p');
		this.contentDOM.contentEditable = 'true';

		this.dom.appendChild(this.checkbox);
		this.dom.appendChild(this.contentDOM);
	}

	handleChange = () => {
		const { checked } = this.checkbox;
		const tr = this.view.state.tr.setNodeMarkup(this.getPos(), undefined, {
			...this.node.attrs,
			checked,
		});
		this.view.dispatch(tr);
	};

	stopEvent(event: Event): boolean {
		// allow checkbox clicks to work without interference
		return event.target === this.checkbox;
	}

	destroy() {
		this.checkbox.removeEventListener('change', this.handleChange);
	}
}
