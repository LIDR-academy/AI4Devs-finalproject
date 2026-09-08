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
        Schema::create('shipping_zones', function (Blueprint $table): void {
            // UUID v7 via HasUuids -- confirmed project policy for Epic 2 business
            // entities (0016 D9, 0035 F); also what makes 0036's
            // foreignUuid('shipping_zone_id') match on both sides.
            $table->uuid('id')->primary();

            // 150, matching sales_regions (0016) rather than product_categories'
            // bare string() (255) -- a short, unique, badge-rendered label. See D-6/OQ-D.
            // Must move together with App\Concerns\ShippingZoneValidationRules::MAX_NAME_LENGTH
            // (Phase 5 code review finding F-5) -- kept a literal here rather than importing that
            // trait's constant, since PHP does not allow a migration (or anything else) to
            // reference a trait constant except through a concrete class that composes it.
            $table->string('name', 150);
            $table->timestamps();

            // Defence in depth ONLY. The authoritative uniqueness check is the
            // normalised comparison in PHP -- this project's connection is
            // utf8mb4_unicode_ci (case- AND accent-insensitive), so a Spanish zone
            // name's case/accent variants must be refused with a clean validation
            // message rather than left to the index alone. See D-6 and 0023 D-4.
            // This index is the last-word race guard.
            $table->unique('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // The unique index drops with the table -- no explicit dropUnique() needed.
        Schema::dropIfExists('shipping_zones');
    }
};
