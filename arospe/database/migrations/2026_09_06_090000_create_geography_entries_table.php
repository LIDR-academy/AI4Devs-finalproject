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
        Schema::create('geography_entries', function (Blueprint $table): void {
            // Deliberate exception to this project's UUIDv7 policy -- see ADR 0001's
            // amendment for story 0032. A pure high-volume internal lookup table
            // (~8,300 rows), no independent business identity, never URL-exposed.
            $table->id();
            $table->string('level', 20);
            $table->foreignId('parent_id')->nullable()->constrained('geography_entries')->restrictOnDelete();
            $table->string('name', 255);
            $table->string('normalized_name', 255);
            $table->string('ine_code', 10)->nullable()->unique();
            $table->char('iso_alpha2', 2)->nullable()->unique();
            $table->string('province_name', 255)->nullable();
            $table->timestamps();

            // The picker index (story 0034): equality on `level`, prefix range-scan on
            // `normalized_name` -- the shape of every bounded per-level search query.
            $table->index(['level', 'normalized_name']);

            // No hand-written index('parent_id') -- constrained() already creates one,
            // per migrations.md's "an FK column does not also get an explicit index
            // here" rule. This deliberately departs from this story's own task file,
            // which cited the older create_passkeys_table shape that page itself now
            // calls "not a pattern to copy" (see docs/database/migrations.md).
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('geography_entries');
    }
};
