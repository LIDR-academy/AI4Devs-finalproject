<div>
    {{-- Placeholder view for App\Livewire\Users\Index — the real markup (list table,
    create/edit modal, delete confirmation) is sibling story 0006's. This story is
    backend-only and needs the component to mount and render without error. The app
    shell (sidebar/header) wraps this automatically, matching every other full-page
    Livewire component in resources/views/livewire/settings/**. --}}
    <p>{{ __('users.index.summary', ['total' => $this->usersSummary['total'], 'active' => $this->usersSummary['active']]) }}</p>
</div>
