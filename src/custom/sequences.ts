import { EASING, SEQUENCE_TYPE, StoredSequence } from '../lib/tick';
import { formations } from './formations';

export const sequences: { [name: string]: StoredSequence } = {
	first: [
		{
			type: SEQUENCE_TYPE.FORMATION,
			formation: {
				function: formations.sinx
			},
			duration: 5000
		},
		{
			type: SEQUENCE_TYPE.TRANSITION,
			transition: {
				easing: EASING.LINEAR,
				duration: 2000,
				continuousBefore: true,
				continuousAfter: true
			}
		},
		{
			type: SEQUENCE_TYPE.FORMATION,
			formation: {
				function: formations.sind
			},
			duration: 5000
		},
		{
			type: SEQUENCE_TYPE.TRANSITION,
			transition: {
				easing: EASING.EASE_IN_OUT_QUAD,
				duration: 2000,
				continuousBefore: true,
				continuousAfter: true
			}
		},
		{
			type: SEQUENCE_TYPE.FORMATION,
			formation: {
				function: formations.siny
			},
			duration: 10000
		},
		{
			type: SEQUENCE_TYPE.TRANSITION,
			transition: {
				easing: EASING.EASE_IN_OUT_EXPO,
				duration: 2000,
				continuousBefore: false,
				continuousAfter: false
			}
		}
	],
	sineContinuous: [
		{
			type: SEQUENCE_TYPE.FORMATION,
			formation: {
				function: formations.sinx
			},
			duration: 5000
		},
		{
			type: SEQUENCE_TYPE.TRANSITION,
			transition: {
				easing: EASING.LINEAR,
				duration: 2000,
				continuousBefore: true,
				continuousAfter: true
			}
		},
		{
			type: SEQUENCE_TYPE.FORMATION,
			formation: {
				function: formations.siny
			},
			duration: 5000
		}
	],
	sineNoncontinuous: [
		{
			type: SEQUENCE_TYPE.FORMATION,
			formation: {
				function: formations.sinx
			},
			duration: 5000
		},
		{
			type: SEQUENCE_TYPE.TRANSITION,
			transition: {
				easing: EASING.LINEAR,
				duration: 2000,
				continuousBefore: false,
				continuousAfter: false
			}
		},
		{
			type: SEQUENCE_TYPE.FORMATION,
			formation: {
				function: formations.siny
			},
			duration: 5000
		}
	],
	sineContinuousBefore: [
		{
			type: SEQUENCE_TYPE.FORMATION,
			formation: {
				function: formations.sinx
			},
			duration: 5000
		},
		{
			type: SEQUENCE_TYPE.TRANSITION,
			transition: {
				easing: EASING.LINEAR,
				duration: 2000,
				continuousBefore: true,
				continuousAfter: false
			}
		},
		{
			type: SEQUENCE_TYPE.FORMATION,
			formation: {
				function: formations.siny
			},
			duration: 5000
		}
	],
	sineContinuousAfter: [
		{
			type: SEQUENCE_TYPE.FORMATION,
			formation: {
				function: formations.sinx
			},
			duration: 5000
		},
		{
			type: SEQUENCE_TYPE.TRANSITION,
			transition: {
				easing: EASING.LINEAR,
				duration: 2000,
				continuousBefore: false,
				continuousAfter: true
			}
		},
		{
			type: SEQUENCE_TYPE.FORMATION,
			formation: {
				function: formations.siny
			},
			duration: 5000
		}
	]
};
