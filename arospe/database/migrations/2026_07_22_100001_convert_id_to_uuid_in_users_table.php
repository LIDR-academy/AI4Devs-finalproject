<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Step 1 of 5 of the users UUID primary key conversion (ADR 0001): renames the existing
     * auto-increment `id` to `legacy_id` (kept exactly as-is — still bigint/AUTO_INCREMENT/
     * PRIMARY KEY, just renamed) and adds a nullable, unique-indexed `uuid` CHAR(36) column,
     * backfilled with a UUIDv7 for every existing row. The primary key stays on `legacy_id`
     * until the finalize migration (step 5) switches it over — every dependent (passkeys,
     * sessions, permission tables) reads `legacy_id` to backfill its own uuid column before
     * that happens.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->renameColumn('id', 'legacy_id');
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->uuid('uuid')->nullable()->unique()->after('legacy_id');
        });

        DB::table('users')
            ->orderBy('legacy_id')
            ->pluck('legacy_id')
            ->each(function (int $legacyId): void {
                DB::table('users')
                    ->where('legacy_id', $legacyId)
                    ->update(['uuid' => (string) Str::uuid7()]);
            });
    }

    /**
     * Reverse the migrations.
     *
     * Fully lossless in isolation: this migration only renamed a column and added a new
     * nullable one, so reversing it destroys nothing that existed before it ran.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('uuid');
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->renameColumn('legacy_id', 'id');
        });
    }
};
