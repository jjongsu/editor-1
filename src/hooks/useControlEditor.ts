import { DOMSerializer } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { useCallback, useState } from 'react';

export default function useControlEditor() {
	const [view, setView] = useState<EditorView | null>(null);

	const handleSetClick = useCallback(
		({ contentDiv }: { contentDiv?: HTMLDivElement | null }) => {
			if (!view) return;
			const serializer = DOMSerializer.fromSchema(view.state.schema);
			const fragment = serializer.serializeFragment(view.state.doc.content);

			if (contentDiv) {
				contentDiv.innerHTML = '';
				contentDiv.appendChild(fragment);
			}
		},
		[view]
	);

	const handleGetJson = useCallback(() => {
		if (!view) return null;
		const currentStateJson = view.state.toJSON();
		console.log(currentStateJson);

		return currentStateJson;
	}, [view]);

	return { setView, view, handleSetClick, handleGetJson };
}
