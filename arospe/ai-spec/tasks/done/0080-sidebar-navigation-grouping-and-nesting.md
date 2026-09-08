# [0080] Sidebar navigation — match PRD grouping and nest a module's sub-resources

The dashboard shell's sidebar has drifted from the navigation [the PRD](../../../docs/PRD/PRD.md) describes
("Design reference & the dashboard shell"), and it drifted **silently**, one story at a time. The PRD
mockup ([`docs/PRD/images/01-inicio.png`](../../../docs/PRD/images/01-inicio.png)) shows *Inicio* and
*Usuarios* at the top with **no heading above them at all**, then a **TIENDA** heading (Impuestos,
Envíos), then a **CONTENIDO** heading (Productos, Blog). The shipped
[`config/modules.php`](../../../config/modules.php) instead renders a literal "Platform" heading over
Dashboard/Users (a heading the mockup does not have) and drops `products`, `product_categories` and
`product_attribute_types` into that same flat group as three unrelated siblings — even though all
three are facets of one module and share one permission (`products.view`).

**Root cause, and the durable fix already in place.**
[`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md)'s "The second half of a
module gate: the sidebar registry" section used to carry five rules for adding a registry entry, and none
of them asked *"which PRD-aligned top-level group does this belong under?"* or *"is this a sub-resource
that belongs nested under its parent module?"* — while several of that same page's ✅ notes celebrate
landing a new item in the flat `platform` group as a cheap win. **That rule gap is already closed, ahead of
this story's own implementation**: a sixth rule, and a matching standing instruction in
`config/modules.php`'s own header comment, were added on 2026-09-07 — independently of this story
shipping, so a seventh module does not repeat the mistake while this story is still queued. What this
story still owes is the concrete registry restructuring that sixth rule points at.

**The final grouping, resolved during this story's own Phase 1 debate, deliberately diverges from the PRD
mockup's literal "Productos under CONTENIDO" placement — by explicit product-owner direction, not by
oversight.** The static prototype groups Productos with Blog under one CONTENIDO heading because it never
had to decide between a *catalog* entity and *editorial* content — it is a flat list with two string
dividers (see the `common.js` note below), not a considered taxonomy. This story's decision instead:

- **TIENDA (Store)** holds **Productos** (a cluster: Products, Product Categories, Product Attribute
  Types), **Pedidos** (Orders — a later Epic 3 story, not added by this story) and a new
  **Configuración de tienda** (Store settings) cluster holding **Impuestos** (Sales Regions) and
  **Envíos** (Shipping, later) plus any future store-wide configuration screen — because a product
  catalog, an order queue, and store-wide settings are all "run the store" concerns, the same category
  taxes and shipping already sit in.
- **CONTENIDO (Content)** is reserved for **Blog** and, once it ships, its own
  categories/tags/posts sub-resources — the only genuinely editorial content this app has.

This is **not** a conflict with queued story [`0060-blog-tags-ui.md`](../0060-blog-tags-ui.md) — it *resolves*
the ambiguity that story's own plan left open. See R-2, now recorded as a resolved dependency rather than
an open conflict.

**The nested "Products" and "Store settings" clusters are not themselves part of the design reference —
they extend it, deliberately.** The static prototype's own navigation data
([`docs/arospe-handoff/project/js/common.js`](../../../docs/arospe-handoff/project/js/common.js), the `NAV`
array `mountChrome()` renders) is a **flat** list with plain string dividers — `{ group: 'TIENDA' }`,
`{ group: 'CONTENIDO' }` — inserted between otherwise-equal `{ key, label, href }` entries. There is no
concept of a nested/expandable sub-menu anywhere in that file; "Productos" and "Blog" are rendered as two
flat siblings under "CONTENIDO", exactly like "Impuestos"/"Envíos" under "TIENDA". So the two-level
top-level grouping this story asks for (Dashboard/Users ungrouped, then headed groups) **is** the
prototype's shape and should be read straight from it; the *nesting* of Products/Product Categories/
Product Attribute Types into one cluster, and of Sales Regions/Shipping into a second "Store settings"
cluster, are **product decisions beyond the prototype**, made directly by the project owner because those
screens are facets of one concern each — the same "extends the prototype" relationship
[the PRD](../../../docs/PRD/PRD.md) already uses for every other gap between the mockup and the real, growing
navigation (Roles & Permissions, Payment Methods, Customers, Orders, Store Languages). D-1 through D-4
below are this story's own design for that extension; they are not derivable from `common.js` or the PRD
image, and a future reviewer should not expect to find them there.

## Description

Restructure the sidebar registry and its renderer so the navigation matches the agreed design: two
ungrouped top-level items (Dashboard, Users), the unchanged Settings group (Roles), and a **Store** group
holding two expandable clusters — **Products** (Products, Product Categories, Product Attribute Types) and
**Store settings** (Sales Regions today; Shipping and other store-wide configuration later). **Content is
not declared by this story** — it has no real item yet, and the registry's own convention is to append an
entry when its screen ships, not speculatively (see D-5). Add a `clusters` layer to the registry to express
one level of nesting, keep every existing gating guarantee intact, and rely on the placement rule already
added to `docs/architecture/authorization.md` and `config/modules.php`'s header comment as the standing
guidance this story's own restructuring follows (D-6).

## Type

`frontend | includes database-expert: no`

**Explicitly no backend surface.** No migration, no model, no seeder, no route file, no policy, and **no
permission-catalog change** — every `permissions` value this story moves around (`users.view`,
`sales-regions.view`, `products.view`) is already seeded by
[`RolePermissionSeeder`](../../../database/seeders/RolePermissionSeeder.php) and already enforced by each
route's own `can:` middleware. The change surface is: one config registry, one Blade component, two lang
files, and one test file. (The two documentation locations for the placement rule are **already edited** —
see D-6 — so this story does not touch them again beyond verifying the wording still matches the shipped
schema.)

## Decisions

### D-1 — The registry grows a third flat array, `clusters`; it does not grow nested `children`

`config/modules.php` becomes **three** flat sibling arrays — `groups`, `clusters`, `items` — rather than
nesting a `children` array inside an item. Every consumer and every drift-guard test in
[`tests/Feature/Navigation/SidebarModuleGatingTest.php`](../../../tests/Feature/Navigation/SidebarModuleGatingTest.php)
already assumes `config('modules.items')` is a **flat**, one-level map of `key => entry`, and the
generic guard that set-equates each entry's `permissions` against its route's real `can:` middleware
iterates it directly. A nested `children` array would silently exempt every nested item from that guard
until someone remembered to make it recurse — the exact class of silent gap this story exists to close.

Each item gains two optional keys, `group` and `cluster`, **mutually exclusive and independently
nullable**:

| `group` | `cluster` | Rendering |
| --- | --- | --- |
| `null` | `null` | bare top-level item, no wrapping element (D-2) |
| set | `null` | direct child of that group — today's existing behaviour, unchanged (`roles`) |
| `null` | set | nested inside that cluster, which itself renders inside the cluster's own `group` |

A `clusters` entry carries **no route and no `permissions` of its own** — it is purely presentational (see
Q-1's reasoning, which this generalises to both clusters, not just Products).

Target shape (abbreviated; the file's real inline comments — including the D-6 placement rule already
added — are kept and extended):

```php
'groups' => [
    'store'    => ['heading' => 'navigation.groups.store',    'icon' => 'building-storefront', 'expandable' => false, 'expanded_when' => null, 'class' => null],
    'settings' => ['heading' => 'navigation.groups.settings', 'icon' => 'cog-6-tooth',          'expandable' => true,  'expanded_when' => 'roles.*', 'class' => null],
    // No 'content' entry -- nothing references it yet. Story 0060 adds it alongside its own
    // 'blog' cluster and items, per D-5 below and the sidebar-registry rule in
    // docs/architecture/authorization.md.
],

'clusters' => [
    'products' => [
        'group' => 'store',                                // which top-level group this cluster renders inside
        'label' => 'navigation.clusters.products',
        'icon'  => 'cube',
    ],
    'store_settings' => [
        'group' => 'store',
        'label' => 'navigation.clusters.store_settings',
        'icon'  => 'adjustments-horizontal',
    ],
],

'items' => [
    'dashboard'               => ['group' => null,  'cluster' => null,             /* ... */ 'permissions' => []],
    'users'                   => ['group' => null,  'cluster' => null,             /* ... */ 'permissions' => ['users.view']],
    'roles'                   => ['group' => 'settings', 'cluster' => null,        /* ... */ 'permissions' => ['roles.manage']],
    'products'                => ['group' => null,  'cluster' => 'products',       /* ... */ 'permissions' => ['products.view']],
    'product_categories'      => ['group' => null,  'cluster' => 'products',       /* ... */ 'permissions' => ['products.view']],
    'product_attribute_types' => ['group' => null,  'cluster' => 'products',       /* ... */ 'permissions' => ['products.view']],
    'sales_regions'           => ['group' => null,  'cluster' => 'store_settings', /* ... */ 'permissions' => ['sales-regions.view']],
],
```

Every existing registry constraint still binds and is **not** relaxed by this story: no closures anywhere
(the file must survive `php artisan config:cache` —
[base-standards.md](../../../docs/conventions/base-standards.md#an-app-owned-config-file-is-a-registry-and-must-survive-configcache)),
every `heading`/`label` a translation **key** rather than copy, every registry key `snake_case` on both
sides while `route`/`current_when`/`permissions` values stay kebab-case
([naming.md](../../../docs/conventions/naming.md#translation-keys)), and an entry's `permissions` **exactly**
the ability its route's `can:` middleware enforces.

**Roles is untouched.** The `settings` group and its `roles` item keep their current keys, heading, icon,
`expandable: true` and `expanded_when: 'roles.*'` — it is this repo's only existing nesting precedent and
this story deliberately leaves it as the reference shape rather than rewriting it into a cluster.

**Future items this story does not add, recorded so the next story places them correctly:** `orders`
(Epic 3) becomes a direct `store` item (`group: 'store', cluster: null`), a sibling of the two clusters, not
nested in either. `shipping_zones`/`shipping_carriers` (stories 0033/0034/0035/0037) join the
`store_settings` cluster (`cluster: 'store_settings'`) alongside `sales_regions`. Whether `payment_methods`
(stories 0038/0039) joins `store_settings` too or becomes a direct `store` item is **not decided here** —
flagged as **Q-2** below for whoever picks that story up.

### D-2 — A bare top-level item renders with **no** wrapping group element at all

Dashboard and Users render as plain `<flux:sidebar.item>` elements directly in the sidebar, **not** inside
a `<flux:sidebar.group>` with a `null` heading. Two reasons. First, it matches the mockup exactly — the
PRD shows no heading, not an empty one. Second, it sidesteps having to establish (and then depend on)
whether Flux's `flux:sidebar.group` cleanly omits its heading, its spacing and its `class="grid"` wrapper
when handed a `null` heading; this repo's own [errors-log.md](../../../docs/errors-log.md) records three
separate Flux/Blaze shapes that read as fine in the stub and behaved differently in the rendered DOM.
Rendering nothing is unambiguous.

Consequently the renderer builds **three buckets**, and bare items are excluded from the `groupBy()` call
entirely rather than relying on Laravel's `null`-key bucket behaviour (frontend-expert's Q3, resolved
explicitly).

### D-3 — A cluster's `current`/`expanded` state is **derived** from its children, never declared

The `clusters` entries carry no `expanded_when` key. A cluster is expanded when **any of its currently
visible children** matches `request()->routeIs($child['current_when'])`. Unlike Settings/Roles — one group,
one item, one route family (`roles.*`) — the Products cluster spans **three distinct route-name families**
(`products.*`, `product-categories.*`, `product-attribute-types.*`) and Store settings will eventually span
at least two (`sales-regions.*`, plus shipping's own once it ships), so a hand-maintained `expanded_when`
pattern would need editing every time a new sub-resource joins, and would silently stop expanding when
someone forgot. Deriving it from the children that are already being iterated has no drift surface at all.
This also means `clusters` entries have one fewer key than `groups` entries, which is intentional and
worth a comment in the file.

### D-4 — Store groups every "run the store" concern; Content is reserved for editorial material

Restated from the intro, as the decision it actually is: **Products moves from the flat `platform` group
into a `products` cluster inside `store`**, alongside a new **`store_settings`** cluster holding
**Sales Regions** (today) and, later, Shipping and any other store-wide configuration screen. `orders`
(not yet built) is planned as a **direct** `store` item once its own story ships — a sibling of the two
clusters, not nested in either, since an order queue is not a "configuration" screen the way taxes/shipping
are, nor a catalog-entity family the way Products/Categories/Attribute Types are.

The `taxes` group key is retired (not merely renamed) — its one item, `sales_regions`, now nests inside
`store_settings` rather than sitting as a direct `store` child, because Impuestos and Envíos are the same
*kind* of thing (store-wide configuration) and belong grouped together rather than as bare siblings of
Productos. `groups.taxes` and `groups.platform` are both removed from both lang files in the same change,
per the registry-mirroring rule.

**Content is deliberately not created by this story** (see D-5) — Blog is the first and, for now, only
thing that belongs there, and it does not exist yet.

### D-5 — `groups.content` is not declared by this story; it is story 0060's to add

The registry's own convention — "a later epic appends data when its screen ships, not speculatively" — is
about items, but the same reasoning applies to a top-level group with zero members: an empty `content`
group entry renders nothing today (per the vanish-when-empty rule) and serves no purpose until something
references it. Declaring it now would be exactly the kind of premature scaffolding this codebase's
registry conventions avoid elsewhere. **Story [`0060-blog-tags-ui.md`](../0060-blog-tags-ui.md) — or whichever
Blog story ships first — adds `groups.content` together with a `blog` cluster (`group: 'content'`) holding
its own sub-resources (tags, categories, posts) as they ship**, following the placement rule this story's
own D-6 already put in both documentation locations. This is what resolves R-2: there is no fourth
top-level group to invent and no ambiguity about where Blog goes — it is Content's first and, for a while,
only occupant.

### D-6 — The durable placement rule: already added, in exactly two locations

Unlike the decisions above, **this was not deferred to this story's own implementation** — it was added on
2026-09-07, ahead of this story reaching Phase 3, specifically so no module shipping in the meantime
repeats the mistake:

1. **[`docs/architecture/authorization.md`](../../../docs/architecture/authorization.md)** — "The second half
   of a module gate: the sidebar registry" section carries a **sixth rule**: *a new registry entry must be
   placed under the top-level group the PRD's navigation design assigns it to, and when it is a
   **sub-resource** of an existing module it must be nested under that module's cluster rather than added
   as a flat sibling — a flat top-level placement is a decision to be justified, never the default.*
2. **[`config/modules.php`](../../../config/modules.php)'s own header comment** — the same rule, stated as a
   standing instruction to whoever next opens this file to append an entry.

This story's own job regarding those two locations is narrower than "add them": **verify, once the schema
above ships, that both locations' wording and any example they cite still match the real `groups`/
`clusters`/`items` shape** (they were written to be schema-agnostic on purpose, so this should be a
no-op check, not a rewrite) — and to qualify the authorization page's existing ✅ notes that celebrate flat
`platform` placement, which the rule addition itself did not yet touch.

## Gherkin

```gherkin
Feature: Sidebar navigation grouping and sub-resource nesting

  Scenario: The top-level items render with no group heading above them
    Given a store administrator signed in to the dashboard
    When the administrator loads the dashboard page
    Then the "Inicio" and "Usuarios" sidebar links render at the top of the sidebar with no group heading element wrapping them

  Scenario: The Store group renders the Products cluster and its three sub-resources
    Given a catalog administrator holding the "products.view" permission
    When the administrator loads the dashboard page
    Then the sidebar renders a translated "Store" group heading containing an expandable "Products" cluster whose children are the Products, Product Categories and Product Attribute Types links

  Scenario: The Store group renders the Store settings cluster with Sales Regions inside it
    Given a store administrator holding the "sales-regions.view" permission
    When the administrator loads the dashboard page
    Then the sidebar renders the "Store" group heading containing an expandable "Store settings" cluster whose child is the Sales Regions link

  Scenario: An administrator without any products permission sees neither the Products cluster nor an otherwise-empty Store group
    Given an administrator holding "sales-regions.view" but no products-family permission
    When the administrator loads the dashboard page
    Then the sidebar renders the "Store" group heading with only the "Store settings" cluster inside it, and no "Products" cluster at all

  Scenario: An administrator with neither products nor sales-regions permission sees no Store group at all
    Given an administrator holding "users.view" only
    When the administrator loads the dashboard page
    Then the sidebar renders no "Store" group heading and no cluster beneath it

  Scenario: Visiting a nested sub-resource page expands and highlights its cluster
    Given a catalog administrator holding the "products.view" permission
    When the administrator opens the Product Categories page
    Then the "Products" cluster renders expanded with the "Product Categories" link marked as current

  Scenario: A cluster holding exactly one visible child still renders as a cluster
    Given a store administrator holding only the "sales-regions.view" permission among the Store settings items
    When the administrator loads the dashboard page
    Then the "Store settings" cluster heading and its disclosure control still render, rather than Sales Regions appearing as a flat item

  Scenario: The Roles entry is unaffected by the restructuring
    Given an administrator holding the "roles.manage" permission
    When the administrator opens the Roles & permissions page
    Then the "Settings" group renders expanded with the "Roles & permissions" link marked as current, exactly as before this change
```

## Files to create/modify

- **`config/modules.php`** — add the `clusters` array (`products`, `store_settings`); add `group`/`cluster`
  keys to every item; retire `groups.taxes` and `groups.platform`; add `groups.store`; move `products`,
  `product_categories` and `product_attribute_types` from `group: 'platform'` to `cluster: 'products'`;
  move `sales_regions` from `group: 'taxes'` to `cluster: 'store_settings'`; set `dashboard` and `users` to
  `group: null, cluster: null`. **Do not** add a `content` group or a `blog` cluster (D-5). No closures, no
  literal copy. The D-6 placement rule in the header comment is already present — verify it still reads
  correctly against the shipped schema, extend only if it has gone stale.
- **`resources/views/components/sidebar-nav.blade.php`** — replace the single `groupBy('group')` pass with
  three buckets: bare items (no wrapper, D-2), direct group children (unchanged shape), and clusters
  rendered as a nested `<flux:sidebar.group expandable>` inside their parent group's slot with
  `data-test="sidebar-cluster-{key}"` and a **derived** `:expanded` (D-3). The filter-before-group order
  must be preserved and extended one level: a cluster with zero visible children renders nothing at all,
  and a top-level group with zero direct visible items **and** zero non-empty clusters renders nothing at
  all (heading included) — this is now exercised on day one by the Store group, which has two clusters and
  no direct items, so a role holding neither `products.view` nor `sales-regions.view` must see no Store
  heading at all.
- **`lang/en/navigation.php`** — add `groups.store`, `clusters.products`, `clusters.store_settings`; remove
  `groups.taxes` and `groups.platform`.
- **`lang/es/navigation.php`** — the same leaves, key-for-key identical to the English file.
- **`tests/Feature/Navigation/SidebarModuleGatingTest.php`** — extend (never weaken) with the new cases
  below, including a registry drift-guard asserting that every item's non-null `cluster` exists in
  `config('modules.clusters')` and every cluster's `group` exists in `config('modules.groups')`.

Flagged, **not** edited by this story (already correct, or owned elsewhere):

- **`docs/architecture/authorization.md`** and **`config/modules.php`'s header comment** — the D-6
  placement rule is already shipped in both; this story only verifies it still matches once the schema
  above lands (see D-6).
- **`docs/api/routes.md`** — *flag for docs-keeper (Phase 6)*: its `sales-regions.index` subsection quotes
  the retired `groups.taxes` / `items.sales_regions` registry entry verbatim, so this story's rename makes
  that quote stale. It is a documentation sync, owned by the Phase 6 pass, not a file this story edits
  directly. (It already carries a forward pointer to this story and to the sixth rule, added alongside D-6.)
- **`docs/conventions/naming.md`** — *flag for docs-keeper (Phase 6)*: its registry-mirroring example quotes
  `config/modules.php` as having `groups.platform`/`groups.settings`/`groups.taxes` and `items.dashboard`/
  `items.users`/`items.roles`/`items.sales_regions` — all four superseded by this story's schema. Phase 2's
  own INVEST pass flagged this gap explicitly (found before, not caught by, the review) — do not miss it a
  second time.
- **`ai-spec/tasks/0060-blog-tags-ui.md`** — see R-2. Not edited here; it now has an unambiguous target
  (`groups.content` + a `blog` cluster) to aim for when it is picked up.

### `data-test` hooks

| Hook | Status | Notes |
| --- | --- | --- |
| `sidebar-link-{item_key}` | unchanged | must keep working identically for bare, grouped **and** cluster-nested items |
| `sidebar-group-{group_key}` | unchanged shape, new keys | `store`, `settings`; `platform` and `taxes` disappear |
| `sidebar-cluster-{cluster_key}` | **new** | `sidebar-cluster-products`, `sidebar-cluster-store_settings`; deliberately a distinct prefix so a test can tell a cluster from a top-level group |

## Tests to perform

**1. Structural rendering**
- [ ] Dashboard and Users render with no `sidebar-group-*` wrapper around their links.
- [ ] The "Store" heading renders (translated, not the raw config key) containing both the Products and
      Store settings clusters.
- [ ] Group order is stable (ungrouped → Store → Settings), independent of PHP array insertion order
      accidents; within Store, Products cluster precedes Store settings cluster.
- [ ] No `content` group or `blog` cluster exists in the registry yet (a guard against this story
      accidentally pre-declaring what D-5 explicitly defers to 0060).

**2. The nesting mechanism**
- [ ] Each cluster renders its own `data-test="sidebar-cluster-{key}"` hook, distinguishable from a
      top-level `sidebar-group-*` hook.
- [ ] All of a cluster's children render their own hooks **nested inside** it, not as its siblings.
- [ ] Both new clusters use the same nesting primitive/markup pattern as the existing Roles-under-Settings
      disclosure (reference shape).
- [ ] A cluster with zero visible children renders no heading and no disclosure control — not an empty
      expandable.
- [ ] A cluster with exactly one visible child still renders the cluster wrapper (does not collapse into
      looking like a flat item) — exercised for real by Store settings today (one item, Sales Regions),
      not only as a hypothetical.

**3. Permission gating × nesting**
- [ ] A role holding `products.view` sees the Products cluster with all three children.
- [ ] A role holding `sales-regions.view` sees the Store settings cluster with Sales Regions inside it.
- [ ] A role holding neither `products.view` nor `sales-regions.view` sees **no Store heading at all** —
      the two-level vanish rule is now testable immediately (Store has two clusters and zero direct
      items), no fixture faking or deferral needed.
- [ ] A role holding exactly one of the two permissions sees the Store heading with only the matching
      cluster inside it — the other cluster, and only the other cluster, is absent.
- [ ] Each child is gated by evaluating **its own** `permissions` entry independently rather than
      inheriting its cluster's or a sibling's decision — prove it by overriding one child's permissions in
      the test fixture, even though the Products family shares `products.view` in production.
- [ ] `permissions: []` on a bare top-level item still means always-visible, branched explicitly rather
      than handed to `Gate::any([])`.
- [ ] A Super Admin sees both clusters and every child regardless of any permission entry.

**4. No regression**
- [ ] Both existing generic drift guards still pass, extended to recurse into cluster children:
      `permissions` set-equals the route's real `can:` middleware, and Gate-based visibility.
- [ ] `current_when` highlighting is unaffected for every existing shipped item.
- [ ] Roles under Settings is unaffected — same expandable mechanism, same auto-expand on `roles.*`, same
      hooks.
- [ ] The file's existing per-entry assertions re-run byte-for-byte in intent as the regression gate.

**5. Route highlighting / auto-expand for nested children**
- [ ] Visiting `product-categories.index` auto-expands the Products cluster (union of children's
      `current_when`, derived per D-3).
- [ ] Visiting `sales-regions.index` auto-expands the Store settings cluster the same way.
- [ ] On `product-attribute-types.index` the current child is visually marked current, not merely expanded
      with nothing highlighted.
- [ ] Landing on `products.index` expands and highlights correctly, per whichever answer Q-1 gets.
- [ ] Navigating away to Dashboard collapses/un-highlights both clusters **if** the expand state is
      route-driven; note as manual/out-of-scope if it turns out to depend on client-side Alpine state a
      Feature test cannot observe.

**6. Silent-drop / typo risk**
- [ ] An item referencing a non-existent `cluster` key fails a config-validation-style assertion loudly,
      rather than silently vanishing from the sidebar.
- [ ] A cluster whose `group` key matches no real group fails the same way.
- [ ] Catch-all: for a Super Admin actor (bypasses all permission filtering), the count of rendered bare
      items + rendered direct group children + rendered cluster children equals
      `count(config('modules.items'))` — one assertion catching any dangling or mistyped key at either
      level.
- [ ] `php artisan config:cache` still succeeds against the new schema (proves no closure was introduced).

## Expected outcome

The sidebar reads as the agreed design: Inicio and Usuarios sit bare at the top with no heading; a
**Store** group holds an expandable **Products** cluster (Products, Categories, Attribute Types) and an
expandable **Store settings** cluster (Sales Regions today, ready for Shipping and Payment Methods);
Roles & permissions is untouched under Settings; **Content does not render at all yet**, because nothing
populates it — and it has a clear, conflict-free home waiting for Blog. Every existing permission gate,
`data-test` hook and vanish-when-empty guarantee behaves identically, now one level deeper and exercised
immediately by Store's two clusters. The next contributor adding a module reads the placement rule that is
already in both `config/modules.php` and the authorization doc, instead of defaulting to a flat entry.

## Acceptance criteria

- [ ] `config/modules.php` carries three flat arrays (`groups`, `clusters`, `items`) with mutually
      exclusive nullable `group`/`cluster` keys per item, no closures, and translation keys only.
- [ ] Dashboard and Users render with no wrapping group element (not a null-heading group).
- [ ] `groups.taxes` and `groups.platform` no longer exist anywhere (config, both lang files, tests).
- [ ] A `store` group exists holding exactly two clusters — `products` (Products, Product Categories,
      Product Attribute Types) and `store_settings` (Sales Regions) — and no direct items of its own yet.
- [ ] No `content` group and no `blog` cluster exist yet (D-5) — confirmed by an explicit test, not merely
      by omission.
- [ ] Each cluster's expanded/current state is derived from its visible children's `current_when` values,
      with no separately-maintained route pattern anywhere in the registry.
- [ ] A cluster with no visible children renders nothing; the Store group with no visible clusters renders
      nothing, heading included.
- [ ] Every item's `permissions` value still set-equals its route's real `can:` middleware, verified by the
      existing drift guard extended to recurse into cluster children.
- [ ] `data-test="sidebar-link-{key}"` still resolves for every item at every nesting depth, and
      `data-test="sidebar-cluster-{key}"` resolves for both clusters.
- [ ] `docs/architecture/authorization.md` and `config/modules.php`'s header comment still accurately
      describe the shipped schema (they were added ahead of this story per D-6 — this criterion is a
      verification, not a first-time addition).
- [ ] `php artisan config:cache` succeeds; `lang/en/navigation.php` and `lang/es/navigation.php` are
      key-for-key identical.

## Definition of Done

- [ ] Tests written and green — the existing `SidebarModuleGatingTest.php` assertions pass unmodified in
      intent (pure regression), **plus** new coverage for the bare-top-level, dual-cluster-nesting,
      immediate two-level-vanish, derived-expand and cluster/group drift-guard cases.
- [ ] The nested-disclosure rendering (R-1) is verified **by execution** against the real page, not by
      reading the Flux stub — and it is now exercised **twice** (Products and Store settings both nested
      inside the same Store group), which is a stronger proof than the single-cluster case originally
      planned.
- [ ] `docs/architecture/authorization.md`'s and `config/modules.php`'s D-6 wording is re-checked against
      the shipped schema (already added; verify, don't re-add) and the authorization page's existing
      "flat `platform` placement was cheap" ✅ notes are qualified rather than left standing.
- [ ] `docs/api/routes.md`'s stale `groups.taxes` quote is updated or flagged to `docs-keeper` for the
      Phase 6 sync.
- [ ] R-2 is confirmed resolved (not merely "recorded") once this story ships: `0060-blog-tags-ui.md` (or
      whichever Blog story lands first) targets `groups.content` + a `blog` cluster, per D-5.
- [ ] Code reviewed (`code-reviewer`).
- [ ] No security findings (`appsec-auditor`).
- [ ] Documentation updated (`docs-keeper`).
- [ ] All three quality gates run **unscoped** and recorded, per
      [base-standards.md](../../../docs/conventions/base-standards.md#quality-gates): `php artisan test`,
      `vendor/bin/pint --format agent`, `vendor/bin/phpstan analyse`.
- [ ] Acceptance criteria met.

## Risks / open technical questions

**R-1 — A disclosure nested inside a disclosure has never been rendered in this app; verify by execution.**
Flux's `<flux:sidebar.group>` slot is a plain `{{ $slot }}`, so nesting one inside another is structurally
possible with no new dependency — but today's only nesting is one level deep (Settings → Roles), and this
story puts **two** `expandable` groups inside one top-level group's slot side by side. Whether nested
`<ui-disclosure>` elements keep distinct toggle state and do not cross-wire their chevrons, especially with
two siblings at the same nesting depth, **must be confirmed against the real rendered DOM**, not from the
vendor stub. This repo's [errors-log.md](../../../docs/errors-log.md) records at least three Flux/Blaze shapes
that read correctly in source and behaved differently once compiled (`@disabled` inside a Flux tag, two
`@directive()` calls in one attribute string, a `flux:fieldset` swallowing an auto-rendered error). If
nested disclosures do not behave, the fallback is a non-expandable cluster (a plain nested group with a
heading), which still satisfies every grouping acceptance criterion and only loses the collapse
affordance — decide that at Phase 3, do not force the expandable shape.

**R-2 — RESOLVED: no conflict with queued story [`0060-blog-tags-ui.md`](../0060-blog-tags-ui.md).** That
story currently plans a brand-new top-level `groups.blog` entry. This story's own design (D-4/D-5) removes
the ambiguity that plan was written against: Products moves to Store, so Content is free to be exactly
what Blog needs — `0060` (or whichever Blog story ships first) should add `groups.content` **and** a
`blog` cluster (`group: 'content'`) nested inside it, following the same shape this story establishes for
`products`/`store_settings`, rather than a flat top-level `groups.blog`. **This story does not edit 0060.**
Recorded here so whoever picks it up next targets the resolved placement instead of the older plan.

**R-3 — The `platform` and `taxes` group keys disappear.** Any test, doc or fixture asserting
`data-test="sidebar-group-platform"` or `sidebar-group-taxes` breaks. Grep for both before Phase 3 and
convert each hit deliberately; a group hook silently not matching is exactly the kind of assertion that
can be "fixed" into vacuity.

**Q-1 — RESOLVED (a): `products.index` is just another cluster child, not the cluster's own "home" link.**
Two readable designs were considered: (a) the cluster heading is inert and Products is one of three equal
children, or (b) the cluster heading itself links to `products.index` and only Categories/Attribute Types
are children. **(a)** is the design D-1's schema, D-3's derivation and the category-6 drift guard already
assume — `clusters` entries carry no `route` key and no `can:`-equivalence obligation of their own, which
keeps a cluster from becoming a second thing that needs a permission entry. Phase 3's category-5 assertions
must be written against (a): the cluster heading itself is never `:current`, and clicking it (if it is even
clickable) does nothing — only its three children are real links.

**Q-2 — Where does Payment Methods (stories 0038/0039) land?** The user's own direction named Impuestos and
Envíos, plus "whatever else relates to store configuration," for the `store_settings` cluster — Payment
Methods is a plausible third member, but it was not named explicitly and is not decided here. Whoever picks
up the Payment Methods UI story should re-derive this against the shipped `store`/`store_settings` shape
rather than guessing; either placement (a third `store_settings` child, or a direct `store` item alongside
the future `orders` item) is consistent with D-4's reasoning.

## Out of scope

- Any backend change whatsoever: migrations, models, routes, policies, seeders, the permission catalog.
- Adding a `shipping_zones`/`shipping_carriers` sidebar entry — stories 0033/0035 shipped shipping
  backend-only, and their UI stories (0034/0037) own their own registry entries. This story only leaves the
  `store_settings` cluster ready to receive them, per D-1's forward note.
- Adding an `orders` sidebar entry — Epic 3, not yet built. This story only records its intended placement
  (a direct `store` item) in D-4.
- Adding a `payment_methods` sidebar entry — see Q-2.
- Adding a `content` group or a `blog` cluster/items — see D-5 and R-2; that is Blog's own story.
- Changing `resources/views/layouts/app/sidebar.blade.php`, which renders `<x-sidebar-nav />` and has not
  needed an edit for six consecutive module additions; if this story has to touch it, that is a signal the
  design drifted and should be re-reviewed.
- Any change to the Roles/Settings group's own keys, heading, icon or expand behaviour.
- Mobile/responsive sidebar behaviour, user-toggled (client-persisted) expand state, and reordering
  controls — none is asked for by the PRD or this story.
