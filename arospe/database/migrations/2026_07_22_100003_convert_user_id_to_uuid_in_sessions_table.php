<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Step 3 of 5 of the users UUID primary key conversion (ADR 0001): retypes
     * sessions.user_id from bigint to uuid via a temp column, backfilled by joining on
     * users.legacy_id. No foreign key exists on this column today, so this migration is
     * self-contained.
     */
    public function up(): void
    {
        Schema::table('sessions', function (Blueprint $table): void {
            $table->uuid('user_id_uuid')->nullable()->after('user_id');
        });

        DB::table('sessions')
            ->join('users', 'users.legacy_id', '=', 'sessions.user_id')
            ->update(['sessions.user_id_uuid' => DB::raw('users.uuid')]);

        Schema::table('sessions', function (Blueprint $table): void {
            $table->dropIndex(['user_id']);
        });

        Schema::table('sessions', function (Blueprint $table): void {
            $table->dropColumn('user_id');
        });

        Schema::table('sessions', function (Blueprint $table): void {
            $table->renameColumn('user_id_uuid', 'user_id');
        });

        Schema::table('sessions', function (Blueprint $table): void {
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * Structurally restores the bigint, nullable user_id column, but the values are only
     * as faithful as whatever users.legacy_id holds at rollback time — see ADR 0001 and the
     * User Story's accepted rollback-is-data-lossy tradeoff.
     */
    public function down(): void
    {
        Schema::table('sessions', function (Blueprint $table): void {
            $table->unsignedBigInteger('user_id_legacy')->nullable()->after('user_id');
        });

        DB::table('sessions')
            ->join('users', 'users.uuid', '=', 'sessions.user_id')
            ->update(['sessions.user_id_legacy' => DB::raw('users.legacy_id')]);

        Schema::table('sessions', function (Blueprint $table): void {
            $table->dropIndex(['user_id']);
        });

        Schema::table('sessions', function (Blueprint $table): void {
            $table->dropColumn('user_id');
        });

        Schema::table('sessions', function (Blueprint $table): void {
            $table->renameColumn('user_id_legacy', 'user_id');
        });

        Schema::table('sessions', function (Blueprint $table): void {
            $table->index('user_id');
        });
    }
};
