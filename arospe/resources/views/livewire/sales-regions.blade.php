<div>
    {{-- Placeholder view for App\Livewire\SalesRegions\Index — the real markup (region table,
    edit modal, enable/disable and default-swap controls) is sibling story 0018's. This story is
    backend-only and needs the component to mount and render without error, matching the
    identical placeholder story 0004 shipped for resources/views/livewire/users.blade.php. The
    app shell (sidebar/header) wraps this automatically, matching every other full-page Livewire
    component in resources/views/livewire/settings/**. --}}
    <p>{{ count($regions) }}</p>
</div>
