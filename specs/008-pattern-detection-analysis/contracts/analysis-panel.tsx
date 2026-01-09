/**
 * AnalysisPanel Component API Contract
 *
 * Defines the props interface and component API for the pattern detection
 * sidebar panel that displays detected anti-patterns.
 *
 * Implementation location: src/visualization/AnalysisPanel.tsx
 */

import type { JSX } from "solid-js";
import type { MetricsSummary, Pattern } from "../../../src/types/pattern";

export interface AnalysisPanelProps {
	patterns: Pattern[];
	metrics: MetricsSummary;
	isExpanded: boolean;
	onToggle: () => void;
	onPatternClick: (pattern: Pattern) => void;
	onMarkExpected: (patternId: string, reason?: string) => void;
	onRemoveException: (patternId: string) => void;
	showExpectedPatterns: boolean;
	onToggleShowExpected: (show: boolean) => void;
	width?: number;
	onWidthChange?: (width: number) => void;
}

export type AnalysisPanelComponent = (props: AnalysisPanelProps) => JSX.Element;

export interface PatternBadgeProps {
	pattern: Pattern;
	onClick: (pattern: Pattern) => void;
	x: number;
	y: number;
}

export type PatternBadgeComponent = (props: PatternBadgeProps) => JSX.Element;

export interface PatternListItemProps {
	pattern: Pattern;
	isExpected: boolean;
	onClick: () => void;
	onMarkExpected: (reason?: string) => void;
	onRemoveException: () => void;
}

export type PatternListItemComponent = (
	props: PatternListItemProps,
) => JSX.Element;
