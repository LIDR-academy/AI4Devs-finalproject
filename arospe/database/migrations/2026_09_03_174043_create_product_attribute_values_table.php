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
        Schema::create('product_attribute_values', function (Blueprint $table): void {
            $table->uuid('id')->primary();

            // cascadeOnDelete(): a value cannot outlive its type (D7) — same
            // reasoning as create_passkeys_table's "no orphaned passkeys".
            $table->foreignUuid('product_attribute_type_id')
                ->constrained()
                ->cascadeOnDelete();

            // value, not name — deliberate (D2): the PRD's own example is Size ->
            // 38, a value rather than a name, and it disambiguates $type->name from
            // $value->value when both are in scope. string(100), matching the
            // column width the validation trait's max:100 rule enforces.
            $table->string('value', 100);

            // D5: not nullable, default 0 — same tiebreak/reorder rules as
            // product_attribute_types.position, scoped per type instead of global.
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            // D3: a value is unique only within its type, never globally — "Black"
            // must be legal as both a Color and a Material value.
            //
            // NOTE: no separate ->index('product_attribute_type_id'). The composite
            // unique's leading column IS the FK column, so InnoDB accepts it as the
            // FK's supporting index — a standalone index here would be pure write
            // amplification, the exact mistake docs/errors-log.md records for
            // users_uuid_unique. This is the sixth confirming instance of
            // migrations.md's "an FK column does not also get an explicit index
            // here" rule (sales_regions, media, products x2, product_sales_region
            // being the first five). Do not "normalise" it by adding one.
            $table->unique(['product_attribute_type_id', 'value']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // migrate:rollback runs in reverse timestamp order, so this child table
        // drops before its parent — genuinely symmetric with up(), no
        // Schema::disableForeignKeyConstraints() needed. No explicit dropUnique()
        // either: that rule is scoped to dropColumn() on a surviving table: dropping
        // the whole table removes its indexes with it.
        Schema::dropIfExists('product_attribute_values');
    }
};
