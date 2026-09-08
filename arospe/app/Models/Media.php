<?php

namespace App\Models;

use Database\Factories\MediaFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A single uploaded image in the Shared Media Gallery (PRD §2.3): the kept
 * original plus its two mandatory `.webp`/`.avif` conversions, all three
 * paths relative to the `public` disk root.
 *
 * `path`, `webp_path`, `avif_path`, `width`, `height`, `size_bytes` and
 * `uploaded_by` are server-derived and deliberately absent from
 * `#[Fillable]` — written only by `App\Actions\Media\StoreUploadedImage` via
 * `forceFill()`/direct attribute assignment, the same mass-assignment guard
 * `users.status`/`pending_email` and `sales_regions`'s seeder-owned columns
 * use (see docs/conventions/base-standards.md).
 *
 * @property string $id
 * @property string $title
 * @property string|null $description
 * @property string $path
 * @property string $webp_path
 * @property string $avif_path
 * @property int $width
 * @property int $height
 * @property int $size_bytes
 * @property string|null $uploaded_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User|null $uploadedBy
 */
#[Table('media')]
#[Fillable(['title', 'description'])]
class Media extends Model
{
    /** @use HasFactory<MediaFactory> */
    use HasFactory, HasUuids;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'width' => 'integer',
            'height' => 'integer',
            'size_bytes' => 'integer',
        ];
    }

    /**
     * The user who performed the upload, if the account still exists and is
     * not soft-deleted. `uploaded_by` is retained even after a soft delete
     * (see docs/database/schema.md#soft-deletes) — a trashed uploader simply
     * resolves this relation to null rather than releasing the FK.
     *
     * @return BelongsTo<User, $this>
     */
    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Restrict the query to rows whose title or description contains the
     * given term, case-insensitively and with `%`/`_`/`\` treated as literal
     * characters rather than SQL LIKE wildcards (D7). An empty term is a
     * deliberate no-op that leaves the query unfiltered, returning the full
     * library rather than nothing.
     *
     * @param  Builder<Media>  $query
     */
    #[Scope]
    protected function search(Builder $query, string $term): void
    {
        if ($term === '') {
            return;
        }

        $escaped = addcslashes($term, '%_\\');

        $query->where(function (Builder $query) use ($escaped): void {
            $query->where('title', 'like', "%{$escaped}%")
                ->orWhere('description', 'like', "%{$escaped}%");
        });
    }
}
