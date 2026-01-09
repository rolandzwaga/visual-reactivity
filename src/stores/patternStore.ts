import { type Accessor, createSignal } from "solid-js";
import type {
	MetricsSummary,
	Pattern,
	PatternException,
	PatternThreshold,
} from "../types/pattern";

export interface PatternStore {
	patterns: Accessor<Pattern[]>;
	exceptions: Accessor<PatternException[]>;
	thresholds: Accessor<PatternThreshold[]>;
	metrics: Accessor<MetricsSummary>;
	status: Accessor<"idle" | "analyzing" | "success" | "error">;
	errorMessage: Accessor<string | null>;

	addPattern(pattern: Pattern): void;
	addPatterns(patterns: Pattern[]): void;
	removePattern(patternId: string): void;
	clearPatterns(): void;
	updatePattern(patternId: string, updates: Partial<Pattern>): void;

	markAsExpected(patternId: string, reason?: string, expiresAt?: number): void;
	removeException(patternId: string): void;
	isExpected(patternId: string): boolean;

	updateThreshold(patternType: string, value: number): void;
	toggleThreshold(patternType: string, enabled: boolean): void;
	resetThresholds(): void;

	getPatternsByType(type: string): Pattern[];
	getPatternsBySeverity(severity: "low" | "medium" | "high"): Pattern[];
	getPatternsForNode(nodeId: string): Pattern[];

	setStatus(
		status: "idle" | "analyzing" | "success" | "error",
		error?: string,
	): void;

	loadFromStorage(): void;
	saveToStorage(): void;
	reset(): void;
}

export function createPatternStore(): PatternStore {
	const [patterns, setPatterns] = createSignal<Pattern[]>([]);
	const [exceptions, setExceptions] = createSignal<PatternException[]>([]);
	const [thresholds, setThresholds] = createSignal<PatternThreshold[]>([
		{ patternType: "orphaned-effect", thresholdValue: 0, enabled: true },
		{ patternType: "deep-chain", thresholdValue: 5, enabled: true },
		{ patternType: "diamond-pattern", thresholdValue: 2, enabled: true },
		{ patternType: "hot-path", thresholdValue: 10, enabled: true },
		{ patternType: "high-subscriptions", thresholdValue: 50, enabled: true },
		{ patternType: "stale-memo", thresholdValue: 0, enabled: true },
	]);
	const [metrics, setMetrics] = createSignal<MetricsSummary>({
		totalPatterns: 0,
		byType: {
			"orphaned-effect": 0,
			"deep-chain": 0,
			"diamond-pattern": 0,
			"hot-path": 0,
			"high-subscriptions": 0,
			"stale-memo": 0,
		},
		bySeverity: {
			low: 0,
			medium: 0,
			high: 0,
		},
		mostProblematicNodes: [],
		lastAnalysisAt: 0,
		analysisStatus: "idle",
		errorMessage: null,
	});
	const [status, setStatusSignal] = createSignal<
		"idle" | "analyzing" | "success" | "error"
	>("idle");
	const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

	const addPattern = (pattern: Pattern): void => {
		setPatterns((prev) => {
			const existing = prev.find((p) => p.id === pattern.id);
			if (existing) return prev;
			return [...prev, pattern];
		});
		updateMetrics();
	};

	const addPatterns = (newPatterns: Pattern[]): void => {
		setPatterns((prev) => {
			const existingIds = new Set(prev.map((p) => p.id));
			const unique = newPatterns.filter((p) => !existingIds.has(p.id));
			return [...prev, ...unique];
		});
		updateMetrics();
	};

	const removePattern = (patternId: string): void => {
		setPatterns((prev) => prev.filter((p) => p.id !== patternId));
		updateMetrics();
	};

	const clearPatterns = (): void => {
		setPatterns([]);
		updateMetrics();
	};

	const updatePattern = (
		patternId: string,
		updates: Partial<Pattern>,
	): void => {
		setPatterns((prev) =>
			prev.map((p) => (p.id === patternId ? { ...p, ...updates } : p)),
		);
		updateMetrics();
	};

	const markAsExpected = (
		patternId: string,
		reason = "",
		expiresAt?: number,
	): void => {
		const exception: PatternException = {
			id: `exception-${Date.now()}`,
			patternId,
			reason,
			createdAt: Date.now(),
			expiresAt: expiresAt || null,
		};
		setExceptions((prev) => [...prev, exception]);
		updatePattern(patternId, { isExpected: true });
	};

	const removeException = (patternId: string): void => {
		setExceptions((prev) => prev.filter((e) => e.patternId !== patternId));
		updatePattern(patternId, { isExpected: false });
	};

	const isExpected = (patternId: string): boolean => {
		return exceptions().some((e) => e.patternId === patternId);
	};

	const updateThreshold = (patternType: string, value: number): void => {
		setThresholds((prev) =>
			prev.map((t) =>
				t.patternType === patternType ? { ...t, thresholdValue: value } : t,
			),
		);
	};

	const toggleThreshold = (patternType: string, enabled: boolean): void => {
		setThresholds((prev) =>
			prev.map((t) => (t.patternType === patternType ? { ...t, enabled } : t)),
		);
	};

	const resetThresholds = (): void => {
		loadFromStorage();
	};

	const getPatternsByType = (type: string): Pattern[] => {
		return patterns().filter((p) => p.type === type);
	};

	const getPatternsBySeverity = (
		severity: "low" | "medium" | "high",
	): Pattern[] => {
		return patterns().filter((p) => p.severity === severity);
	};

	const getPatternsForNode = (nodeId: string): Pattern[] => {
		return patterns().filter((p) => p.affectedNodeIds.includes(nodeId));
	};

	const setStatus = (
		newStatus: "idle" | "analyzing" | "success" | "error",
		error?: string,
	): void => {
		setStatusSignal(newStatus);
		setErrorMessage(error || null);
		setMetrics((prev) => ({
			...prev,
			analysisStatus: newStatus,
			errorMessage: error || null,
		}));
	};

	const updateMetrics = (): void => {
		const currentPatterns = patterns();
		const byType: Record<string, number> = {
			"orphaned-effect": 0,
			"deep-chain": 0,
			"diamond-pattern": 0,
			"hot-path": 0,
			"high-subscriptions": 0,
			"stale-memo": 0,
		};
		const bySeverity: Record<string, number> = {
			low: 0,
			medium: 0,
			high: 0,
		};

		for (const pattern of currentPatterns) {
			byType[pattern.type] = (byType[pattern.type] || 0) + 1;
			bySeverity[pattern.severity] = (bySeverity[pattern.severity] || 0) + 1;
		}

		const nodePatternCount = new Map<string, number>();
		for (const pattern of currentPatterns) {
			for (const nodeId of pattern.affectedNodeIds) {
				nodePatternCount.set(nodeId, (nodePatternCount.get(nodeId) || 0) + 1);
			}
		}

		const mostProblematicNodes = Array.from(nodePatternCount.entries())
			.map(([nodeId, patternCount]) => ({ nodeId, patternCount }))
			.sort((a, b) => b.patternCount - a.patternCount)
			.slice(0, 5);

		setMetrics({
			totalPatterns: currentPatterns.length,
			byType: byType as Record<
				| "orphaned-effect"
				| "deep-chain"
				| "diamond-pattern"
				| "hot-path"
				| "high-subscriptions"
				| "stale-memo",
				number
			>,
			bySeverity: bySeverity as Record<"low" | "medium" | "high", number>,
			mostProblematicNodes,
			lastAnalysisAt: Date.now(),
			analysisStatus: status(),
			errorMessage: errorMessage(),
		});
	};

	const loadFromStorage = (): void => {
		try {
			const exceptionsData = localStorage.getItem(
				"visual-reactivity:pattern-exceptions",
			);
			if (exceptionsData) {
				const stored = JSON.parse(exceptionsData);
				if (stored.version === 1 && Array.isArray(stored.exceptions)) {
					setExceptions(stored.exceptions);
				}
			}

			const thresholdsData = localStorage.getItem(
				"visual-reactivity:pattern-thresholds",
			);
			if (thresholdsData) {
				const stored = JSON.parse(thresholdsData);
				if (stored.version === 1 && Array.isArray(stored.thresholds)) {
					setThresholds(stored.thresholds);
				}
			}
		} catch (error) {
			console.error("Failed to load pattern data from storage:", error);
		}
	};

	const saveToStorage = (): void => {
		try {
			const exceptionsData = {
				version: 1,
				exceptions: exceptions(),
				lastUpdated: Date.now(),
			};
			localStorage.setItem(
				"visual-reactivity:pattern-exceptions",
				JSON.stringify(exceptionsData),
			);

			const thresholdsData = {
				version: 1,
				thresholds: thresholds(),
				lastUpdated: Date.now(),
			};
			localStorage.setItem(
				"visual-reactivity:pattern-thresholds",
				JSON.stringify(thresholdsData),
			);
		} catch (error) {
			console.error("Failed to save pattern data to storage:", error);
		}
	};

	const reset = (): void => {
		clearPatterns();
		setExceptions([]);
		setStatusSignal("idle");
		setErrorMessage(null);
	};

	return {
		patterns,
		exceptions,
		thresholds,
		metrics,
		status,
		errorMessage,

		addPattern,
		addPatterns,
		removePattern,
		clearPatterns,
		updatePattern,
		markAsExpected,
		removeException,
		isExpected,
		updateThreshold,
		toggleThreshold,
		resetThresholds,
		getPatternsByType,
		getPatternsBySeverity,
		getPatternsForNode,
		setStatus,
		loadFromStorage,
		saveToStorage,
		reset,
	};
}
