{{--
    TEMPORARY SCAFFOLDING for story 0020's own browser tests (D16), EXTENDED
    by story 0021 (D13/OQ-1) to also host a WysiwygEditor instance for its
    own browser tests. Reachable only through the environment-gated
    `dev.media-gallery-harness` route (routes/web.php). NOT app surface --
    deleted, together with that route and App\Livewire\Dev\MediaGalleryHarness,
    by story 0027 once the product editor supplies a real host page for BOTH
    App\Livewire\Media\Gallery and App\Livewire\Components\WysiwygEditor.

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

    {{-- Story 0021 D13/OQ-1: TWO independent WysiwygEditor instances -- not one -- because a
    single instance cannot exercise D5's re-entrancy acceptance criterion at all ("Two editors on
    one screen never receive each other's image"): confirming an image from the FIRST editor's
    gallery must dispatch only to the first editor's own per-instance-unique galleryEvent listener,
    never the second's. Each is seeded with its own known BEFORE/AFTER fragment pair
    (App\Livewire\Dev\MediaGalleryHarness::$editorValue / $secondEditorValue) so a test can place
    the caret between them and assert the confirmed image lands there rather than merely somewhere
    in the document (D6's positional acceptance criterion), AND -- for the second instance
    specifically -- assert it did NOT land there when the image was confirmed from the OTHER
    editor's gallery. This is the ONLY place in the app embedding the editor without a route of its
    own to give it (0021's real consumers, the product/blog editors, are 0027/Epic 4 and do not
    exist yet) -- do not treat this as a precedent for how a real consumer embeds it, only as
    scaffolding to reach it at all. --}}
    <div class="flex flex-col gap-2" data-test="harness-editor-instance">
        <flux:heading size="lg">WysiwygEditor instance (first)</flux:heading>

        <livewire:components.wysiwyg-editor
            wire:model="editorValue"
            wire:key="harness-wysiwyg-editor"
        />

        {{-- The editor's `wire:ignore`d region never round-trips its live DOM back to the server
        on its own (D9) -- this renders what $editorValue actually holds server-side, which is what
        a debounced sync (or an image insertion's explicit sync, D6 step 6) has last written to it. --}}
        <div data-test="harness-editor-value">{!! $editorValue !!}</div>
    </div>

    <div class="flex flex-col gap-2" data-test="harness-editor-instance-2">
        <flux:heading size="lg">WysiwygEditor instance (second)</flux:heading>

        <livewire:components.wysiwyg-editor
            wire:model="secondEditorValue"
            wire:key="harness-wysiwyg-editor-2"
        />

        {{-- Same D9 reasoning as the first instance above -- and the property a re-entrancy test
        reads to confirm an image confirmed from the FIRST editor's gallery never lands HERE. --}}
        <div data-test="harness-editor-value-2">{!! $secondEditorValue !!}</div>
    </div>
</div>
