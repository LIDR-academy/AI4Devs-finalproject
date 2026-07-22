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
     * Step 2 of 5 of the users UUID primary key conversion (ADR 0001): drops the passkeys
     * foreign key (it currently points at users.legacy_id, renamed from users.id by the
     * previous migration) and retypes passkeys.user_id from bigint to uuid via a temp
     * column, backfilled by joining on users.legacy_id. The foreign key is intentionally
     * NOT re-added here — it is re-established in the finalize migration (step 5), once
     * both users.id and passkeys.user_id are uuid.
     */
    public function up(): void
    {
        Schema::table('passkeys', function (Blueprint $table): void {
            $table->dropForeign(['user_id']);
        });

        Schema::table('passkeys', function (Blueprint $table): void {
            $table->uuid('user_id_uuid')->nullable()->after('user_id');
        });

        DB::table('passkeys')
            ->join('users', 'users.legacy_id', '=', 'passkeys.user_id')
            ->update(['passkeys.user_id_uuid' => DB::raw('users.uuid')]);

        Schema::table('passkeys', function (Blueprint $table): void {
            $table->dropColumn('user_id');
        });

        Schema::table('passkeys', function (Blueprint $table): void {
            $table->renameColumn('user_id_uuid', 'user_id');
        });

        Schema::table('passkeys', function (Blueprint $table): void {
            $table->uuid('user_id')->nullable(false)->change();
        });

        Schema::table('passkeys', function (Blueprint $table): void {
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * Structurally restores the bigint user_id column and its foreign key to
     * users.legacy_id, but the values are only as faithful as whatever users.legacy_id
     * holds at rollback time — see ADR 0001 and the User Story's accepted
     * rollback-is-data-lossy tradeoff.
     */
    public function down(): void
    {
        Schema::table('passkeys', function (Blueprint $table): void {
            $table->dropIndex(['user_id']);
        });

        Schema::table('passkeys', function (Blueprint $table): void {
            $table->unsignedBigInteger('user_id_legacy')->nullable()->after('user_id');
        });

        DB::table('passkeys')
            ->join('users', 'users.uuid', '=', 'passkeys.user_id')
            ->update(['passkeys.user_id_legacy' => DB::raw('users.legacy_id')]);

        Schema::table('passkeys', function (Blueprint $table): void {
            $table->dropColumn('user_id');
        });

        Schema::table('passkeys', function (Blueprint $table): void {
            $table->renameColumn('user_id_legacy', 'user_id');
        });

        Schema::table('passkeys', function (Blueprint $table): void {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
        });

        Schema::table('passkeys', function (Blueprint $table): void {
            $table->foreign('user_id')->references('legacy_id')->on('users')->cascadeOnDelete();
            $table->index('user_id');
        });
    }
};
