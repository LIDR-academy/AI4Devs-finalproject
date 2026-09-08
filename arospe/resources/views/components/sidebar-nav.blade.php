{{--
    Story 0013 -- the module-gated sidebar navigation. Anonymous component
    (no companion PHP class), matching this layout's existing anonymous-
    component precedent (x-app-logo, x-desktop-user-menu).

    Story 0080 extends it with one level of nesting (config('modules.clusters')):
    the renderer now builds THREE buckets instead of one group-by pass --

      1. Bare top-level items (`group` === null AND `cluster` === null, D-2):
         no wrapping element at all, rendered ahead of every grouped/
         clustered item.
      2. Direct children of a top-level group (`group` !== null, `cluster`
         === null): the pre-0080 shape, unchanged.
      3. Items nested inside a cluster (`cluster` !== null): rendered as a
         SECOND, nested <flux:sidebar.group expandable> inside its parent
         group's own slot, using the identical open/collapsed disclosure
         primitive the existing Settings/Roles group already uses (D-3's
         "reference shape") -- verified by execution against the real
         rendered DOM, not merely read off the Flux stub, since a group's
         own `expandable`/`icon` combination renders TWICE (once inside its
         <ui-disclosure>, once inside a collapsed-desktop <flux:dropdown>
         fallback -- vendor/livewire/flux/stubs/resources/views/flux/
         sidebar/group.blade.php) and `<ui-disclosure>`'s own JS
         (vendor/livewire/flux/dist/flux-lite.min.js) resolves its trigger
         button and content panel via `this.querySelector(...)` /
         `this.lastElementChild` -- scoped to that ONE element's own
         subtree, not document-wide -- so two sibling clusters (Products,
         Store settings), both `<ui-disclosure>` elements sitting inside the
         same NON-expandable `store` group (a plain <div>, never a further
         <ui-disclosure>), never cross-wire.

    `permissions: []` means "always visible" and is checked explicitly, never
    passed straight to Gate::any() -- Gate::any() iterates the array and
    returns false when it is empty (nothing to iterate to true), which would
    make the Dashboard entry disappear for everyone. This rule applies
    identically to a bare item, a direct group child, and a cluster child --
    the SAME filter runs once over the whole flat config('modules.items')
    list before any bucket is decided (D-1 keeps `items` flat specifically so
    one filter pass covers every nesting depth).

    Gate::any() (via canAny()'s underlying mechanism), never hasAnyPermission():
    every Spatie permission name is already a valid Gate ability
    (register_permission_check_method => true in config/permission.php), so
    Gate::any() runs the whole Gate::before chain and inherits the Super Admin
    bypass for free. hasAnyPermission() is a trait method that queries the
    model's own relations directly and never touches the Gate -- since the
    Super Admin holds zero permission rows, a sidebar built on
    hasAnyPermission() would show the Super Admin nothing, the exact inverse
    of the requirement.

    Filter first, group/cluster second, exactly as before: a cluster with
    zero visible children is never rendered (its own heading included), and a
    top-level group with zero visible direct children AND zero non-empty
    clusters is never rendered either (heading included) -- this is what
    makes the `store` group (two clusters, no direct items of its own)
    disappear entirely for a role holding neither `products.view` nor
    `sales-regions.view`, per D-1/D-4.

    A cluster's own expand/`current`-highlight state is DERIVED, never
    declared (D-3): a cluster is expanded when ANY of its currently visible
    children matches `request()->routeIs($item['current_when'])`. The
    cluster's own disclosure element itself is never marked `data-current` --
    `clusters` entries carry no `route`/`current_when` of their own (Q-1,
    resolved (a): a cluster's own heading is inert, never a "home" link for
    one of its equally-weighted children).
--}}
@php
    // groupBy()'s second argument (preserveKeys) is mandatory here -- without
    // it, each bucket's members are reindexed 0, 1, 2..., which would render
    // data-test="sidebar-link-0" instead of the item's own registry key
    // (e.g. "sidebar-link-dashboard").
    $visibleItems = collect(config('modules.items'))
        ->filter(fn (array $item): bool => empty($item['permissions']) || \Illuminate\Support\Facades\Gate::any($item['permissions']));

    // Phase 4 audit finding F-1: `group`/`cluster` are documented as mutually
    // exclusive (the file header, D-1), but that was enforced only by a test
    // -- an item setting both landed in both buckets and rendered twice,
    // duplicating its data-test hook. Bucket 2's own filter now enforces the
    // exclusivity structurally, matching bucket 1's `&& $item['cluster'] === null`.
    //
    // Phase 4 audit finding F-2: read via `?? null` rather than direct array
    // access -- a config entry missing either key (a typo dropping the line
    // entirely, not merely the value) previously threw `Undefined array key`,
    // rethrown by Laravel as an ErrorException 500 on every authenticated
    // page, since the sidebar renders on every one of them. The
    // `toHaveKeys(['group', 'cluster'])` drift-guard test still catches a
    // missing key in CI; this is defence-in-depth on top of it, not a
    // replacement for it.
    $bareItems = $visibleItems->filter(
        fn (array $item): bool => ($item['group'] ?? null) === null && ($item['cluster'] ?? null) === null
    );

    $groupedItems = $visibleItems
        ->filter(fn (array $item): bool => ($item['group'] ?? null) !== null && ($item['cluster'] ?? null) === null)
        ->groupBy('group', preserveKeys: true);

    $clusteredItems = $visibleItems
        ->filter(fn (array $item): bool => ($item['cluster'] ?? null) !== null)
        ->groupBy('cluster', preserveKeys: true);
@endphp

{{-- Bucket 1: bare top-level items, no wrapper (D-2). --}}
@foreach ($bareItems as $itemKey => $item)
    <flux:sidebar.item
        :icon="$item['icon']"
        :href="route($item['route'])"
        :current="request()->routeIs($item['current_when'])"
        wire:navigate
        data-test="sidebar-link-{{ $itemKey }}"
    >
        {{ __($item['label']) }}
    </flux:sidebar.item>
@endforeach

@foreach (config('modules.groups') as $groupKey => $group)
    @php
        $directChildren = $groupedItems->get($groupKey, collect());
        $groupClusters = collect(config('modules.clusters', []))
            ->filter(fn (array $cluster, string $clusterKey): bool => ($cluster['group'] ?? null) === $groupKey && $clusteredItems->has($clusterKey));
    @endphp
    @if ($directChildren->isNotEmpty() || $groupClusters->isNotEmpty())
        <flux:sidebar.group
            :heading="__($group['heading'])"
            :icon="$group['icon']"
            :expandable="$group['expandable']"
            :expanded="$group['expanded_when'] !== null ? request()->routeIs($group['expanded_when']) : true"
            :class="$group['class']"
            data-test="sidebar-group-{{ $groupKey }}"
        >
            {{-- Bucket 2: direct children of this group -- unchanged shape. --}}
            @foreach ($directChildren as $itemKey => $item)
                <flux:sidebar.item
                    :icon="$item['icon']"
                    :href="route($item['route'])"
                    :current="request()->routeIs($item['current_when'])"
                    wire:navigate
                    data-test="sidebar-link-{{ $itemKey }}"
                >
                    {{ __($item['label']) }}
                </flux:sidebar.item>
            @endforeach

            {{-- Bucket 3: clusters belonging to this group, nested one level deeper. --}}
            @foreach ($groupClusters as $clusterKey => $cluster)
                @php
                    $clusterChildren = $clusteredItems[$clusterKey];
                    $clusterExpanded = $clusterChildren->contains(fn (array $item): bool => request()->routeIs($item['current_when']));
                @endphp
                <flux:sidebar.group
                    :heading="__($cluster['label'])"
                    :icon="$cluster['icon']"
                    expandable
                    :expanded="$clusterExpanded"
                    data-test="sidebar-cluster-{{ $clusterKey }}"
                >
                    @foreach ($clusterChildren as $itemKey => $item)
                        <flux:sidebar.item
                            :icon="$item['icon']"
                            :href="route($item['route'])"
                            :current="request()->routeIs($item['current_when'])"
                            wire:navigate
                            data-test="sidebar-link-{{ $itemKey }}"
                        >
                            {{ __($item['label']) }}
                        </flux:sidebar.item>
                    @endforeach
                </flux:sidebar.group>
            @endforeach
        </flux:sidebar.group>
    @endif
@endforeach
