<?php

namespace App\Actions\ProductCategories;

use App\Models\ProductCategory;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

class DeleteProductCategory
{
    /**
     * Delete a product category, hard-blocked while any product still
     * references it (story 0024b, D-14).
     *
     * The count is unfiltered by product status -- a Draft product still
     * occupies the category, so counting only Active ones would let an
     * administrator delete a category out from under a dozen drafts.
     *
     * Throws ValidationException keyed on 'productCategoryId' -- a
     * hand-off contract story 0025 binds its delete-confirmation modal's
     * error outlet to. This is a domain-invariant refusal, not an
     * authorization one (see docs/architecture/authorization.md's "a domain
     * invariant is not an authorization rule" section): the actor may hold
     * products.delete and the answer is still no, which is why this is a
     * ValidationException rather than a Gate-mediated 403.
     *
     * No authorization of its own -- see this story's D-B1 (0024b's task
     * file). Do NOT trust CreateProductCategory's own docblock, which
     * claims a shape D-B1 records as false. When 0025 closes this hand-off
     * (per D-B2), the gate goes INSIDE this action as its own first
     * statement -- constructor-injected
     * $this->logRefusedPrivilegedAttempt->authorize('delete',
     * $productCategory, targetType: 'product_category', targetId:
     * $productCategory->id), the identical self-authorizing shape
     * App\Actions\Products\DeleteProduct already uses -- never only in the
     * calling Livewire component. The domain-invariant refusal below stays
     * unlogged from inside this action (per OQ-B1): it has no Gate call of
     * its own to log through, which is a property of THIS check, not of
     * the action lacking actor context in general -- once the gate above
     * exists, this action resolves Auth::user() internally exactly like
     * DeleteProduct does.
     */
    public function __invoke(ProductCategory $productCategory): bool
    {
        $inUseCount = $productCategory->products()->count();

        if ($inUseCount > 0) {
            throw $this->blockedByProducts($inUseCount);
        }

        try {
            // deleteOrFail(), not delete(): Larastan (Phase 3 finding) flags a plain
            // $productCategory->delete() as a dead catch -- Eloquent's Model::delete() carries
            // no @throws annotation Larastan can trace, unlike Model::save()/create()'s insert
            // path, which is why CreateProductCategory's identical-shaped catch has never been
            // flagged. deleteOrFail() is Laravel's own documented `@throws \Throwable` sibling
            // (Model.php) -- it wraps this exact delete() call in DB::transaction(), which IS
            // annotated to propagate QueryException, with no behavioural difference: a
            // single-statement DELETE inside a transaction is not observably different from one
            // outside it, and the 'deleting' model event this action's own race test hooks into
            // still fires identically either way.
            return (bool) $productCategory->deleteOrFail();
        } catch (QueryException $e) {
            // Narrowed to 1451 (ER_ROW_IS_REFERENCED_2), not the whole 23000 class (Phase 4
            // audit finding F-2) -- matching this repo's own precedent, CreateProduct's
            // errorInfo[1] === 1062 narrowing for the identical reason. deleteOrFail() fires
            // the 'deleting'/'deleted' model events inside its own transaction (proven by this
            // file's own race test), so a future ProductCategory observer raising a 1062/1452
            // there would otherwise be caught HERE and reported as a product count. Verified by
            // grepping every migration in database/migrations/: products.product_category_id is
            // the ONLY foreign key with a RESTRICT/NO ACTION delete rule anywhere in this schema
            // referencing product_categories today -- the drift-guard test below checks
            // specifically for that (Phase 5 review finding B-3: an earlier version of this
            // comment and that test matched ANY foreign key, restricting or not, which does not
            // match what this catch actually needs). Story 0070 adds a second FK against this
            // table (product_category_translations.product_category_id) on cascadeOnDelete(),
            // which raises no 1451 of its own and correctly does NOT trip the drift guard --
            // 0070's own task file declares this action untouched, and that claim is now provably
            // true rather than merely asserted. Re-derive this catch the day a THIRD table adds a
            // restricting FK here and the drift guard fails.
            if (($e->errorInfo[1] ?? null) === 1451) {
                throw $this->blockedByProducts($productCategory->products()->count());
            }

            throw $e;
        }
    }

    private function blockedByProducts(int $count): ValidationException
    {
        // max(1, ...): a PRESENTATION floor, not a correctness claim about how many products
        // actually reference the row (Phase 4 audit finding F-3, comment corrected at Phase 5
        // review finding N-1 against MEASURED behaviour, not reasoned-about behaviour).
        // deleteOrFail() wraps the DELETE in DB::transaction(), so a failed 1451 rolls the whole
        // transaction back -- which un-assigns any racing product that was reassigned into this
        // category by a `deleting` listener inside that same transaction (confirmed by
        // execution: this file's own race test's recount is always 0 on that exact path, not
        // merely possibly 0). So the floor is not a rare-window safety net for THAT path -- it is
        // what turns an always-0 recount into a coherent "used by 1 product" on every race this
        // action can currently produce. A recount could still read a real, larger number on a
        // GENUINELY concurrent, already-COMMITTED reassignment from a second connection, which is
        // the scenario the floor remains correct for even though no test forces that timing.
        // The primary $inUseCount > 0 call site never needs this floor; it only ever runs once
        // the count is already positive.
        $count = max(1, $count);

        return ValidationException::withMessages([
            'productCategoryId' => trans_choice('products.categories.delete_blocked', $count, ['count' => $count]),
        ]);
    }
}
