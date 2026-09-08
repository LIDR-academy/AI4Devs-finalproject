<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Step 5 of 5 (final) of the users UUID primary key conversion (ADR 0001): drops
     * users.legacy_id — its data has now been fully consumed by the passkeys/sessions/
     * permission-tables backfills — renames uuid -> id, makes id the primary key, and
     * re-adds the passkeys foreign key now that both sides are uuid. This is the only point
     * where users leaves its dual-column (legacy_id + uuid) state.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('legacy_id');
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->renameColumn('uuid', 'id');
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->uuid('id')->nullable(false)->change();
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->primary('id');
        });

        Schema::table('passkeys', function (Blueprint $table): void {
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * Known limitation (accepted, human-confirmed — see the User Story's Definition of
     * Done): this is the exact point the original bigint id values become unrecoverable.
     * Dropping legacy_id in up() means there is no historical value to restore, so this
     * down() only structurally restores a bigint auto-increment primary key on users
     * (named legacy_id here; the previous migrations' down()s rename it back to id) —
     * MySQL auto-populates fresh sequential values for existing rows when the new
     * AUTO_INCREMENT column is added, but those values do not match the original ids.
     */
    public function down(): void
    {
        Schema::table('passkeys', function (Blueprint $table): void {
            $table->dropForeign(['user_id']);
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropPrimary();
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->renameColumn('id', 'uuid');
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->id('legacy_id');
        });
    }
};
