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
        Schema::create('product_variants', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();

            // sha256 of the variant's sorted attribute-value ids. Derived, write-once, never read for
            // meaning -- it exists only so "no two variants of a product share a combination" is a
            // database invariant. A generated column cannot do this: MySQL 8.4 rejects a subquery in a
            // generated-column expression (ERROR 3102, verified). See story 0029 D-3.
            $table->char('combination_hash', 64);

            // DERIVED from products.sku + the variant's attribute values (D-4). Never admin-typed,
            // never mass-assignable. 128 rather than 0024's 64 on purpose: the length is a function of
            // inputs the administrator does not control directly, and there is no field to shorten --
            // D-4.4, OQ-17.
            $table->string('sku', 128);
            $table->decimal('price', 10, 2);              // NOT NULL -- 0024 D-2, and see D-6 / OQ-2
            $table->integer('stock')->default(0);         // signed on purpose -- 0024 D-3
            $table->foreignUuid('featured_media_id')->nullable()
                ->constrained('media')                    // 'media' is MANDATORY -- 0024 V-4/R-3: Laravel
                ->restrictOnDelete();                     // would otherwise infer `featured_media`
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            // NOTE: no ->index('product_id') and no ->index('featured_media_id'). The composite unique's
            // leading column IS product_id, and InnoDB auto-creates the supporting index for
            // featured_media_id at constraint time. Writing either by hand emits a second DDL statement
            // and produces a redundant index -- 0024 D-10, and the exact write amplification
            // docs/errors-log.md records for users_uuid_unique. Do not "restore" them.
            $table->unique('sku');
            $table->unique(['product_id', 'combination_hash']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
