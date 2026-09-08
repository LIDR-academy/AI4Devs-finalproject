<?php

use App\Enums\ProductStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_category_id')->constrained()->restrictOnDelete();
            $table->string('name', 255);
            $table->string('sku', 64);
            // D-5: deliberately no ->default() — physical/virtual are equally wrong
            // guesses, so an omission must fail loudly (1364 in strict mode) rather
            // than silently guess. Safe only because this table starts empty; do
            // NOT "fix" this into a backfilled default per migrations.md's usual
            // add-a-column rule — that rule is for populated tables.
            $table->string('type', 20);
            // D-6: 'draft' is a fail-closed safety net for a path that omits status
            // (factory, seeder, import) — the happy-path create always passes one
            // explicitly, and 'draft' can never accidentally publish anything.
            $table->string('status', 20)->default(ProductStatus::Draft->value);
            // D-2: decimal(10,2), NEVER float — binary floating point cannot hold
            // 21.00/0.10 exactly, and this value feeds tax arithmetic and order-line
            // snapshots. NOT NULL, unlike sales_regions.rate: there is no
            // "unconfigured" state for a product's price. No ->unsigned() — deprecated
            // on DECIMAL since MySQL 8.0.17 and ignored entirely by SQLite; 'min:0'
            // in validation is the enforcement.
            $table->decimal('price', 10, 2);
            // D-3: signed, NOT unsignedInteger (recorded dissent) — an unsigned column
            // would turn a future decrement below zero into a MySQL 500 instead of a
            // business decision Epic 3 owns, and SQLite ignores UNSIGNED entirely.
            // NOT NULL default 0 is load-bearing for the out-of-stock badge
            // (stock <= 0): a NULL would make it undecidable.
            $table->integer('stock')->default(0);
            // D-4: mediumText, not text — Laravel's max: counts characters while
            // TEXT caps at 65,535 bytes, so a max:65535 rule against a TEXT column is
            // a silent 22001 the moment accented/markup content grows past the byte
            // ceiling. MEDIUMTEXT (16 MB) makes the validation rule the binding limit
            // instead. Nullable: a Draft mid-authoring has none. Not sanitized here —
            // that is 0024a's deliverable.
            $table->mediumText('description')->nullable();
            // D-9: constrained('media') is mandatory, not stylistic — Laravel would
            // otherwise infer a `featured_media` table from this column name.
            // restrictOnDelete() (not nullOnDelete): an image cannot be deleted while
            // any product features it, matching this project's house "cannot delete
            // something in use" pattern. Independent of the gallery — see D-9.
            $table->foreignUuid('featured_media_id')->nullable()->constrained('media')->restrictOnDelete();
            $table->timestamps();

            // D-11: SKU is canonicalised (upper-cased, trimmed) on write before this
            // index is ever consulted, so a plain UNIQUE compares like-for-like on
            // both engines with no custom collation handling needed. Global and
            // unscoped by design — a SKU is a stock-keeping unit identifier, and
            // scoping it to a category would let two products share one.
            $table->unique('sku');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
