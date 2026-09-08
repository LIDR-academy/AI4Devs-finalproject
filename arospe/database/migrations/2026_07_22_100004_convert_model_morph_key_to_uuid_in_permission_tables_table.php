<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Step 4 of 5 of the users UUID primary key conversion (ADR 0001): converts
     * model_has_roles/model_has_permissions' polymorphic morph key from
     * unsignedBigInteger to uuid for User assignments, backfilled by joining on
     * users.legacy_id. The target column name is read from
     * config('permission.column_names.model_morph_key') rather than hardcoded, matching
     * the vendored permission migration's own defensive style. Both tables are empty today,
     * so the backfill is a no-op now but written generically for when they are not.
     */
    public function up(): void
    {
        $morphKeyColumn = config('permission.column_names.model_morph_key');
        $pivotRole = config('permission.column_names.role_pivot_key') ?? 'role_id';
        $pivotPermission = config('permission.column_names.permission_pivot_key') ?? 'permission_id';

        throw_if(empty($morphKeyColumn), 'Error: config/permission.php not loaded. Run [php artisan config:clear] and try again.');

        $this->convertMorphKeyToUuid(
            table: 'model_has_roles',
            pivotKey: $pivotRole,
            referencedTable: 'roles',
            morphKeyColumn: $morphKeyColumn,
            primaryKeyName: 'model_has_roles_role_model_type_primary',
            indexName: 'model_has_roles_model_id_model_type_index',
        );

        $this->convertMorphKeyToUuid(
            table: 'model_has_permissions',
            pivotKey: $pivotPermission,
            referencedTable: 'permissions',
            morphKeyColumn: $morphKeyColumn,
            primaryKeyName: 'model_has_permissions_permission_model_type_primary',
            indexName: 'model_has_permissions_model_id_model_type_index',
        );
    }

    /**
     * Reverse the migrations.
     *
     * Structurally restores the unsignedBigInteger morph key and its composite primary
     * key/index, but the values are only as faithful as whatever users.legacy_id holds at
     * rollback time — see ADR 0001 and the User Story's accepted rollback-is-data-lossy
     * tradeoff.
     */
    public function down(): void
    {
        $morphKeyColumn = config('permission.column_names.model_morph_key');
        $pivotRole = config('permission.column_names.role_pivot_key') ?? 'role_id';
        $pivotPermission = config('permission.column_names.permission_pivot_key') ?? 'permission_id';

        throw_if(empty($morphKeyColumn), 'Error: config/permission.php not loaded. Run [php artisan config:clear] and try again.');

        $this->revertMorphKeyToBigInteger(
            table: 'model_has_roles',
            pivotKey: $pivotRole,
            referencedTable: 'roles',
            morphKeyColumn: $morphKeyColumn,
            primaryKeyName: 'model_has_roles_role_model_type_primary',
            indexName: 'model_has_roles_model_id_model_type_index',
        );

        $this->revertMorphKeyToBigInteger(
            table: 'model_has_permissions',
            pivotKey: $pivotPermission,
            referencedTable: 'permissions',
            morphKeyColumn: $morphKeyColumn,
            primaryKeyName: 'model_has_permissions_permission_model_type_primary',
            indexName: 'model_has_permissions_model_id_model_type_index',
        );
    }

    /**
     * Backfill and retype a permission pivot table's morph key from bigint to uuid for
     * User assignments, joining on users.legacy_id.
     *
     * The pivot key's own foreign key (e.g. role_id -> roles.id) is dropped and re-added
     * around the primary-key rebuild: MySQL refuses to drop a composite primary key while
     * one of its columns still backs a foreign key constraint (error 1553).
     *
     * The bigint source column is detected rather than assumed: on a database that already
     * ran the vendored create_permission_tables migration before config/permission.php was
     * changed, it is still named `model_id`; on a fresh install (config already renamed),
     * that vendored migration creates the column pre-named per config — `model_uuid` — but
     * still typed unsignedBigInteger, since it hardcodes the column type. Either way, the
     * uuid temp column gets its own distinct name to avoid colliding with either case.
     */
    private function convertMorphKeyToUuid(
        string $table,
        string $pivotKey,
        string $referencedTable,
        string $morphKeyColumn,
        string $primaryKeyName,
        string $indexName,
    ): void {
        $bigintColumn = Schema::hasColumn($table, 'model_id') ? 'model_id' : $morphKeyColumn;
        $tmpColumn = 'model_morph_uuid_tmp';

        Schema::table($table, function (Blueprint $blueprint) use ($pivotKey): void {
            $blueprint->dropForeign([$pivotKey]);
        });

        Schema::table($table, function (Blueprint $blueprint): void {
            $blueprint->dropPrimary();
        });

        Schema::table($table, function (Blueprint $blueprint) use ($indexName): void {
            $blueprint->dropIndex($indexName);
        });

        Schema::table($table, function (Blueprint $blueprint) use ($tmpColumn): void {
            $blueprint->uuid($tmpColumn)->nullable()->after('model_type');
        });

        DB::table($table)
            ->join('users', 'users.legacy_id', '=', "{$table}.{$bigintColumn}")
            ->where("{$table}.model_type", User::class)
            ->update(["{$table}.{$tmpColumn}" => DB::raw('users.uuid')]);

        Schema::table($table, function (Blueprint $blueprint) use ($bigintColumn): void {
            $blueprint->dropColumn($bigintColumn);
        });

        Schema::table($table, function (Blueprint $blueprint) use ($tmpColumn, $morphKeyColumn): void {
            $blueprint->renameColumn($tmpColumn, $morphKeyColumn);
        });

        Schema::table($table, function (Blueprint $blueprint) use ($morphKeyColumn): void {
            $blueprint->uuid($morphKeyColumn)->nullable(false)->change();
        });

        Schema::table($table, function (Blueprint $blueprint) use ($pivotKey, $morphKeyColumn, $primaryKeyName, $indexName): void {
            $blueprint->primary([$pivotKey, $morphKeyColumn, 'model_type'], $primaryKeyName);
            $blueprint->index([$morphKeyColumn, 'model_type'], $indexName);
        });

        Schema::table($table, function (Blueprint $blueprint) use ($pivotKey, $referencedTable): void {
            $blueprint->foreign($pivotKey)->references('id')->on($referencedTable)->cascadeOnDelete();
        });
    }

    /**
     * Reverse convertMorphKeyToUuid(): retype the morph key back to unsignedBigInteger,
     * backfilled by joining on users.uuid.
     */
    private function revertMorphKeyToBigInteger(
        string $table,
        string $pivotKey,
        string $referencedTable,
        string $morphKeyColumn,
        string $primaryKeyName,
        string $indexName,
    ): void {
        Schema::table($table, function (Blueprint $blueprint) use ($pivotKey): void {
            $blueprint->dropForeign([$pivotKey]);
        });

        Schema::table($table, function (Blueprint $blueprint): void {
            $blueprint->dropPrimary();
        });

        Schema::table($table, function (Blueprint $blueprint) use ($indexName): void {
            $blueprint->dropIndex($indexName);
        });

        Schema::table($table, function (Blueprint $blueprint): void {
            $blueprint->unsignedBigInteger('model_id_tmp')->nullable()->after('model_type');
        });

        DB::table($table)
            ->join('users', 'users.uuid', '=', "{$table}.{$morphKeyColumn}")
            ->where("{$table}.model_type", User::class)
            ->update(["{$table}.model_id_tmp" => DB::raw('users.legacy_id')]);

        Schema::table($table, function (Blueprint $blueprint) use ($morphKeyColumn): void {
            $blueprint->dropColumn($morphKeyColumn);
        });

        Schema::table($table, function (Blueprint $blueprint): void {
            $blueprint->renameColumn('model_id_tmp', 'model_id');
        });

        Schema::table($table, function (Blueprint $blueprint): void {
            $blueprint->unsignedBigInteger('model_id')->nullable(false)->change();
        });

        Schema::table($table, function (Blueprint $blueprint) use ($pivotKey, $primaryKeyName, $indexName): void {
            $blueprint->primary([$pivotKey, 'model_id', 'model_type'], $primaryKeyName);
            $blueprint->index(['model_id', 'model_type'], $indexName);
        });

        Schema::table($table, function (Blueprint $blueprint) use ($pivotKey, $referencedTable): void {
            $blueprint->foreign($pivotKey)->references('id')->on($referencedTable)->cascadeOnDelete();
        });
    }
};
