# Feature Specification: Pattern Detection & Reactivity Analysis

**Feature Branch**: `008-pattern-detection-analysis`  
**Created**: 2026-01-09  
**Status**: Draft  
**Input**: User description: "Pattern Detection & Reactivity Analysis - Detect and highlight reactive anti-patterns including orphaned effects, deep chains, diamond patterns, hot paths, high subscription counts, and stale memos with visual indicators and analysis panel"

## Clarifications

### Session 2026-01-09

- Q: How should the analysis panel integrate with the existing visualization UI? → A: Collapsible sidebar panel (similar to existing LiveValuesPanel)
- Q: When should pattern detection analysis run? → A: Real-time passive (runs automatically, no user action needed)
- Q: How should the system handle pattern detection analysis failures? → A: Silent degradation with status indicator (analysis unavailable)
- Q: How should visual indicators display when a node has multiple detected patterns? → A: Badge overlay with count (click to see details)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identify Orphaned Effects (Priority: P1)

As a developer debugging my SolidJS application, I need to quickly identify effects created outside ownership contexts so I can fix potential memory leaks before they become production issues.

**Why this priority**: Orphaned effects are the most common and dangerous anti-pattern - they never get cleaned up and cause memory leaks. This is the foundation pattern that delivers immediate value.

**Independent Test**: Can be fully tested by creating an effect outside createRoot/component context and verifying it's flagged with a warning indicator in the dependency graph. Delivers value by identifying memory leak risks.

**Acceptance Scenarios**:

1. **Given** a reactive graph with effects created inside and outside ownership contexts, **When** pattern detection runs, **Then** effects without owners are highlighted with warning indicators in the visualization
2. **Given** an orphaned effect is detected, **When** I click on the flagged node, **Then** the analysis panel shows "Orphaned Effect" with explanation and remediation steps
3. **Given** multiple orphaned effects exist, **When** I open the issues panel, **Then** all orphaned effects are listed with their locations and severity (warning)

---

### User Story 2 - Detect Deep Dependency Chains (Priority: P2)

As a developer optimizing reactive performance, I need to identify excessively deep dependency chains (>5 levels) so I can refactor them to reduce propagation overhead and improve responsiveness.

**Why this priority**: Deep chains impact performance by causing cascading re-computations. While not as critical as memory leaks, they directly affect user experience and are easy to fix once identified.

**Independent Test**: Can be tested by creating a chain of 7 memos where each depends on the previous, triggering detection, and verifying the chain is highlighted with performance warning indicators.

**Acceptance Scenarios**:

1. **Given** a dependency chain exceeding 5 levels, **When** pattern detection analyzes the graph, **Then** all nodes in the deep chain are highlighted with performance warning indicators
2. **Given** a deep chain is detected, **When** I hover over any node in the chain, **Then** the full chain path is visualized with depth metrics (e.g., "Node at depth 7/5 threshold")
3. **Given** multiple deep chains exist, **When** I view the metrics dashboard, **Then** I see a summary showing the deepest chains with their starting nodes and maximum depths

---

### User Story 3 - Visualize Diamond Patterns (Priority: P2)

As a developer understanding reactivity flow, I need to see diamond patterns (convergent dependencies where multiple paths lead to the same node) so I can verify glitch-free execution and understand propagation order.

**Why this priority**: Diamond patterns are architecturally important for understanding how SolidJS handles convergent updates. While not inherently problematic, visualizing them helps developers understand reactivity guarantees.

**Independent Test**: Can be tested by creating signal A that updates memos B and C, which both update effect D, then verifying the diamond is highlighted and the analysis shows execution order guarantees.

**Acceptance Scenarios**:

1. **Given** a diamond pattern exists (A→B→D, A→C→D), **When** pattern detection runs, **Then** the converging paths are highlighted with distinct visual indicators
2. **Given** a diamond pattern is detected, **When** signal A updates, **Then** animation shows both paths executing before the convergence point D
3. **Given** multiple diamond patterns exist, **When** I open the patterns panel, **Then** each diamond is listed with its source node, convergence node, and path count

---

### User Story 4 - Monitor Hot Paths (Priority: P3)

As a developer profiling reactive performance, I need to identify "hot paths" (nodes updating more than 10 times per second) so I can optimize or debounce frequently changing signals.

**Why this priority**: Hot paths indicate potential over-computation but require active monitoring over time. Less critical than structural issues but valuable for performance tuning.

**Independent Test**: Can be tested by creating a signal that updates 15 times per second via setInterval, waiting for detection threshold, and verifying it's flagged as a hot path with update frequency displayed.

**Acceptance Scenarios**:

1. **Given** a signal updates more than 10 times per second, **When** pattern detection monitors update frequency, **Then** the node is highlighted as a hot path with a "heat" visual indicator
2. **Given** a hot path is detected, **When** I click on the node, **Then** the detail panel shows update frequency chart (updates/sec over time) and suggests debouncing
3. **Given** hot paths exist in the graph, **When** I view the metrics dashboard, **Then** I see a ranked list of top 10 most frequently updating nodes with their rates

---

### User Story 5 - Flag High Subscription Counts (Priority: P3)

As a developer managing memory usage, I need to identify nodes with excessive observers (>50 subscriptions) so I can assess if the fan-out is intentional or indicates over-subscription.

**Why this priority**: High subscription counts may indicate architectural issues but are context-dependent. Lower priority as many legitimate use cases have high observer counts.

**Independent Test**: Can be tested by creating a signal with 60 effects observing it, triggering detection, and verifying the signal is flagged with a subscription count warning.

**Acceptance Scenarios**:

1. **Given** a signal has more than 50 observers, **When** pattern detection analyzes subscription counts, **Then** the node is highlighted with a subscription warning indicator
2. **Given** a high-subscription node is detected, **When** I click on it, **Then** the detail panel shows observer count, observer types breakdown (effects vs memos), and memory impact estimate
3. **Given** multiple high-subscription nodes exist, **When** I sort by subscription count in the analysis panel, **Then** nodes are ranked from highest to lowest observer counts

---

### User Story 6 - Identify Stale Memos (Priority: P3)

As a developer cleaning up unused code, I need to identify memos that are never read (0 observers) so I can remove unnecessary computations and reduce complexity.

**Why this priority**: Stale memos waste computation cycles but don't cause functional issues. Lowest priority as they're often temporary during development.

**Independent Test**: Can be tested by creating a memo that computes a value but has no effects or other memos reading it, then verifying it's flagged as stale with a suggestion to remove.

**Acceptance Scenarios**:

1. **Given** a memo exists with zero observers, **When** pattern detection analyzes the graph, **Then** the memo is highlighted with a "stale" indicator
2. **Given** a stale memo is detected, **When** I click on it, **Then** the analysis panel shows "Never read" status and suggests removal or adding consumers
3. **Given** stale memos exist, **When** I filter issues by type, **Then** I can view only stale memos and batch-remove them from the codebase

---

### Edge Cases

- What happens when a deep chain is also a hot path? (Show badge overlay with count "2", color indicates highest severity, click badge to see both patterns in analysis panel)
- How does detection handle nodes that transition between patterns? (Update indicators in real-time)
- What happens when an orphaned effect is intentional? (Allow user to mark as "expected" and suppress warning)
- How are patterns detected during rapid updates? (Use 300ms debounced analysis to batch updates and avoid performance impact)
- What happens when the graph has 1000+ nodes? (Prioritize critical patterns, virtualize analysis panel results)
- What happens when pattern detection analysis fails or times out? (Show "Analysis Unavailable" status, log error to console, visualization remains functional)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect effects created without an owner (orphaned effects) and flag them with warning indicators
- **FR-002**: System MUST detect dependency chains exceeding 5 levels depth and highlight all nodes in the chain
- **FR-003**: System MUST identify diamond patterns (convergent dependencies) and visualize multiple paths to the same node
- **FR-004**: System MUST monitor node update frequency and flag nodes updating more than 10 times per second as hot paths
- **FR-005**: System MUST detect nodes with more than 50 observers and flag them with subscription count warnings
- **FR-006**: System MUST identify memos with zero observers and mark them as stale/unused
- **FR-007**: System MUST provide a collapsible sidebar analysis panel (similar to LiveValuesPanel) showing all detected patterns with descriptions and remediation steps
- **FR-008**: System MUST display visual indicators on nodes in the dependency graph for each detected pattern type using badge overlays that show pattern count when multiple patterns affect the same node (click badge to view all pattern details)
- **FR-009**: System MUST show a metrics dashboard with summary statistics (total patterns by type, severity distribution)
- **FR-010**: System MUST classify patterns by severity: error (orphaned effects), warning (deep chains, hot paths, high subscriptions), info (diamonds, stale memos)
- **FR-011**: System MUST provide filtering in the analysis panel to show specific pattern types
- **FR-012**: System MUST allow users to mark patterns as "expected" to suppress warnings
- **FR-013**: System MUST persist pattern detection settings (enabled/disabled patterns, thresholds) in browser localStorage
- **FR-014**: System MUST run pattern detection automatically in real-time when graph changes (no user action required), debounced with 300ms delay to batch rapid updates and avoid performance impact
- **FR-015**: System MUST show pattern detection status (analyzing, X patterns found, last analyzed timestamp)
- **FR-016**: Analysis panel MUST support expand/collapse state with persistent preferences in localStorage
- **FR-017**: System MUST update pattern indicators in real-time as patterns are detected or resolved without requiring manual refresh
- **FR-018**: System MUST gracefully degrade when pattern detection fails (computation error, performance threshold exceeded) by showing "Analysis Unavailable" status indicator without blocking visualization functionality
- **FR-019**: System MUST log pattern detection errors to browser console for debugging purposes while maintaining silent degradation for end users
- **FR-020**: Badge overlays MUST show the highest severity pattern color with numerical count (e.g., "3" for three patterns), and clicking the badge MUST open analysis panel filtered to show all patterns for that node

### Key Entities

- **Pattern**: Represents a detected anti-pattern or notable structure with type (orphaned-effect, deep-chain, diamond, hot-path, high-subscriptions, stale-memo), severity (error, warning, info), affected node IDs, timestamp detected, description, and remediation steps
- **PatternThreshold**: Configuration for detection sensitivity with pattern type, threshold value (depth limit, update frequency, subscription count), and enabled/disabled state
- **PatternException**: User-marked patterns to suppress with pattern ID, suppression reason, and timestamp
- **MetricsSummary**: Aggregated statistics with total patterns by type, severity distribution, most problematic nodes, and trend data over time

## Testing Requirements

**Testing Guide Consultation**: [X] Read `specs/TESTING-GUIDE.md` before implementing tests

**Test Coverage Requirements**:
- [X] Unit tests for pattern detection algorithms (orphaned effects, chain depth, diamond detection, frequency monitoring)
- [X] Unit tests for threshold configuration and persistence
- [X] Component tests for analysis panel interactions (filtering, sorting, marking as expected)
- [X] Component tests for visual indicators in dependency graph
- [X] Integration tests for pattern detection workflow (graph update → analysis → UI update)
- [X] Edge case testing (overlapping patterns, rapid updates, large graphs)

**Testing Patterns to Follow** (from TESTING-GUIDE.md):
- Use `testInRoot()` for pattern detection logic tests
- Use `useMockDate()` for timestamp-based tests (hot path detection over time)
- Flush microtasks when testing reactive updates triggering pattern detection
- Use mocked tracker data for consistent test scenarios

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can identify orphaned effects within 5 seconds of opening the visualization (95% success rate in user testing)
- **SC-002**: Pattern detection analyzes graphs with up to 100 nodes in under 200ms without blocking UI
- **SC-003**: Analysis panel displays all detected patterns with clear descriptions and remediation steps (100% of patterns have documentation)
- **SC-004**: Developers successfully resolve 80% of flagged issues within first debugging session (measured by pattern suppression rate)
- **SC-005**: Hot path detection identifies nodes exceeding update threshold within 2 seconds of crossing threshold
- **SC-006**: Metrics dashboard provides actionable insights that lead to 50% reduction in flagged patterns after refactoring (measured over 2-week period)
- **SC-007**: Visual indicators on nodes are clearly distinguishable for different pattern types (95% user identification accuracy in testing)
- **SC-012**: Badge overlays for multi-pattern nodes are immediately understandable, with users correctly identifying that multiple patterns exist within 3 seconds (90% accuracy in usability testing)
- **SC-008**: Zero false positives for orphaned effect detection (100% accuracy on test suite)
- **SC-009**: Pattern detection handles graphs with 200+ nodes without performance degradation (maintains <200ms analysis time)
- **SC-011**: System degrades gracefully when pattern detection fails, maintaining full visualization functionality with clear status indication (zero crashes or blocking errors)
- **SC-010**: Developers rate the feature as "helpful" or "very helpful" for debugging reactivity issues (>80% satisfaction in user survey)

## Assumptions

- Pattern detection thresholds (depth > 5, frequency > 10/sec, subscriptions > 50) are based on industry best practices and may need tuning based on user feedback
- Users have basic understanding of SolidJS reactivity concepts (signals, memos, effects, ownership)
- The existing ReactivityTracker already provides necessary data (node types, edges, update events) for pattern detection
- Pattern analysis runs client-side and does not require server-side processing
- Performance monitoring (hot path detection) uses in-memory counters with 1-second sampling window
- Visual indicators use existing node rendering infrastructure from dependency graph visualization

## Dependencies

- Requires Feature 001 (Core Instrumentation) for access to ReactivityTracker and node/edge data
- Requires Feature 002 (Dependency Graph Visualization) for visual indicator integration
- Requires Feature 007 (View Synchronization) for analysis panel to highlight nodes on click

## Constraints

- Pattern detection must not degrade visualization performance (max 200ms analysis time)
- Analysis panel must follow existing sidebar panel architecture (LiveValuesPanel, TimelineView) for UI consistency
- Visual indicators must be color-blind friendly (use shapes + colors + labels)
- Pattern detection must be optional (can be disabled if causing performance issues)
- Threshold customization must be simple (no complex configuration UI required for MVP)

## Out of Scope

- Automatic refactoring or code fixes for detected patterns
- Historical pattern tracking beyond current session (no database persistence)
- Machine learning-based pattern prediction
- Integration with external code analysis tools (ESLint, etc.)
- Real-time collaboration features (sharing detected patterns with team)
- Export of pattern reports (PDF, CSV) - may be added in future iteration
- Performance profiling beyond update frequency (memory usage, execution time per node)
