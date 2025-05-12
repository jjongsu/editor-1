import { keymap } from 'prosemirror-keymap';
import { splitListItem } from 'prosemirror-schema-list';

export const customKeymap = keymap({
	Enter: (state, dispatch) => {
		const { schema } = state;
		const taskItemType = schema.nodes?.taskItem;

		// [안전 로직] schema node에 taskItem이 정의되어 있지 않으면 false
		if (!taskItemType) return false;

		// 현재 selection이 taskItem 안에 있는 경우에만 작동
		const { $from } = state.selection;
		// taskItem이 생성되면 기본값 상태를 가지도록 속성 설정
		const defaultAttrs = taskItemType?.defaultAttrs || { checked: false };

		for (let d = $from.depth; d > 0; d--) {
			const node = $from.node(d);
			// node의 위치(=깊이)와 같은 곳에서 listItem split
			if (node.type === taskItemType) {
				return splitListItem(taskItemType, defaultAttrs)(state, dispatch);
			}
		}

		return false;
	},
});
