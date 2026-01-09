/**
 * Demo System API Contracts
 *
 * TypeScript type definitions for the educational demo system.
 * These contracts define the shape of data and functions for:
 * - Demo registration and metadata
 * - Demo lifecycle management (load, cleanup, error handling)
 * - UI component props (menu, panel, controls)
 *
 * Version: 1.0
 * Feature: 010-demo-examples
 */

import type { JSX } from "solid-js";

// ============================================================================
// Core Demo Types
// ============================================================================

/**
 * Metadata describing an educational demo
 * Used for menu display and demo panel information
 */
export interface DemoMetadata {
	/** Display name shown in menu (e.g., "Simple Counter") */
	name: string;

	/** Brief pattern description (e.g., "Signal → Effect") */
	concept: string;

	/** What this demo demonstrates (1-2 sentences) */
	description: string;

	/** How to interact with demo controls (e.g., "Click Increment...") */
	instructions: string;
}

/**
 * Complete demo definition with metadata and render function
 */
export interface Demo {
	/** Unique kebab-case identifier (e.g., 'simple-counter') */
	id: string;

	/** Descriptive metadata for UI display */
	metadata: DemoMetadata;

	/** SolidJS component function that renders the demo */
	render: () => JSX.Element;
}

/**
 * Isolated reactive context for a running demo
 * Manages demo lifecycle and cleanup
 */
export interface DemoContext {
	/** SolidJS root disposal function */
	rootDispose: () => void;

	/** Full cleanup: dispose reactive scope + reset tracker */
	cleanup: () => void;
}

/**
 * Central registry of all available demos
 * Key: demo ID, Value: Demo instance
 */
export type DemoRegistry = Record<string, Demo>;

// ============================================================================
// Demo Lifecycle Functions
// ============================================================================

/**
 * Load a demo and create its isolated reactive context
 *
 * @param demo - The demo to load
 * @returns DemoContext for cleanup management
 *
 * @throws Error if demo render function throws during initialization
 *
 * @example
 * const context = loadDemo(DEMO_REGISTRY['simple-counter']);
 * // Demo is now active, visualizer shows reactive graph
 */
export type LoadDemoFn = (demo: Demo) => DemoContext;

/**
 * Clean up current demo and reset visualizer state
 *
 * @param context - The demo context to clean up
 *
 * @example
 * cleanupDemo(currentContext);
 * // All signals/effects disposed, visualizer cleared
 */
export type CleanupDemoFn = (context: DemoContext) => void;

/**
 * Switch from one demo to another with proper cleanup
 *
 * @param fromContext - Current demo context (or null if none active)
 * @param toDemo - Demo to switch to
 * @returns New DemoContext for the loaded demo
 *
 * @example
 * const newContext = switchDemo(currentContext, DEMO_REGISTRY['derived-state']);
 * // Old demo cleaned up, new demo loaded
 */
export type SwitchDemoFn = (
	fromContext: DemoContext | null,
	toDemo: Demo,
) => DemoContext;

// ============================================================================
// UI Component Props
// ============================================================================

/**
 * Props for DemoMenu component (modal/dropdown with demo list)
 */
export interface DemoMenuProps {
	/** Whether menu is currently open */
	open: boolean;

	/** Callback to close menu */
	onClose: () => void;

	/** All available demos for display */
	demos: Demo[];

	/** ID of currently active demo (for highlighting) */
	currentDemoId: string | null;

	/** Callback when user selects a demo */
	onSelectDemo: (demoId: string) => void;
}

/**
 * Props for DemoPanel component (contains demo controls and metadata)
 */
export interface DemoPanelProps {
	/** Currently active demo (null if no demo loaded) */
	demo: Demo | null;

	/** Callback to close current demo and return to welcome state */
	onClose: () => void;

	/** Callback to reset current demo to initial state */
	onReset: () => void;

	/** Content to render (demo controls) */
	children: JSX.Element;
}

/**
 * Props for WelcomeMessage component (initial state prompt)
 */
export interface WelcomeMessageProps {
	/** Callback to open demo menu */
	onOpenMenu: () => void;
}

/**
 * Props for individual demo components
 * (Demos may extend this with additional control props)
 */
export interface DemoComponentProps {
	/** Optional: Demo-specific configuration */
	config?: Record<string, unknown>;
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Error information for ErrorBoundary fallback
 */
export interface DemoError {
	/** Error message */
	message: string;

	/** Error stack trace (if available) */
	stack?: string;

	/** Demo ID where error occurred */
	demoId: string;
}

/**
 * Props for DemoErrorFallback component
 */
export interface DemoErrorFallbackProps {
	/** Error that occurred */
	error: DemoError;

	/** Callback to close errored demo */
	onClose: () => void;

	/** Callback to retry loading demo */
	onRetry: () => void;
}

// ============================================================================
// State Management
// ============================================================================

/**
 * Application-level demo state (managed in App.tsx)
 */
export interface DemoState {
	/** ID of currently active demo (null if none) */
	currentDemoId: string | null;

	/** Current demo context (null if none) */
	currentContext: DemoContext | null;

	/** Whether demo menu is open */
	menuOpen: boolean;

	/** Error state (null if no error) */
	error: DemoError | null;
}

/**
 * Demo state actions (for state management)
 */
export interface DemoActions {
	/** Select and load a demo by ID */
	selectDemo: (demoId: string) => void;

	/** Close current demo and return to welcome state */
	closeDemo: () => void;

	/** Reset current demo to initial state */
	resetDemo: () => void;

	/** Open demo selection menu */
	openMenu: () => void;

	/** Close demo selection menu */
	closeMenu: () => void;

	/** Clear error state */
	clearError: () => void;
}

// ============================================================================
// Registry Helpers
// ============================================================================

/**
 * Get demo by ID from registry
 *
 * @param registry - The demo registry
 * @param demoId - ID of demo to retrieve
 * @returns Demo instance or undefined if not found
 */
export type GetDemoFn = (
	registry: DemoRegistry,
	demoId: string,
) => Demo | undefined;

/**
 * Get all demos as an array (for iteration)
 *
 * @param registry - The demo registry
 * @returns Array of all demos
 */
export type GetAllDemosFn = (registry: DemoRegistry) => Demo[];

/**
 * Check if demo ID exists in registry
 *
 * @param registry - The demo registry
 * @param demoId - ID to check
 * @returns True if demo exists
 */
export type HasDemoFn = (registry: DemoRegistry, demoId: string) => boolean;

// ============================================================================
// Validation
// ============================================================================

/**
 * Validation result for demo metadata
 */
export interface ValidationResult {
	/** Whether validation passed */
	valid: boolean;

	/** Validation errors (empty if valid) */
	errors: string[];
}

/**
 * Validate demo metadata meets requirements
 *
 * @param metadata - Metadata to validate
 * @returns Validation result with any errors
 */
export type ValidateMetadataFn = (metadata: DemoMetadata) => ValidationResult;

/**
 * Validate demo ID format (kebab-case)
 *
 * @param id - Demo ID to validate
 * @returns True if valid format
 */
export type ValidateDemoIdFn = (id: string) => boolean;

// ============================================================================
// Testing Utilities (for test files)
// ============================================================================

/**
 * Create a mock demo for testing
 *
 * @param overrides - Partial demo properties to override defaults
 * @returns Mock demo instance
 */
export type CreateMockDemoFn = (overrides?: Partial<Demo>) => Demo;

/**
 * Create a mock demo context for testing
 *
 * @param overrides - Partial context properties to override defaults
 * @returns Mock demo context
 */
export type CreateMockContextFn = (
	overrides?: Partial<DemoContext>,
) => DemoContext;

// ============================================================================
// Constants
// ============================================================================

/**
 * Expected number of demos in registry (for validation)
 */
export const EXPECTED_DEMO_COUNT = 8;

/**
 * Demo ID validation pattern (lowercase kebab-case)
 */
export const DEMO_ID_PATTERN = /^[a-z]+(-[a-z]+)*$/;

/**
 * Metadata validation constraints
 */
export const METADATA_CONSTRAINTS = {
	name: { min: 3, max: 50 },
	concept: { min: 5, max: 100 },
	description: { min: 20, max: 500 },
	instructions: { min: 10, max: 300 },
} as const;

/**
 * Demo panel height (CSS pixels)
 */
export const DEMO_PANEL_HEIGHT = 250;

/**
 * Demo load timeout (milliseconds)
 */
export const DEMO_LOAD_TIMEOUT = 1000; // Per SC-002: <1s load time
