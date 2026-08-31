{{--
    Story 0022, Phase 3 Cycle B. Test-only host page for
    tests/Browser/Components/SearchableMultiSelectTest.php -- registered via View::addLocation()
    inside that test file itself, per the task file's "Test double" section. NOT application code:
    no route file, no app/ class and no other resources/views/ file references this. Neither
    App\Livewire\Components\SearchableMultiSelect (embedded below) nor its own view exist yet at
    Phase 3 Cycle B time, so visiting the route this fixture is served from is expected to fail
    (a 500, or a "component not found" style error from Livewire) until frontend-expert implements
    both -- the correct, intended outcome of this fixture existing before the production code does.

    Renders a trivial parent Livewire component (Tests\Browser\Components\
    SearchableMultiSelectBrowserTestHost, defined in the test file) that binds the widget's
    #[Modelable] $selected via a plain wire:model, matching the D1 consumer usage snippet exactly,
    plus a save control whose own click exercises D12's "the whole save is refused" acceptance
    criterion against a real button rather than an abstract assertion.
--}}
<div class="p-8">
    <livewire:components.searchable-multi-select
        :option-resolver="$optionResolver"
        wire:model="selected"
        field="selected"
        label="Regions"
        :max-chip-area-height="$maxChipAreaHeight"
    />

    <flux:button type="button" wire:click="save" data-test="host-save-button">
        Save
    </flux:button>

    @error('selected')
        <p data-test="host-save-error">{{ $message }}</p>
    @enderror

    @if ($saved)
        <p data-test="host-save-success">Saved</p>
    @endif
</div>
