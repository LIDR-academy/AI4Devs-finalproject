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
    {{--
        N1 code-review fix: :debounce-ms is ALWAYS passed, never conditionally included via an
        @if/@endif inside this component tag's attribute list -- that shape is the exact
        compileComponentTags()-runs-before-@directives trap this file's own sibling errors-log
        entries record for <flux:*> tags (docs/errors-log.md), and `<livewire:...>` tags are
        compiled by the identical Illuminate\View\Compilers\BladeCompiler::compileComponentTags()
        pass, so the same trap applies here too. `$debounceMs ?? 300` mirrors the widget's own
        #[Locked] default in the one place it is safe to duplicate it (a test fixture, not
        production code) -- a test that never configures debounceMs therefore still exercises
        exactly the real default, just passed explicitly rather than left implicit.
    --}}
    <livewire:components.searchable-multi-select
        :option-resolver="$optionResolver"
        wire:model="selected"
        field="selected"
        label="Regions"
        :max-chip-area-height="$maxChipAreaHeight"
        :debounce-ms="$debounceMs ?? 300"
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
