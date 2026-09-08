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
        Schema::create('product_attribute_types', function (Blueprint $table): void {
            $table->uuid('id')->primary();

            // string(100), not a bare string() — see migrations.md's rule. A bare
            // VARCHAR(255) here would make the unique index a needlessly wide key.
            $table->string('name', 100);

            // D5: not nullable, default 0. The column ships now so neither this
            // story nor 0029 needs an ALTER later; CreateProductAttributeType does
            // not write it yet (every type persists at 0, ordered by name in
            // loadTypes()) pending the drag-to-reorder UI the type list itself has
            // no scenario for. product_attribute_values.position IS written on
            // every row by SyncProductAttributeValues, and every read must
            // tiebreak ORDER BY position ASC, value ASC. No index — read wholesale
            // into a dropdown at 10^1-10^2 rows, same reasoning as users.status.
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            // Type name is globally unique (D3) — two "Size" types are meaningless
            // and would make the variant builder ambiguous.
            $table->unique('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_attribute_types');
    }
};
