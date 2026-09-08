<?php

namespace App\Livewire\Products;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Actions\Products\DeleteProduct;
use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Livewire\Attributes\Computed;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Title;
use Livewire\Component;
use Livewire\WithPagination;

/**
 * Products list screen: thumbnail, name + SKU, price, colour-coded stock, a status badge, per-row
 * edit/delete actions and a primary "Nuevo producto" action (story 0027).
 *
 * Gated on `products.view` at both the route (`can:products.view`, routes/products.php) and here in
 * mount() -- Livewire 4's `/livewire/update` endpoint is a separate entry point that never runs
 * route middleware, so a direct Livewire::test()/mount() call must be denied on its own. Per-row
 * `canEdit`/`canDelete` hints in products() come from the SAME ProductPolicy methods save()/
 * deleteProduct() (this class) and Editor::save() authorize against, so the disabled state can
 * never drift from what a click would actually do (architecture.md's UI-hint rule).
 */
#[Title('Products')]
class Index extends Component
{
    use WithPagination;

    /**
     * D-7: the prototype's own stockClass() bands, adopted as-written rather than invented. A
     * single named constant, never a magic number in Blade, so the threshold is a one-line edit.
     */
    private const LOW_STOCK_THRESHOLD = 10;

    private const PER_PAGE = 25;

    #[Locked]
    public bool $showDeleteModal = false;

    /**
     * Written only from $target->id, never the raw method argument -- the server-authoritative id
     * every mutating method re-reads with findOrFail() before authorizing against it. See
     * docs/security/livewire-authorization.md.
     */
    #[Locked]
    public ?string $deletingProductId = null;

    #[Locked]
    public string $deletingProductName = '';

    /**
     * Deliberately left unlogged, matching App\Livewire\ProductCategories\Index::mount()'s
     * identical precedent: the route's own `can:products.view` gate checks the identical ability,
     * and `can:` IS on Livewire's PersistentMiddleware allow-list, so a real HTTP actor who would
     * fail this check is refused by the route before mount() ever runs. A refusal here is
     * therefore unreachable over HTTP -- reachable only through a direct Livewire::test() call,
     * which is exactly what this screen's own ScreenAuthorizationTest.php exercises.
     */
    public function mount(): void
    {
        Gate::authorize('viewAny', Product::class);
    }

    /**
     * Open the delete-confirmation modal, naming the target from a freshly re-read database row --
     * never from a row array already rendered on the page.
     *
     * Gated on `delete` here (F-3, appsec audit) -- matching App\Livewire\ProductCategories\
     * Index::confirmDelete()'s identical precedent: opening this modal discloses the target row
     * (freshly re-read) to an actor who may not be authorized to delete it, so the check runs
     * before that disclosure, not only in the mutating deleteProduct() below.
     */
    public function confirmDelete(string $productId, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $target = Product::findOrFail($productId);

        $logRefusedPrivilegedAttempt->authorize('delete', $target, targetType: 'product', targetId: $target->id);

        $this->deletingProductId = $target->id;
        $this->deletingProductName = $target->name;
        $this->showDeleteModal = true;
    }

    /**
     * Authorize and delete the confirmed product.
     *
     * Re-resolves a FRESH Product::findOrFail($this->deletingProductId) immediately before
     * authorizing and calling DeleteProduct -- never an instance carried in component state --
     * per docs/security/model-instance-trust.md. This also makes the method fail closed
     * (ModelNotFoundException) if the target was deleted by someone else between confirmDelete()
     * and this call, rather than silently doing nothing.
     */
    public function deleteProduct(DeleteProduct $delete, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
    {
        $target = Product::findOrFail($this->deletingProductId);

        $logRefusedPrivilegedAttempt->authorize('delete', $target, targetType: 'product', targetId: $target->id);

        $delete($target);

        $this->closeDeleteModal();
    }

    /**
     * Close the delete-confirmation modal and reset its state.
     *
     * Also resets the whole error bag (0025 R-6's stale-error trap applies verbatim): without
     * this, a blocked delete's message would leak into the next delete attempt on a different,
     * unblocked product.
     */
    public function closeDeleteModal(): void
    {
        $this->showDeleteModal = false;
        $this->reset(['deletingProductId', 'deletingProductName']);
        $this->resetErrorBag();
    }

    /**
     * The paginated product list (D-4): explicit columns, never `description` (0024 R-9 -- a
     * MEDIUMTEXT dragged into the clustered index on every row of a paginated list), two eager
     * loads with their own explicit column lists, and a `name`/`id` order so two products sharing
     * a name never reshuffle between pages.
     *
     * Mapped through `->through()` into plain row arrays (D-17) rather than leaving the view to
     * reach into the model: the thumbnail's three URLs are built once, here, from 0019's real
     * `path`/`webp_path`/`avif_path` columns -- mirroring App\Livewire\Media\Gallery::
     * toPayloadItem()'s identical shape -- and `canEdit`/`canDelete` are read from the same
     * ProductPolicy methods this class's own deleteProduct()/Editor::save() authorize against.
     *
     * The row array's real shape is {id, name, sku, price, stock, stockBand, displayStatus,
     * thumbnail, canEdit, canDelete} (see the ->through() closure below) -- the generic argument
     * is left as `mixed` rather than the exact array shape because
     * Illuminate\Pagination\LengthAwarePaginator's TValue template is NOT covariant, and PHPStan
     * refuses any narrower explicit shape here even when it is byte-identical to what ->through()
     * actually returns (a documented PHPStan/Larastan limitation for this class, not a real type
     * hole -- the row array's true shape is still checked at every call site that reads it).
     *
     * @return LengthAwarePaginator<int, mixed>
     */
    #[Computed]
    public function products(): LengthAwarePaginator
    {
        $disk = Storage::disk('public');

        return Product::query()
            ->select(['id', 'product_category_id', 'featured_media_id', 'name', 'sku',
                'type', 'status', 'price', 'stock', 'created_at'])
            ->with([
                'category:id,name',
                'featuredImage:id,title,path,webp_path,avif_path',
            ])
            ->orderBy('name')
            ->orderBy('id')
            ->paginate(self::PER_PAGE)
            ->through(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'price' => $product->price,
                'stock' => $product->stock,
                'stockBand' => match (true) {
                    $product->stock === 0 => 'out',
                    $product->stock < self::LOW_STOCK_THRESHOLD => 'low',
                    default => 'ok',
                },
                'displayStatus' => $product->displayStatus(),
                'thumbnail' => $product->featuredImage === null ? null : [
                    'url' => $disk->url($product->featuredImage->path),
                    'webpUrl' => $disk->url($product->featuredImage->webp_path),
                    'avifUrl' => $disk->url($product->featuredImage->avif_path),
                    'title' => $product->featuredImage->title,
                ],
                'canEdit' => Gate::allows('update', $product),
                'canDelete' => Gate::allows('delete', $product),
            ]);
    }
}
