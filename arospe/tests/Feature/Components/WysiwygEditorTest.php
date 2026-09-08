<?php

// Story 0021 (Shared WYSIWYG rich-text editor component), Phase 3 step 3 (RED). Component-level
// wiring tests for App\Livewire\Components\WysiwygEditor -- the split this project already
// established for tests/Feature/Media/{Gallery,GalleryRendering}Test.php: this file proves server
// wiring cheaply (mount, #[Modelable], the gallery hand-off, #[Locked]), never touches a real DOM.
// Everything about the caret, a real Selection, and what document.execCommand actually emits belongs
// to tests/Browser/Components/WysiwygEditorTest.php (a later technical task -- D13's harness does
// not exist yet), because Livewire::test() cannot observe any of that at all -- the same reasoning
// this project's own null-<select> errors-log entry already established for a different component.
//
// As of this writing App\Livewire\Components\WysiwygEditor does not exist (this is technical task 3,
// the RED half of Phase 3's TDD cycle; technical task 4 -- frontend-expert's implementation -- has
// not run yet). EVERY test in this file is expected to fail on a class-not-found error, not on a
// wrong assertion.
//
// Component surface assumed, per the task file's D3 (with its Phase 2 correction applied):
//   #[Modelable] public string $value = '';
//   public bool $showGallery = false;              // NOT #[Locked] -- see D3's Phase 2 correction:
//                                                   // Livewire's nested-#[Modelable] write-back
//                                                   // channel needs this writable so the embedded
//                                                   // gallery's own cancel()/confirmSelection() can
//                                                   // close the modal from its side.
//   #[Locked] public string $galleryEvent;          // derived in mount(), per-instance-unique (D5)
//   #[Locked] public string $label = '';             // mount-time config -- locked by Phase 4 F-3/F-5
//   #[Locked] public string $placeholder = '';       // mount-time config -- locked by Phase 4 F-3/F-5
//   #[Locked] public bool $disabled = false;         // a server-enforced no-op; locked by Phase 4 F-3
//
// Methods assumed: openGallery(): void, insertImage(array $media): void -- the method D5's mount()
// snippet registers the per-instance gallery listener against. Per D6 step 5, insertImage()
// re-dispatches a CLIENT-side event named 'wysiwyg-insert-image' carrying the ORIGINAL `url` (never
// webpUrl/avifUrl -- D7) and the payload's `title` as `alt`.
//
// The gallery confirm-payload item shape reused throughout is 0020's own D2 shape, verified against
// the real App\Livewire\Media\Gallery::toPayloadItem(): id, title, description, url, webpUrl,
// avifUrl, width, height -- see wysiwygGalleryPayloadItem() below, matching
// tests/Feature/Media/GalleryTest.php's own galleryExpectedItemShape() helper byte-for-byte.

use App\Livewire\Components\WysiwygEditor;
use App\Models\Media;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Livewire\Component;
use Livewire\Features\SupportLockedProperties\CannotUpdateLockedPropertyException;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
    Storage::fake('public');
});

function wysiwygEditorTestActor(): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo(['media.view', 'media.create', 'media.edit']);

    return $actor;
}

/**
 * One gallery confirm-payload item, in 0020 D2's exact shape -- reused so this file's expectations
 * are derived once rather than retyped per test.
 *
 * @return array{id: string, title: string, description: string|null, url: string, webpUrl: string, avifUrl: string, width: int, height: int}
 */
function wysiwygGalleryPayloadItem(Media $media): array
{
    return [
        'id' => $media->id,
        'title' => $media->title,
        'description' => $media->description,
        'url' => Storage::disk('public')->url($media->path),
        'webpUrl' => Storage::disk('public')->url($media->webp_path),
        'avifUrl' => Storage::disk('public')->url($media->avif_path),
        'width' => $media->width,
        'height' => $media->height,
    ];
}

/**
 * A minimal host, defined ONLY for this file's #[Modelable] round-trip tests -- not application
 * code (nothing under app/ or resources/views/ references it). Its render() returns a raw Blade
 * string rather than a view file; Livewire's own HandleComponents::getView() already supports that
 * (Utils::generateBladeView() compiles a string return value exactly like a single-file component's
 * render() would), so no new Blade file is needed to exercise a bare `wire:model` binding onto
 * WysiwygEditor's #[Modelable] $value.
 */
class WysiwygEditorHostStubForModelableTest extends Component
{
    public string $description = '';

    public function render(): string
    {
        return <<<'BLADE'
            <div>
                <livewire:components.wysiwyg-editor
                    wire:model="description"
                    wire:key="wysiwyg-editor-host-stub"
                />
            </div>
        BLADE;
    }
}

// =====================================================================
// Unit -- mounting with an initial HTML value leaves it untouched. This component performs no
// server-side reformatting and no sanitization of its own -- that boundary belongs to 0024's
// symfony/html-sanitizer, on write.
// =====================================================================

test('mounting with an initial HTML value leaves it exactly as given', function () {
    $this->actingAs(wysiwygEditorTestActor());

    $html = '<p>Hello <b>world</b></p><ul><li>one</li></ul>';

    $component = Livewire::test(WysiwygEditor::class, ['value' => $html]);

    expect($component->get('value'))->toBe($html);
});

// =====================================================================
// Integration -- the #[Modelable] value round-trips to and from a host component (D3). Split into
// two provable halves: a real host binding it with a bare `wire:model` seeds the embedded editor at
// mount and on every subsequent host-side update (server -> child, the direction a Feature test can
// actually observe); and $value itself is a plain writable, non-#[Locked] property -- the property
// that makes it a legitimate two-way model target at all, unlike $galleryEvent below. The DOM-level
// write-back through Livewire's nested-#[Modelable] channel (child -> host, via a real browser)
// belongs to the browser-test file (D3's Phase 2 correction, D6).
// =====================================================================

test('a host components bound value seeds the embedded editor at mount', function () {
    $this->actingAs(wysiwygEditorTestActor());

    $html = Livewire::test(WysiwygEditorHostStubForModelableTest::class, [
        'description' => '<p>Seeded from the host</p>',
    ])->html();

    expect($html)->toContain('<p>Seeded from the host</p>');
});

// Phase 4 correction (frontend-expert, technical task 4): this test's own premise -- that a
// host-side update to the bound property reaches the ALREADY-MOUNTED child's rendered HTML on the
// host's next re-render -- is false, and provably so on two independent grounds. (1) It directly
// contradicts D9's own documented consequence: "because the region is wire:ignore'd... a server-side
// write to $value does not appear in the editor. A consumer that resets its form by nulling the
// bound property will see the editor keep its old content." (2) It is also false at the LIVEWIRE
// mechanism level, independent of wire:ignore entirely: Livewire\Features\SupportNestingComponents
// spoofs any nested child keyed identically to one already rendered on a PRIOR render of the same
// parent test instance -- `pre-mount`'s `hasPreviouslyRenderedChild()` short-circuits `mount()`
// entirely and emits a bare `<div wire:id="..." wire:name="..." wire:key="..."></div>` stub instead
// of the child's real markup, so the child's own $value is never even re-read on this pass. Verified
// by execution: the host's re-render HTML for the second `->set()` call really does contain only that
// empty stub tag, not the editor's inner markup at all -- confirming this is a general Livewire
// nested-component property, not something a wire:ignore workaround could change.
test('updating the hosts bound property does not reach the already-mounted embedded editor', function () {
    $this->actingAs(wysiwygEditorTestActor());

    $component = Livewire::test(WysiwygEditorHostStubForModelableTest::class, [
        'description' => '<p>Original</p>',
    ])->assertSeeHtml('<p>Original</p>');

    // D9's documented consequence, proven rather than merely cited: the child was already rendered
    // above, so this second render spoofs it as an empty stub -- the new value never reaches it.
    expect($component->set('description', '<p>Updated from host</p>')->html())
        ->not->toContain('<p>Updated from host</p>')
        ->not->toContain('<p>Original</p>');
});

test('the value property is a plain writable Modelable target, not locked like galleryEvent', function () {
    $this->actingAs(wysiwygEditorTestActor());

    $component = Livewire::test(WysiwygEditor::class, ['value' => '<p>one</p>'])
        ->set('value', '<p>two</p>');

    expect($component->get('value'))->toBe('<p>two</p>');
});

// =====================================================================
// Integration -- openGallery() sets $showGallery true, and the embedded gallery (D4's always-
// embedded `@can`-wrapped tag) really was mounted with multi === false. Read the mounted child's own
// serialized "multi" key straight out of the rendered wire:snapshot -- the DOM's own ground truth,
// per this repo's documented "read wire:snapshot rather than reasoning about Blade source" instinct
// (docs/testing/frontend/playwright-setup.md) -- rather than assuming what the Blade source passes.
// =====================================================================

// Phase 4 correction (frontend-expert, technical task 4): the original single-call-chain shape
// asserted "multi:false" AFTER calling openGallery(), but that call re-renders this SAME tested
// instance a second time -- and per Livewire\Features\SupportNestingComponents (see the sibling
// correction above), the embedded <livewire:media.gallery> child, already rendered once on the
// INITIAL mount, is spoofed as an empty stub on this second render rather than re-emitting its own
// snapshot. So the assertion is split: the child's multi:false is read off the component's FIRST
// (initial-mount) render -- the one and only render at which a nested child's real markup is
// present -- and openGallery()'s effect is checked separately via assertSet, which reads the
// component's PHP property directly rather than parsing any HTML.
test('openGallery sets showGallery true, and the embedded gallery really was mounted with multi false', function () {
    $this->actingAs(wysiwygEditorTestActor());

    $component = Livewire::test(WysiwygEditor::class);

    expect($component->html())->toContain('&quot;multi&quot;:false');

    $component->call('openGallery')->assertSet('showGallery', true);
});

// =====================================================================
// Integration -- the registered gallery listener name is unique per mounted instance (D5). This is
// the regression test for the finding that would have caused a real bug: without it, a later
// "simplification" back to a literal event name passes every other test in this file.
// =====================================================================

test('the registered gallery listener name is unique per mounted instance', function () {
    $this->actingAs(wysiwygEditorTestActor());

    $first = Livewire::test(WysiwygEditor::class);
    $second = Livewire::test(WysiwygEditor::class);

    expect($first->get('galleryEvent'))->not->toBe($second->get('galleryEvent'));
});

// =====================================================================
// Integration -- insertImage() with 0020's exact payload shape dispatches the client-side event
// carrying the ORIGINAL url (never webpUrl/avifUrl -- D7) and the title as alt. Assert the payload
// itself, not merely that something was dispatched.
// =====================================================================

test('insertImage dispatches the client-side event carrying the original url and the title as alt', function () {
    $this->actingAs(wysiwygEditorTestActor());

    $media = Media::factory()->create(['title' => 'Red widget']);
    $item = wysiwygGalleryPayloadItem($media);

    $component = Livewire::test(WysiwygEditor::class)
        ->call('insertImage', [$item]);

    $component->assertDispatched(
        'wysiwyg-insert-image',
        fn (string $name, array $params): bool => $params['url'] === $item['url']
            && $params['alt'] === $item['title']
            // D7: the ORIGINAL url, never a format-negotiated variant.
            && $params['url'] !== $item['webpUrl']
            && $params['url'] !== $item['avifUrl']
    );
});

// =====================================================================
// Negative -- insertImage([]) is 0020 D2's cancel/tampered-id-dropped shape (a gallery confirm whose
// entire staged selection was dropped as unresolvable) -- dispatches nothing and errors nothing.
// =====================================================================

test('insertImage with an empty payload dispatches nothing and raises no error', function () {
    $this->actingAs(wysiwygEditorTestActor());

    $component = Livewire::test(WysiwygEditor::class)
        ->call('insertImage', [])
        ->assertHasNoErrors();

    $component->assertNotDispatched('wysiwyg-insert-image');
});

// =====================================================================
// Authorization -- Phase 4 security audit finding F-2 (Medium): this routeless component's
// openGallery()/insertImage() are otherwise reachable by any authenticated caller over
// /livewire/update with no gate behind them at all. Both now Gate::authorize('viewAny', Media::class)
// via LogRefusedPrivilegedAttempt as their first statement, matching
// App\Livewire\Media\Gallery::mount()'s own routeless-component pattern -- including that pattern's
// null target_type/target_id, since the ability is asked against the Media CLASS, not a specific row.
// Closes F-6 (no refusal logging on this surface) for free: the log call is the same call the F-2 fix
// added.
// =====================================================================

test('openGallery refuses and logs an actor holding no media permission', function () {
    $this->withoutExceptionHandling(); // matches Gallery's own precedent (GalleryTest.php) for this
    // exact shape -- without it, Laravel's exception handler catches the AuthorizationException and
    // turns it into a response instead of letting it propagate as a PHP throwable for toThrow() to see.
    Log::spy();

    $actor = User::factory()->create(); // holds no media permission at all
    $this->actingAs($actor);

    $component = Livewire::test(WysiwygEditor::class);

    expect(fn () => $component->call('openGallery'))->toThrow(AuthorizationException::class);

    expect($component->get('showGallery'))->toBeFalse();

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'viewAny'
            && array_key_exists('target_type', $context) && $context['target_type'] === null
            && array_key_exists('target_id', $context) && $context['target_id'] === null)
        ->once();
});

test('insertImage refuses and logs an actor holding no media permission, and dispatches nothing', function () {
    $this->withoutExceptionHandling(); // see the identical comment on the openGallery test above
    Log::spy();

    $media = Media::factory()->create();
    $item = wysiwygGalleryPayloadItem($media);

    $actor = User::factory()->create(); // holds no media permission at all
    $this->actingAs($actor);

    $component = Livewire::test(WysiwygEditor::class);

    expect(fn () => $component->call('insertImage', [$item]))->toThrow(AuthorizationException::class);

    $component->assertNotDispatched('wysiwyg-insert-image');

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'viewAny'
            && array_key_exists('target_type', $context) && $context['target_type'] === null
            && array_key_exists('target_id', $context) && $context['target_id'] === null)
        ->once();
});

// =====================================================================
// insertImage() no longer trusts the client-supplied url/title -- Phase 4 finding F-2's second half.
// It re-fetches the selected item by id, so a payload naming a real id but forged url/title values is
// silently overridden by the database's own values, and a tampered/nonexistent id (F-4) is a no-op.
// =====================================================================

test('insertImage re-derives the url and alt from the database, ignoring a forged payload', function () {
    $this->actingAs(wysiwygEditorTestActor());

    $media = Media::factory()->create(['title' => 'Real title']);
    $realItem = wysiwygGalleryPayloadItem($media);
    $forgedItem = [...$realItem, 'url' => 'https://evil.example/payload.svg', 'title' => 'Forged title'];

    $component = Livewire::test(WysiwygEditor::class)
        ->call('insertImage', [$forgedItem]);

    $component->assertDispatched(
        'wysiwyg-insert-image',
        fn (string $name, array $params): bool => $params['url'] === $realItem['url']
            && $params['alt'] === 'Real title'
            && $params['url'] !== 'https://evil.example/payload.svg'
    );
});

test('insertImage with a tampered or deleted id dispatches nothing and raises no error', function () {
    $this->actingAs(wysiwygEditorTestActor());

    $component = Livewire::test(WysiwygEditor::class)
        ->call('insertImage', [['id' => 'not-a-real-uuid', 'title' => 'x', 'url' => 'https://evil.example/x']])
        ->assertHasNoErrors();

    $component->assertNotDispatched('wysiwyg-insert-image');
});

// =====================================================================
// Negative -- with $disabled true, openGallery() and insertImage() are both no-ops. A server-
// enforced no-op, not just a UI state (D3) -- so this is tested at the component-method level, not
// only by rendering a disabled control.
// =====================================================================

test('openGallery and insertImage are both no-ops when the component is disabled', function () {
    $this->actingAs(wysiwygEditorTestActor());

    $media = Media::factory()->create();
    $item = wysiwygGalleryPayloadItem($media);

    $component = Livewire::test(WysiwygEditor::class, ['disabled' => true])
        ->call('openGallery');

    expect($component->get('showGallery'))->toBeFalse();

    $component->call('insertImage', [$item]);

    $component->assertNotDispatched('wysiwyg-insert-image');
});

// =====================================================================
// set(<property>, ...) throws CannotUpdateLockedPropertyException for every mount-time config
// property -- a regression-proof against someone dropping a #[Locked] attribute. Extended by the
// Phase 4 security audit (finding F-5) to cover $disabled/$label/$placeholder alongside the original
// $galleryEvent case, since F-3's fix is exactly this: those three gained #[Locked] and this dataset
// is what proves it holds. $showGallery is deliberately NOT included here: it must stay unlocked so
// the embedded gallery's own cancel()/confirmSelection() can write it back through Livewire's
// nested-#[Modelable] channel -- see D3's Phase 2 correction.
// =====================================================================

test('mount-time config properties are locked against external writes', function (string $property, mixed $forgedValue) {
    $this->actingAs(wysiwygEditorTestActor());

    $component = Livewire::test(WysiwygEditor::class);

    expect(fn () => $component->set($property, $forgedValue))
        ->toThrow(CannotUpdateLockedPropertyException::class);
})->with([
    'galleryEvent' => ['galleryEvent', 'a-forged-event-name'],
    'disabled' => ['disabled', true],
    'label' => ['label', 'Forged label'],
    'placeholder' => ['placeholder', 'Forged placeholder'],
]);
