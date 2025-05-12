import { toggleMark } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { Schema } from 'prosemirror-model';

export const customKeymap = (schema: Schema) =>
	keymap({
		'Mod-k': toggleMark(schema.marks.del),
	});
