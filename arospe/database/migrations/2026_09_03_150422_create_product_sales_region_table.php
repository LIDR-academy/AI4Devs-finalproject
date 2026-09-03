<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Composite primary key over both FKs -- no surrogate `id`, matching
     * `product_media`'s pivot shape (story 0024). `product_id` leads because
     * the only real query is "this product's regions". `restrictOnDelete()`
     * on `sales_region_id` is the house pattern for "cannot delete something
     * in use" -- currently unreachable (0016/0017 give the catalog no
     * delete path), a backstop against a future delete story, exactly the
     * acknowledged-dead-today situation 0024 records for its own two media
     * FKs. Deliberately NO hand-written index on either FK column:
     * `product_id` is the composite PK's leftmost prefix, and
     * `sales_region_id` gets InnoDB's own auto-created supporting index for
     * the FK constraint -- adding `$table->index('sales_region_id')` would
     * duplicate that index (verified against the real MySQL grammar, see
     * the story's V-3).
     */
    public function up(): void
    {
        Schema::create('product_sales_region', function (Blueprint $table): void {
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('sales_region_id')->constrained()->restrictOnDelete();

            $table->primary(['product_id', 'sales_region_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_sales_region');
    }
};
