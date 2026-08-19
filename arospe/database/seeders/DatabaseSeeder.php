<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // N4 — allow-list, not "not production": staging/demo/qa are internet-reachable too.
        if (app()->environment(['local', 'testing'])) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }

        $this->call(RolePermissionSeeder::class);

        // Required application data, not fixture data -- unconditional, outside the
        // environment allow-list above. See docs/database/schema.md's "Populated by"
        // note on the same reasoning for RolePermissionSeeder.
        $this->call(SalesRegionSeeder::class);
    }
}
