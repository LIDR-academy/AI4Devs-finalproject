{{--
    Story 0013 -- the module-gated sidebar navigation. Anonymous component
    (no companion PHP class), matching this layout's existing anonymous-
    component precedent (x-app-logo, x-desktop-user-menu).

    Reads config('modules.items'), filters by the empty-permissions-or-Gate::any()
    rule below, groups the survivors by their `group` key, then renders a
    <flux:sidebar.group> only for a config('modules.groups') key that
    actually has at least one surviving item.

    Filter first, group second: collect(...)->filter(...)->groupBy('group')
    structurally cannot produce a group key with zero members, since groupBy()
    only creates a bucket for items that survived the filter. This is what
    makes an emptied group's heading disappear entirely rather than render
    empty -- see docs/architecture/authorization.md and the task file's
    "Settings group renders no heading at all" scenario.

    `permissions: []` means "always visible" and is checked explicitly, never
    passed straight to Gate::any() -- Gate::any() iterates the array and
    returns false when it is empty (nothing to iterate to true), which would
    make the Dashboard entry disappear for everyone.

    Gate::any() (via canAny()'s underlying mechanism), never hasAnyPermission():
    every Spatie permission name is already a valid Gate ability
    (register_permission_check_method => true in config/permission.php), so
    Gate::any() runs the whole Gate::before chain and inherits the Super Admin
    bypass for free. hasAnyPermission() is a trait method that queries the
    model's own relations directly and never touches the Gate -- since the
    Super Admin holds zero permission rows, a sidebar built on
    hasAnyPermission() would show the Super Admin nothing, the exact inverse
    of the requirement.
--}}
@php
    // groupBy()'s second argument (preserveKeys) is mandatory here -- without
    // it, each group's members are reindexed 0, 1, 2..., which would render
    // data-test="sidebar-link-0" instead of the item's own registry key
    // (e.g. "sidebar-link-dashboard").
    $groupedItems = collect(config('modules.items'))
        ->filter(fn (array $item): bool => empty($item['permissions']) || \Illuminate\Support\Facades\Gate::any($item['permissions']))
        ->groupBy('group', preserveKeys: true);
@endphp

@foreach (config('modules.groups') as $groupKey => $group)
    @if ($groupedItems->has($groupKey))
        <flux:sidebar.group
            :heading="__($group['heading'])"
            :icon="$group['icon']"
            :expandable="$group['expandable']"
            :expanded="$group['expanded_when'] !== null ? request()->routeIs($group['expanded_when']) : true"
            :class="$group['class']"
            data-test="sidebar-group-{{ $groupKey }}"
        >
            @foreach ($groupedItems[$groupKey] as $itemKey => $item)
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
    @endif
@endforeach
