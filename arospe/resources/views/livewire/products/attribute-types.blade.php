{{--
    Story 0028: minimal placeholder view only (Q6, confirmed at Phase 2).
    The UI sibling story owns the real markup, mirroring the 0004 -> 0006
    and 0017 -> 0018 split already established for sales-regions.blade.php.
    Without this placeholder the route 500s and this story's own feature
    tests cannot run.

    App\Livewire\Products\AttributeTypes\Index resolves to THIS flat path
    (products/attribute-types.blade.php), one level shallower than the
    class, per the Index-in-a-subfolder exception documented in
    docs/conventions/naming.md -- do NOT create
    resources/views/livewire/products/attribute-types/index.blade.php.
--}}
<div>
    <p>{{ $this->typesSummary['total'] }}</p>
</div>
