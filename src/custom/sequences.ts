import { EASING, StoredSequence } from '../lib/tick';
import { formations } from './formations';

export const sequences: { [name: string]: StoredSequence } = {
	first: [
		{
			type: 'formation',
			formation: {
				function: formations.sinx
			},
			duration: 10000
		},
		{
			type: 'transition',
			transition: {
				easing: EASING.LINEAR,
				duration: 2000,
				continuous: true
			}
		},
		{
			type: 'formation',
			formation: {
				function: formations.siny
			},
			duration: 10000
		},
		{
			type: 'transition',
			transition: {
				easing: EASING.EASE_IN_OUT_QUAD,
				duration: 2000,
				continuous: true
			}
		},
		{
			type: 'formation',
			formation: {
				function: formations.sind
			},
			duration: 10000
		},
		{
			type: 'transition',
			transition: {
				easing: EASING.EASE_IN_OUT_EXPO,
				duration: 2000,
				continuous: false
			}
		}
	]
};
