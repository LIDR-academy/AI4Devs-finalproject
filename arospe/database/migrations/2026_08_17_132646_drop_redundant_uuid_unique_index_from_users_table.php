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
        Schema::table('users', function (Blueprint $table): void {
            // The explicit index-name string, not dropUnique(['id']): the redundant index left
            // behind by the UUID conversion is named users_uuid_unique (from the transient `uuid`
            // column it was created on), not the users_id_unique Laravel would derive from the
            // current column name — passing ['id'] would target a name that does not exist.
            $table->dropUnique('users_uuid_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->unique('id', 'users_uuid_unique');
        });
    }
};
