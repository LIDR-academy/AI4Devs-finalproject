<?php

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
        // D-8: name declared explicitly as `product_media` — Laravel would derive
        // `media_product` (both basenames snake-cased and sorted alphabetically),
        // and product_media reads correctly for the only direction anything
        // traverses. Same instinct as 0019's #[Table('media')].
        Schema::create('product_media', function (Blueprint $table): void {
            // cascadeOnDelete(): deleting a product cascades its own pivot rows away.
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            // restrictOnDelete(): the inverse of products.featured_media_id, and
            // symmetric with it — D-9. An image cannot be deleted while it appears
            // in any product's gallery. nullOnDelete() was never available here
            // regardless, since this column is half the composite primary key.
            $table->foreignUuid('media_id')->constrained('media')->restrictOnDelete();
            // D-8/D-17: 0-based array index written on every sync (attach, detach,
            // reorder alike) — there is no append-only MAX()+1 path. default(0) is
            // why the relationship must always tiebreak
            // (->orderByPivot('position')->orderByPivot('media_id')) — a bulk
            // multi-select attach otherwise leaves every new row at 0 and the strip
            // visibly reshuffles between page loads.
            $table->unsignedInteger('position')->default(0);

            // D-8: no surrogate `id` — nothing FKs into a pivot row, so the composite
            // PK below both is the "an image cannot appear twice in one gallery" rule
            // and gives the clustered index exactly the shape the only real query
            // needs (WHERE product_id = ? ORDER BY position). product_id leads
            // because every read is "this product's gallery"; the reverse lookup is
            // served by the media_id FK's own auto-created index.
            $table->primary(['product_id', 'media_id']);

            // D-10: deliberately NO $table->index('product_id') / ('media_id') —
            // constrained() already causes InnoDB to auto-create the FK's supporting
            // index (product_id's is additionally the composite PK's leading column).
            // Writing one explicitly would duplicate it — see migrations.md's
            // "An FK column does not also get an explicit index here".

            // D-8: no timestamps() — nothing reads them, and this phase has no
            // audit-trail requirement (assumption 17).
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_media');
    }
};
