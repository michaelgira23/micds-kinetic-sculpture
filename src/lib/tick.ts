import { Formation } from './formation';

/**
 * Storing sequences
 */

export type StoredSequence = (StoredFormationSequence | TransitionSequence)[];

export interface StoredFormationSequence {
	type: 'formation';
	formation: {
		function: TickCallback;
		globals?: any;
	};
	duration: number;
}

/**
 * Sequences
 */

export type Sequence = (FormationSequence | TransitionSequence)[];

export interface FormationSequence {
	type: SEQUENCE_TYPE.FORMATION;
	formation: Formation;
	duration: number;
}

export interface TransitionSequence {
	type: SEQUENCE_TYPE.TRANSITION;
	transition: Transition;
}

export enum SEQUENCE_TYPE {
	FORMATION = 'formation',
	TRANSITION = 'transition'
}

export interface Transition {
	easing: EASING;
	duration: number;
	continuousBefore: boolean;
	continuousAfter: boolean;
}

export type EasingFunction = (x: number) => number;

/**
 * Mapping move points for manually coded formations
 */

export interface MovePointMapDuration {
	[time: number]: TickCallbackReturn | MovePointMapRow;
}

interface MovePointMapRow {
	[x: number]: TickCallbackReturn | MovePointMapColumns;
}

export interface MovePointMap {
	[x: number]: MovePointMapColumns;
}

export interface MovePointMapColumns {
	[y: number]: TickCallbackReturn;
}

/**
 * Mapping heights of modules
 */

export interface HeightMapDuration {
	[time: number]: HeightMap;
}

export type HeightMap = Height[][];

export interface HeightDuration {
	[time: number]: Height;
}

export type Height = number;

/**
 * Tick Callback
 */

export type TickCallback = (info: TickInfo) => TickCallbackReturn;
export type TickCallbackReturn = TickCallback | Partial<MovePointReturn> | number | void;

export interface TickInfo {
	globals: Globals;
	maxHeight: number;
	nx: number;
	ny: number;
	timeElapsed: number;
	totalDuration: number;
	x: number;
	y: number;
}

export interface Globals {
	[key: string]: any;
}

export interface MovePointReturn {
	height: number;
	easing: EASING;
	waitBefore: number;
	easeDuration: number;
	waitAfter: number;
}

/**
 * Easing functions available
 */

export enum EASING {
	LINEAR              = 'linear',
	BOUNCE_OUT          = 'bounceOut',
	SWING               = 'swing',
	EASE_IN_QUAD        = 'easeInQuad',
	EASE_OUT_QUAD       = 'easeOutQuad',
	EASE_IN_OUT_QUAD    = 'easeInOutQuad',
	EASE_IN_CUBIC       = 'easeInCubic',
	EASE_OUT_CUBIC      = 'easeOutCubic',
	EASE_IN_OUT_CUBIC   = 'easeInOutCubic',
	EASE_IN_QUART       = 'easeInQuart',
	EASE_OUT_QUART      = 'easeOutQuart',
	EASE_IN_OUT_QUART   = 'easeInOutQuart',
	EASE_IN_QUINT       = 'easeInQuint',
	EASE_OUT_QUINT      = 'easeOutQuint',
	EASE_IN_OUT_QUINT   = 'easeInOutQuint',
	EASE_IN_SINE        = 'easeInSine',
	EASE_OUT_SINE       = 'easeOutSine',
	EASE_IN_OUT_SINE    = 'easeInOutSine',
	EASE_IN_EXPO        = 'easeInExpo',
	EASE_OUT_EXPO       = 'easeOutExpo',
	EASE_IN_OUT_EXPO    = 'easeInOutExpo',
	EASE_IN_CIRC        = 'easeInCirc',
	EASE_OUT_CIRC       = 'easeOutCirc',
	EASE_IN_OUT_CIRC    = 'easeInOutCirc',
	EASE_IN_ELASTIC     = 'easeInElastic',
	EASE_OUT_ELASTIC    = 'easeOutElastic',
	EASE_IN_OUT_ELASTIC = 'easeInOutElastic',
	EASE_IN_BACK        = 'easeInBack',
	EASE_OUT_BACK       = 'easeOutBack',
	EASE_IN_OUT_BACK    = 'easeInOutBack',
	EASE_IN_BOUNCE      = 'easeInBounce',
	EASE_OUT_BOUNCE     = 'easeOutBounce',
	EASE_IN_OUT_BOUNCE  = 'easeInOutBounce'
}
