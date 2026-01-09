**Part I — Narrative Architecture Preamble**

**The problem space**

We are building a client for an event-sourced system that exposes **read models which change over time**. The client must:

*   Lazily retrieve entities by identity
*   Maintain reactive UI updates
*   Support large collections that **cannot be fully loaded**
*   Display sorted, filtered collections in **imperative grid components**
*   Avoid diffing large arrays
*   Avoid per-row reactive effects
*   Avoid lying about global ordering when partial data is present

A naïve “reactive array of entities” model fails immediately under these constraints:

*   Filtering and sorting cannot be safely maintained client-side with partial knowledge
*   Imperative grids require _row-level change information_, not whole-array replacement
*   Solid’s fine-grained reactivity works at the **signal read** level, not at “collection diff” level

This forces a separation of concerns.

* * *

**The core conceptual split**

There are **two fundamentally different kinds of queries** in the system:

**1) Entity queries (identity-based)**

These answer questions like:

“Give me Foo with id = X”

Properties:

*   Long-lived
*   Shared across the application
*   Cached by identity
*   Updated by server push events
*   Lazy-loaded on first access
*   Reactive at the _entity_ level

These belong to the **data layer**.

* * *

**2) Collection queries (contextual / view-based)**

These answer questions like:

“Give me Foos matching predicate P, sorted by S, in range \[start, end\]”

Properties:

*   Short-lived
*   Owned by a specific view (e.g. a grid instance)
*   Not globally cached
*   Ordering is **server-owned**
*   Represent **viewport slices**, not whole collections
*   Invalidated and re-queried as domain events arrive

These belong to the **view layer**.

Trying to collapse these two query types into a single abstraction causes either correctness failures or severe performance pathologies.

* * *

**Why sorting forces a viewport model**

Filtering can be maintained incrementally on the client after an initial bootstrap, because membership is decidable per entity.

Sorting cannot.

If the client does not have all entities participating in a sort, it cannot:

*   place a new entity correctly,
*   know whether it belongs at the start or end,
*   or know whether unknown entities exist “in between”.

This is not an implementation limitation; it is an information-theoretic one.

The only honest solution is:

*   Sorting is owned by the server
*   The client only holds **ordered slices**
*   Those slices have explicit invalidation boundaries
*   When invalidated, the slice is **re-queried**, not incrementally repaired

AG-Grid's Server-Side Row Model (SSRM) handles exactly this pattern - it supports lazy loading of row data based on visible ranges, with the server owning sort order.

**Note**: We initially considered AG Grid's Viewport Row Model, but discovered it's designed for **server-push** scenarios (real-time data streaming, live updates pushed from server). Our architecture is **request-response** based (client requests ordered IDs, server responds). SSRM is the correct choice for request-response patterns with lazy loading.

* * *

**Resulting model**

*   Entities are cached independently and updated continuously
*   Viewports are ephemeral projections over ordered ids
*   Domain events invalidate viewports
*   Viewports requery ordered id ranges
*   Entities update rows without reshaping collections
*   No UI flicker from Pending once Ready is shown

This aligns Solid’s reactivity, AG-Grid’s imperative model, and event-sourced data realities without pretending they are the same thing.

* * *

**Part II — Design Specification**

**1\. Entity Cache**

**Definition**

EntityCache<T> = Map<Id, Accessor<Entry<T>>>

Where:

Entry<T> =

  | Pending

  | Ready<T>

  | Error

**Properties**

*   Each Id maps to a **read-only accessor**
*   The underlying signal setter is private to the data layer
*   Consumers cannot mutate entity state

**Behavior**

*   On first access of a missing Id:

*   A signal slot is created
*   State is set to Pending
*   A fetch is enqueued

*   Pending is only entered on first miss
*   Ready → Ready transitions occur on server updates
*   Error is terminal for pull-based access
*   Error → Ready is permitted via server push events
*   No UI access triggers retries

**Reactivity**

*   Consumers subscribe by calling the accessor
*   Solid reruns dependents on Entry replacement
*   No fake “version” signals are used

* * *

**2\. Domain Event Stream**

**Responsibilities**

*   Deliver entity update notifications (id + domain type)
*   Drive Ready → Ready updates in the entity cache (for entities we already have)
*   Signal domain-level invalidations for collection membership changes

**Constraints**

*   Does not track per-view or per-subscription state
*   Emits only domain-meaningful events (e.g. Foo updated, CarePath updated)
*   Notification payload is minimal (id only) - entity data is fetched on demand

**Two-Layer Notification Handling**

Notifications trigger two distinct responses:

**Layer 1: Entity Cache Updates**

When a notification arrives for an entity id that is **already in the cache** (we have previously requested it):
1.  Fetch fresh entity data from server
2.  Update the cache entry (Ready → Ready)
3.  Notify entity update handlers (for SSRM row refresh)

When a notification arrives for an entity id that is **not in the cache**:
-   Do nothing for this layer - we don't want to load entities we haven't requested
-   This is critical for medical/compliance reasons and future access policy enforcement

**Layer 2: Collection Membership Changes**

When any notification arrives for a domain that an active collection query cares about:
1.  Re-query the ordered IDs for the current visible range
2.  Compare new IDs to previous IDs
3.  If changed: update the grid (AG Grid SSRM handles the diff/refresh)
4.  If unchanged: no-op

This handles:
-   New entities entering the filtered/sorted collection
-   Existing entities leaving the collection (no longer match filter)
-   Sort order changes affecting visible range

**Important**: Layer 2 only applies to active views with visible grids. The collection query is view-scoped (created on mount, disposed on unmount), so unmounted views don't receive or process notifications.

**Future Optimization: Client-Side Filter Predicates**

Currently, Layer 2 always re-queries IDs on any relevant notification. A future optimization:
-   If we have the entity AND can evaluate the filter predicate client-side:
    -   Entity still matches filter → just refresh the row (skip ID requery)
    -   Entity no longer matches filter → remove from visible set, requery to backfill
-   Sort position changes still require server (can't determine position client-side)

* * *

**3\. Collection Query (for Server-Side Row Model)**

**Definition**

A collection query represents:

“An ordered slice of ids for a given predicate and sort”

**Properties**

*   Owned by a single view instance (typically an AG Grid)
*   Created on view mount
*   Destroyed on view unmount
*   Never shared
*   Never global
*   Never paused

**State**

Each collection query owns:

*   ids: Signal<Id\[\]>
*   an in-flight request with cancellation
*   domain invalidation subscriptions

**Server Contract**

Collection queries request:

orderedIds(start, end, filter, sort)

Server responses contain:

*   a complete ordered list of ids for the requested range
*   total count (for scroll sizing)
*   no deltas
*   no anchors
*   no cursors (initially)

**Update Rules**

*   On relevant domain event:

*   cancel in-flight request
*   requery the collection range

*   While requerying:

*   existing ids remain visible
*   no Pending flicker

*   On response:

*   shallow-compare id lists
*   if unchanged → no-op
*   if changed → replace ids atomically

* * *

**4\. Row-Level Updates for Imperative Grids**

**Purpose**

This mechanism exists solely to bridge entity updates to imperative grid components (e.g. AG-Grid with Server-Side Row Model). It is not part of Solid's reactive rendering model.

When an entity transitions from Ready(old) to Ready(new), the grid must be explicitly informed so that it can refresh the corresponding row. Solid's per-entity signals are not observed by the grid. So we need to support imperative grid components by propagating entity updates to visible rows without diffing collections or re-rendering the entire collection.

**Mechanism (Layer 1 Only)**

This section describes the Layer 1 behavior for entities **already in the cache**:

*   When the entity cache applies a server-driven update to an entity (Ready → Ready or Error → Ready), it emits an imperative notification containing the entity id.
*   Each active SSRM hook maintains the set of entity ids currently visible in its slice.
*   Upon receiving an entity-update notification:
    * If the updated id is not present in the visible slice, the update is ignored.
    * If the updated id is present, the SSRM hook instructs AG Grid to refresh that specific row via `applyServerSideTransaction`.
* This mechanism does not determine ordering validity; ordering invalidation and collection requery are handled by Layer 2.

**Precondition: Entity Must Already Be Cached**

The notification handler (DomainNotificationSubscriber) only fetches entity data if the entity id is **already present in the cache**. This means:

*   We have previously requested this entity (via `getSmartToDo(id)`, visible grid row, etc.)
*   The cache has an entry for this id (may be Pending, Ready, or Failed)

If the notification is for an entity we've never requested, the fetch is skipped entirely. This prevents:
*   Slowly loading the entire database into memory
*   Violating data access policies (future)
*   Unnecessary network traffic

The `EntityCache.has(id)` method is used to check whether an entity should be refreshed.

**Guarantees**

*   Only entities we have previously requested are refreshed on notification.
*   Only rows currently visible in the SSRM slice trigger grid updates.
*   No per-row reactive effects are created.
*   No collection diffing or reshaping occurs.
*   No sorting or membership logic is involved in Layer 1.
*   Declarative Solid rendering remains unaffected.

* * *

**5\. Solid Integration Rules**

*   Entity cache is long-lived and shared
*   Collection queries are owner-scoped (one per grid instance)
*   All collection effects must be disposed on unmount
*   No collection query state may escape its owner
*   Hooks expose declarative outputs only
*   Imperative mechanics remain internal

* * *

**6\. Hook Responsibilities**

**useEntity(id)**

*   Returns Accessor<Entry<T>>
*   Participates in shared cache
*   Triggers lazy fetch on first miss

**useCollectionQuery(config)**

*   Creates a scoped collection query
*   Manages ordering invalidation
*   Performs server requery
*   Integrates with AG-Grid Server-Side Row Model internally
*   Exposes only what the view needs

* * *

**Part III — Implementation Notes (Current State)**

**Provider Stack**

The client providers are layered in this order (outermost to innermost):

1.  **V2Provider** - Initializes server, creates bound API functions
2.  **EntityCacheProvider** - Creates signal registries for all entity types, provides fetchers
3.  **QueriesProvider** - High-level query functions for components (uses shared EntityCache)
4.  **DomainNotificationSubscriber** - Subscribes to domain events, updates caches

**EntityCache (Pure Signal Registry)**

EntityCache is a pure signal registry - it does NOT fetch. Key properties:

*   `get(id)` - Returns accessor, creates Pending entry if not present
*   `set(id, entry)` - Updates entry value (used by fetchers)
*   `seed(entities)` - Bulk populate with Ready entries
*   `has(id)` - Check if entity id is already in cache (for notification filtering)
*   `getIds()` - Inspection method for debugging

Fetching is the responsibility of:
*   **QueriesProvider** - Triggers fetch when `get*(id)` encounters Pending
*   **DomainNotificationSubscriber** - Triggers fetch when entity notification arrives AND entity is in cache

**Why EntityCache Does Not Fetch**

If the cache fetched, it would:
1.  Couple the cache to Effect/server implementation
2.  Create two sources of truth (cache triggering fetches vs query layer)
3.  Make the cache "essential" rather than an optimization

The correct model: cache is an **invisible optimization**. If removed, everything still works (just slower with redundant fetches). The query layer owns the decision of when/whether to fetch.

**Entity Update Flow (Layer 1)**

1.  Domain event arrives → DomainNotificationSubscriber receives notification (id + domain)
2.  Check if entity is already in cache via `cache.has(id)`
3.  If NOT in cache: skip fetch entirely (don't load entities we haven't requested)
4.  If in cache: fetch fresh entity via bound fetcher
5.  On success, set to shared EntityCache via `cache.set(id, Ready(entity))`
6.  Notify entity update handlers (for SSRM row updates)
7.  Notify invalidation handlers (for collection requery - Layer 2)

**Collection Membership Flow (Layer 2)**

When any notification arrives for a domain that an active collection query cares about:

1.  `DomainNotificationSubscriber` calls invalidation handlers for the domain
2.  `useCollectionQuery` receives invalidation → increments `version` signal
3.  `useServerSideRowModel` has an effect watching `version` → calls `gridApi.refreshServerSide({ purge: true })`
4.  AG Grid calls `getRows` → `collectionQuery.getRange` → requeries ordered IDs from server
5.  If IDs changed: AG Grid displays updated data (new rows, removed rows, reordered)
6.  If IDs unchanged: no visual change (but data was re-fetched to confirm)

This is view-scoped - only active grids requery. Unmounted views don't process notifications.

**QueriesProvider and Shared Cache**

All individual entity accessors use shared EntityCache:

*   `getSmartToDo(id)` → `entityCaches.smartTodos`
*   `getPatient(id)` → `entityCaches.patients`
*   `getProvider(id)` → `entityCaches.providers`
*   `getReferral(id)` → `entityCaches.referrals`

Pattern for each:
1.  Get accessor from shared EntityCache (`entityCaches.*.get(id)`)
2.  If entry is Pending and no in-flight fetch, trigger fetch
3.  On completion, set result to shared cache
4.  Return accessor - DomainNotificationSubscriber updates same accessor on events

Batch queries (`getAllCarePaths`, `getAllSmartToDos`, etc.) still use internal caches as they have different lifecycle requirements.

**Implementation Status**

| Component | Layer 1 (Cache Updates) | Layer 2 (Collection Membership) |
|-----------|------------------------|--------------------------------|
| EntityCache.has() | ✅ Implemented | N/A |
| DomainNotificationSubscriber | ✅ Implemented (checks has() before fetch) | ✅ Calls invalidation handlers |
| useCollectionQuery | N/A | ✅ Subscribes to invalidation, increments version |
| useServerSideRowModel | ✅ Updates visible rows via transaction | ✅ Watches version, calls refreshServerSide |

* * *

**Key Files**

| File | Purpose |
|------|---------|
| `src/client/EntityCache.ts` | Pure signal registry - stores signals by id, no fetching |
| `src/client/EntityCacheProvider.tsx` | Creates EntityCache instances for each entity type, provides fetchers |
| `src/client/QueriesProvider.tsx` | High-level query functions, triggers lazy fetches, uses shared EntityCache |
| `src/client/DomainNotificationSubscriber.tsx` | Subscribes to SSE events, updates caches, notifies handlers |
| `src/client/Entry.ts` | Entry<T> type (Pending/Ready/Failed) and type guards |
| `src/hooks/useCollectionQuery.ts` | Base hook for ordered ID slice queries with invalidation |
| `src/hooks/useServerSideRowModel.ts` | Composes useCollectionQuery with AG Grid SSRM |
| `src/hooks/useTodoCollectionQuery.ts` | Todo-specific collection query configuration |
| `src/hooks/useTodoServerSideRowModel.ts` | Todo-specific SSRM with transform function |
| `src/server/queries/smarttodo/orderedIds.ts` | Server query for ordered todo IDs with filter/sort |
| `src/domain/notifications/DomainNotification.ts` | DomainNotification type definition |
| `src/server/notifications/emitter.ts` | Server-side notification emitter |