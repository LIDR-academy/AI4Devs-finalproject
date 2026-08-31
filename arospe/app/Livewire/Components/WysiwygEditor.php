<?php

namespace App\Livewire\Components;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Models\Media;
use Illuminate\Support\Facades\Storage;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Modelable;
use Livewire\Attributes\On;
use Livewire\Component;

/**
 * Story 0021 -- a reusable, content-agnostic rich-text editor whose toolbar
 * carries exactly eight actions (Bold, Italic, Underline, H2, bullet list,
 * numbered list, link, "Insert image"). Its output is HTML that 0024's
 * server-side sanitizer accepts on write; this component performs no
 * client-side sanitization of its own -- see D2 in
 * ai-spec/tasks/in-progress/0021-wysiwyg-rich-text-editor-component.md for
 * the exact tag set every toolbar action may emit.
 *
 * "Insert image" embeds App\Livewire\Media\Gallery itself, single-select
 * (D4) -- this component is the gallery's consumer, and the product/blog
 * editor is in turn this component's consumer. The caret-capture/restore
 * mechanism that places the confirmed image at the cursor (D6) is entirely
 * client-side (resources/js/app.js's `wysiwygEditor` Alpine component); the
 * server side only re-dispatches the gallery's confirm payload as a
 * same-component, scoped `wysiwyg-insert-image` event (D6 step 5).
 */
class WysiwygEditor extends Component
{
    /**
     * The HTML. Never null -- an empty string is "no content", per this
     * project's own null-`<select>` errors-log rule applied to every
     * `wire:model`-bound property, not just ones bound to native form
     * controls. Deliberately NOT #[Locked]: it is the model binding a
     * consumer's `wire:model="description"` writes through, exactly as
     * App\Livewire\Media\Gallery's own $search is the only client-writable
     * property on that component. The value is untrusted HTML by
     * construction and is treated as such at the only boundary that
     * matters -- 0024's symfony/html-sanitizer, on write -- so a client
     * posting hostile HTML into this property through a crafted
     * /livewire/update payload achieves nothing a hostile paste would not.
     * This component must never render it back out anywhere except the one
     * `{!! $value !!}` seed inside the wire:ignore'd region (D9).
     */
    #[Modelable]
    public string $value = '';

    /**
     * The `wire:model` target the embedded <livewire:media.gallery> tag
     * binds its own #[Modelable] $open through (D4). Deliberately NOT
     * #[Locked]: Livewire 4's nested-#[Modelable] write-back channel
     * injects `wire:model="$parent.showGallery"` onto the gallery's root
     * element, so when the gallery's own cancel()/confirmSelection() write
     * $open = false, that write round-trips back up to THIS property
     * through the same channel a forged client payload would use --
     * locking it would throw CannotUpdateLockedPropertyException on the
     * gallery's own legitimate close path. The shipped precedent this
     * mirrors is App\Livewire\Dev\MediaGalleryHarness::$showSingle, which
     * is public bool with no #[Locked] for the identical reason.
     */
    public bool $showGallery = false;

    /**
     * The embedded gallery's `select-event` (D4/D5) -- per-instance-unique,
     * derived in mount() rather than a literal, because Livewire registers
     * every listener as a page-global `window.addEventListener(name, ...)`
     * (V6): a fixed literal here would cross-wire two editors mounted on
     * one page (e.g. a product's short and long description), each
     * receiving every confirmed image from both galleries. #[Locked]
     * because nothing but mount() may ever assign it.
     */
    #[Locked]
    public string $galleryEvent;

    /**
     * Mount-time config (D5, Phase 4 security audit finding F-3/F-5) --
     * never legitimately changes mid-life, so it is `#[Locked]` like
     * `$galleryEvent` above, matching `App\Livewire\Media\Gallery`'s own
     * convention of locking every mount-time config property.
     */
    #[Locked]
    public string $label = '';

    /**
     * Mount-time config (D5, Phase 4 security audit finding F-3/F-5) --
     * `#[Locked]` for the same reason as `$label` immediately above.
     */
    #[Locked]
    public string $placeholder = '';

    /**
     * Read-only mode -- a UI affordance plus a server-side no-op on
     * `openGallery()`/`insertImage()` when `true`, `#[Locked]` since Phase 4
     * security audit finding F-3 (it was previously client-writable, with no
     * lock behind it, contradicting this very docblock). This does NOT make
     * `$value` itself read-only or server-authoritative -- a consumer's own
     * `wire:model="description"` binding can still write `$value` regardless
     * of this flag, which remains F-1's concern (see the Phase 4 record at
     * the end of this task's file).
     */
    #[Locked]
    public bool $disabled = false;

    /**
     * D5, Phase 2 correction, and Phase 3 correction after real browser
     * tests found the array form does not actually work: `mount()` runs
     * only on the component's INITIAL request, never on a later
     * `/livewire/update` round trip. `insertImage()` is reached from a
     * SEPARATE request -- the gallery's own confirm click, dispatched after
     * the modal already opened in an earlier round trip -- and on that
     * later request Livewire rebuilds this component's listener list from
     * scratch via `SupportEvents::getComponentListeners()`, which merges
     * `$this->listeners` (empty again, since mount() never re-ran) with
     * `#[On]` attributes. An entry written into `$this->listeners` inside
     * mount() is therefore gone by the time it would ever be needed, and
     * the gallery's dispatch throws `EventHandlerDoesNotExist` -- verified
     * live in Chromium, not reasoned about. `#[On('{galleryEvent}')]` on
     * insertImage() below does not have this problem: Livewire's
     * `replaceDynamicEventNamePlaceholders()` resolves the WHOLE placeholder
     * from the component's own PERSISTED state (`data_get($component,
     * 'galleryEvent')`, i.e. the complete `'wysiwyg-image-selected-{id}'`
     * string already stored on the property -- not a suffix appended to a
     * second literal prefix) on every request, including this later one,
     * because `$galleryEvent` itself is ordinary component state that
     * round-trips normally -- only the derived `$this->listeners` array
     * entry failed to.
     */
    public function mount(): void
    {
        $this->galleryEvent = 'wysiwyg-image-selected-'.$this->getId();
    }

    /**
     * Flip the bound $showGallery -- the embedded gallery's own
     * #[Modelable] $open reads this through wire:model (D4). A disabled
     * editor refuses to open the gallery at all, server-enforced.
     *
     * Phase 4 security audit finding F-2 (Medium): this component has no
     * route of its own (D4's docblock already establishes the routeless
     * pattern for `insertImage()` below), so nothing replays a `can:` gate
     * for it on a later `/livewire/update` round trip -- every public
     * method that mutates or discloses must gate itself, per
     * docs/security/livewire-authorization.md's routeless-component rule.
     * Gated first, exactly as `App\Livewire\Media\Gallery::mount()` gates
     * itself, before the pre-existing `$disabled` no-op below -- a
     * malicious/tampered attempt is refused and logged before this
     * component's own UI-affordance check is ever reached.
     */
    public function openGallery(LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $logRefusedPrivilegedAttempt->authorize('viewAny', Media::class);

        if ($this->disabled) {
            return;
        }

        $this->showGallery = true;
    }

    /**
     * The gallery's confirmed-selection listener, bound via the
     * `#[On('{galleryEvent}')]` placeholder below rather than mount()'s
     * `$this->listeners` array -- see that method's docblock for why the
     * array form does not survive past the component's first request.
     * Reached with 0020 D2's exact payload shape -- always a LIST, even in
     * single-select mode, so this method's
     * signature never depends on a shape set elsewhere. An empty list is
     * 0020 D2's own cancel/tampered-id-dropped shape and is a deliberate
     * no-op, not an error.
     *
     * D6 step 5: delivers server -> client with a same-component,
     * `$this->dispatch()` bubbling CustomEvent (V8) rather than the
     * page-global listener machinery D5 needs for the gallery hop -- a
     * scoped `x-on:wysiwyg-insert-image` (no `.window` modifier) on this
     * component's own root has no name-collision risk at all. D7: the
     * ORIGINAL `url` is carried across, never `webpUrl`/`avifUrl` -- this
     * HTML is stored long-term in a column whose future consumers are not
     * specified, so no format negotiation is possible in it at all.
     *
     * D6 step 6 note: the JS handler syncs the inserted HTML back onto
     * $value with a plain `this.$wire.set('value', ...)`. #[Modelable]
     * $value DOES propagate to a host's `wire:model`-bound property through
     * Livewire's nested-modelable channel (D3) -- but, like any non-`.live`
     * `wire:model`, the write is queued client-side and only actually
     * reaches the host on the HOST's own next request (e.g. the host's
     * Save button). A diagnostic browser test confirmed this directly: the
     * queued value was invisible until an unrelated host-scoped click
     * fired, then arrived intact. This is ordinary deferred `wire:model`
     * behaviour, not a defect in this component -- a real consumer reads
     * the final value when its own form submits, which is exactly when the
     * queued write flushes.
     *
     * Phase 4 security audit finding F-2 (Medium): this method is reachable
     * over `/livewire/update` by anyone authenticated on this routeless
     * component (see `openGallery()`'s docblock above for why every such
     * method must gate itself), and it used to trust the client-supplied
     * `$media[0]['url']`/`['title']` wholesale instead of re-deriving them
     * from the database -- the exact thing
     * `App\Livewire\Media\Gallery::confirmSelection()` already gets right
     * for its own dispatch payload. Fixed to match that precedent: gated
     * first via `LogRefusedPrivilegedAttempt`, then the selected item is
     * re-fetched by id rather than trusted from the payload. A tampered,
     * malformed or since-deleted id -- including the `$media === []`
     * cancel/dropped-id shape this method's own signature never depends on
     * (per the paragraph above) -- collapses to the same silent no-op via
     * `Media::query()->find(...)` returning `null`, which also closes Phase
     * 4 finding F-4 (a malformed payload no longer reaches an unhandled
     * `TypeError` from indexing an unexpected shape).
     *
     * @param  array<int, array{id: string, title: string, description: string|null, url: string, webpUrl: string, avifUrl: string, width: int, height: int}>  $media
     */
    #[On('{galleryEvent}')]
    public function insertImage(array $media, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $logRefusedPrivilegedAttempt->authorize('viewAny', Media::class);

        if ($this->disabled) {
            return;
        }

        // Re-audit finding (Phase 4, round 2): $id must be validated as a string before it
        // reaches find() -- Eloquent's find() treats an ARRAY argument as a call to
        // findMany(), which returns a Collection rather than null, so a forged payload
        // shaping `id` as a nested array (e.g. {"id": ["a","b"]}) would silently bypass the
        // `$item === null` no-op guard below instead of collapsing into it.
        $id = $media[0]['id'] ?? null;

        if (! is_string($id)) {
            return;
        }

        $item = Media::query()->find($id);

        if ($item === null) {
            return;
        }

        $this->dispatch('wysiwyg-insert-image', url: Storage::disk('public')->url($item->path), alt: $item->title);
    }
}
