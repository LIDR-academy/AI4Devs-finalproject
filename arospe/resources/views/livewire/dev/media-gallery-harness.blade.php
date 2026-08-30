{{--
    TEMPORARY SCAFFOLDING for story 0020's own browser tests (D16). Reachable
    only through the environment-gated `dev.media-gallery-harness` route
    (routes/web.php). NOT app surface -- deleted, together with that route
    and App\Livewire\Dev\MediaGalleryHarness, by story 0027 once the product
    editor supplies a real host page for App\Livewire\Media\Gallery.

    Embeds TWO independent gallery instances -- single-select and
    multi-select, each under its own consumer-supplied `select-event` --
    which is what makes the re-entrancy acceptance criterion (D2/V3)
    testable: confirming one instance's selection must update only its own
    listener's rendered output below, never the other instance's.

    Per D12, the consumer decides whether the embedded child renders at all
    -- both `<livewire:media.gallery>` tags below are wrapped in
    `@can('viewAny', \App\Models\Media::class)`, matching the pattern a real
    host page must follow.
--}}
<div class="flex flex-col gap-8 p-8">
    <flux:heading size="xl">Media gallery harness (dev only)</flux:heading>

    <div class="flex flex-col gap-2" data-test="harness-single-instance">
        <flux:heading size="lg">Single-select instance</flux:heading>

        <div>
            <flux:button data-test="harness-open-single" wire:click="openSingle">
                Open single-select gallery
            </flux:button>
        </div>

        {{-- What the single-select instance's #[On] listener last received,
        rendered so a browser test can assert on the real dispatch outcome
        without inspecting the network/console. --}}
        <div data-test="harness-single-result">
            @forelse ($singleSelected as $item)
                <p data-test="harness-single-result-item">{{ $item['id'] }} — {{ $item['title'] }}</p>
            @empty
                <p data-test="harness-single-result-empty">(none)</p>
            @endforelse
        </div>

        @can('viewAny', \App\Models\Media::class)
            <livewire:media.gallery
                wire:model="showSingle"
                wire:key="harness-single-gallery"
                :multi="false"
                select-event="harness-single-selected"
            />
        @endcan
    </div>

    <div class="flex flex-col gap-2" data-test="harness-multi-instance">
        <flux:heading size="lg">Multi-select instance</flux:heading>

        <div>
            <flux:button data-test="harness-open-multi" wire:click="openMulti">
                Open multi-select gallery
            </flux:button>
        </div>

        {{-- What the multi-select instance's #[On] listener last received --
        independent of the single-select block above (the re-entrancy proof,
        D2/V3). --}}
        <div data-test="harness-multi-result">
            @forelse ($multiSelected as $item)
                <p data-test="harness-multi-result-item">{{ $item['id'] }} — {{ $item['title'] }}</p>
            @empty
                <p data-test="harness-multi-result-empty">(none)</p>
            @endforelse
        </div>

        @can('viewAny', \App\Models\Media::class)
            <livewire:media.gallery
                wire:model="showMulti"
                wire:key="harness-multi-gallery"
                :multi="true"
                select-event="harness-multi-selected"
            />
        @endcan
    </div>
</div>
