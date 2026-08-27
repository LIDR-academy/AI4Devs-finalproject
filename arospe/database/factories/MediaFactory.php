<?php

namespace Database\Factories;

use App\Models\Media;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * @extends Factory<Media>
 */
class MediaFactory extends Factory
{
    /**
     * Define the model's default state: plausible title/description and
     * three distinct, plausible-looking file paths — deliberately with no
     * disk I/O, so tests exercising search/authorization (which never touch
     * the actual bytes) stay fast. Use the `withRealFiles()` state when a
     * test needs the paths to resolve to real bytes on `Storage::fake('public')`.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // A shared random basename per row, mirroring the naming scheme the
        // real StoreUploadedImage action is expected to use (D8: three
        // distinct, explicit path columns, never derived from one another
        // at read time — but a factory row still needs unique paths since
        // `path` carries a database UNIQUE constraint).
        $basename = Str::random(40);

        return [
            'title' => rtrim(fake()->sentence(3), '.'),
            'description' => fake()->optional()->sentence(),
            'path' => "media/{$basename}.png",
            'webp_path' => "media/{$basename}.webp",
            'avif_path' => "media/{$basename}.avif",
            'width' => fake()->numberBetween(100, 4000),
            'height' => fake()->numberBetween(100, 4000),
            'size_bytes' => fake()->numberBetween(10_000, 8 * 1024 * 1024),
            'uploaded_by' => null,
        ];
    }

    /**
     * Write real (tiny, fixture) bytes to the faked `public` disk at the
     * factory-generated paths, for tests that need the three files to
     * actually exist rather than merely be named. Not exercised by any test
     * shipped with this story — added per the task file's own instruction,
     * for a future consumer (e.g. story 0020's gallery tile rendering).
     *
     * The bytes are a minimal valid 1x1 PNG, reused verbatim for all three
     * paths: this state is about path *existence*, not format-correctness —
     * a real `.webp`/`.avif` signature is exercised by
     * tests/Unit/Actions/Media/GenerateImageConversionsTest.php instead.
     */
    public function withRealFiles(): static
    {
        return $this->afterCreating(function (Media $media): void {
            $pixel = base64_decode(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
            );

            Storage::disk('public')->put($media->path, $pixel);
            Storage::disk('public')->put($media->webp_path, $pixel);
            Storage::disk('public')->put($media->avif_path, $pixel);
        });
    }
}
