<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Strictly later than both shipping_zones' own migration and 0032's
     * create_geography_entries_table, so the pivot's two FKs resolve and its
     * down() (rolled back first) drops the pivot before either parent.
     */
    public function up(): void
    {
        Schema::create('shipping_zone_geography_entry', function (Blueprint $table): void {
            // UUID parent -> CHAR(36), matches shipping_zones.id.
            // cascadeOnDelete: memberships are meaningless without their zone, and
            // restrict here would fail EVERY legitimate zone delete (D-1's guard is
            // about rate rules, never about a zone's own coverage).
            $table->foreignUuid('shipping_zone_id')
                ->constrained()
                ->cascadeOnDelete();

            // bigint parent -> unsignedBigInteger, matches geography_entries.id
            // ($table->id() = bigIncrements = UNSIGNED BIGINT). Named explicitly:
            // constrained() would infer it correctly, but this is the one place a
            // reader needs the mixed-key crossing documented.
            // restrictOnDelete mirrors 0032's own parent_id choice and turns its
            // "upsert, never truncate" decision -- taken FOR this story -- into a
            // database invariant instead of a paragraph someone has to remember.
            $table->foreignId('geography_entry_id')
                ->constrained('geography_entries')
                ->restrictOnDelete();

            // The composite PK IS the "same entry twice in one zone" constraint, and
            // it is the clustered index. Zone first: the dominant read is "this
            // zone's members", a leading-column range scan.
            //
            // NEVER narrow this to unique('geography_entry_id'): that is the schema
            // shape of "an entry belongs to at most one zone" and would silently
            // invert D-2 (overlap is allowed), while still missing every implicit
            // overlap. See D-2.
            $table->primary(['shipping_zone_id', 'geography_entry_id']);

            // No timestamps(): sync() deletes and re-inserts rows, so created_at
            // would reset on every unrelated edit -- a timestamp that lies.
            // No index('geography_entry_id'): InnoDB creates one for the FK because
            // the column is non-leading in the PK. Writing it by hand ships a
            // duplicate -- the users_uuid_unique shape in errors-log.md. Verified
            // with `php artisan db:table shipping_zone_geography_entry` in Phase 3,
            // not by reading this file.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_zone_geography_entry');
    }
};
