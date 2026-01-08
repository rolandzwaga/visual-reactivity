import {
	easeBounceOut as d3EaseBounceOut,
	easeCubicIn as d3EaseCubicIn,
	easeCubicInOut as d3EaseCubicInOut,
	easeCubicOut as d3EaseCubicOut,
	easeElasticOut as d3EaseElasticOut,
	easeLinear as d3EaseLinear,
	easeQuadIn as d3EaseQuadIn,
	easeQuadInOut as d3EaseQuadInOut,
	easeQuadOut as d3EaseQuadOut,
} from "d3-ease";
import type { EasingFunction } from "./types";

export const easeLinear: EasingFunction = d3EaseLinear;
export const easeQuadIn: EasingFunction = d3EaseQuadIn;
export const easeQuadOut: EasingFunction = d3EaseQuadOut;
export const easeQuadInOut: EasingFunction = d3EaseQuadInOut;
export const easeCubicIn: EasingFunction = d3EaseCubicIn;
export const easeCubicOut: EasingFunction = d3EaseCubicOut;
export const easeCubicInOut: EasingFunction = d3EaseCubicInOut;
export const easeElasticOut: EasingFunction = d3EaseElasticOut;
export const easeBounceOut: EasingFunction = d3EaseBounceOut;

export const defaultEasing: EasingFunction = easeQuadInOut;
