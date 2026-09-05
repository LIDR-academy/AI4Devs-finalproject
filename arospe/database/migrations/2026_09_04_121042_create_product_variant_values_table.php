<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The table is `product_variant_values`, NOT `product_variant_attribute_values` (67-char FK name)
     * and NOT `product_variant_attribute_value` (66-char FK name). BOTH exceed MySQL's 64-char
     * identifier limit and fail at migrate time with ERROR 1059. Verified independently by both
     * amigos, at both name lengths. See story 0029 V-B / V-9. Do not "improve" this name back.
     */
    public function up(): void
    {
        Schema::create('product_variant_values', function (Blueprint $table): void {
            $table->foreignUuid('product_variant_id')->constrained()->cascadeOnDelete();

            // restrictOnDelete() is MANDATED by story 0028's D4, not a local choice: an attribute value
            // any variant is built on must not be deletable. The application-level in-use block is the
            // message; this is the guarantee behind it.
            $table->foreignUuid('product_attribute_value_id')->constrained()->restrictOnDelete();

            // No surrogate id (nothing FKs a pivot row), no timestamps (0024 D-8), no position (a
            // combination's display order derives from the types'/values' own `position`). No
            // hand-written index on product_attribute_value_id: InnoDB auto-creates the supporting
            // index for the trailing FK column -- verified live on role_has_permissions, whose
            // migration declares only the composite PRIMARY.
            $table->primary(['product_variant_id', 'product_attribute_value_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variant_values');
    }
};
