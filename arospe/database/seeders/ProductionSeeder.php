<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ProductionSeeder extends Seeder
{
    /**
     * Compose the application's required catalogs -- the data without which the app is
     * non-functional. Story 0002's runbook pointed production at
     * `db:seed --class=RolePermissionSeeder`, a targeted invocation that would now
     * silently skip the Sales Region catalog with no error at all; this class keeps
     * production on one class forever and is extensible for future required catalogs.
     */
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);
        $this->call(SalesRegionSeeder::class);
        // Story 0032 adds the shipping geography catalog here. Keep this list the one
        // place a required catalog is registered.
    }
}
