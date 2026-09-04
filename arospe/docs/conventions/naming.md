# Naming Conventions

Real naming patterns observed across the codebase. For migration file naming specifically, see [database/migrations.md](../database/migrations.md#file-naming) — not repeated here.

## Table of Contents

- [Classes](#classes)
- [Livewire components and views](#livewire-components-and-views)
- [Traits and their methods](#traits-and-their-methods)
- [Route names](#route-names)
- [Permission names](#permission-names)
- [Translation keys](#translation-keys)
- [Boolean properties](#boolean-properties)

## Classes

One class per file, `StudlyCase`, filename matches class name exactly (PSR-4). Verified across `app/Actions/Fortify/`, `app/Livewire/`, `app/Concerns/`:

| Class | File |
| --- | --- |
| `App\Actions\Fortify\CreateNewUser` | `app/Actions/Fortify/CreateNewUser.php` |
| `App\Livewire\Settings\TwoFactor\RecoveryCodes` | `app/Livewire/Settings/TwoFactor/RecoveryCodes.php` |
| `App\Livewire\Actions\Logout` | `app/Livewire/Actions/Logout.php` |

Single-purpose invokable actions are named as an imperative verb phrase, not suffixed with `Action` or `Service`: `Logout`, `CreateNewUser`, `ResetUserPassword`, `RequestEmailChange`, `ConfirmEmailChange` (Fortify's own convention, followed consistently by this app's own actions in `app/Actions/Users/`).

Controllers, by contrast, **are** suffixed `Controller`, and are named after the action they front: `ConfirmEmailChange` (the action) → `ConfirmEmailChangeController` (the invokable controller in front of it). Same for listeners and notifications, which are named as a statement about what happened rather than a command: `ActivateVerifiedUser`, `PendingEmailVerification`.

| Class | File |
| --- | --- |
| `App\Actions\Users\ConfirmEmailChange` | `app/Actions/Users/ConfirmEmailChange.php` |
| `App\Http\Controllers\ConfirmEmailChangeController` | `app/Http/Controllers/ConfirmEmailChangeController.php` |
| `App\Listeners\ActivateVerifiedUser` | `app/Listeners/ActivateVerifiedUser.php` |
| `App\Notifications\PendingEmailVerification` | `app/Notifications/PendingEmailVerification.php` |
| `App\Enums\UserStatus` | `app/Enums/UserStatus.php` |
| `App\Actions\Roles\EnforceAdministratorPermissionGrant` | `app/Actions/Roles/EnforceAdministratorPermissionGrant.php` |
| `App\Actions\Roles\EnforceGrantorPermissionScope` | `app/Actions/Roles/EnforceGrantorPermissionScope.php` |
| `App\Policies\UserPolicy` | `app/Policies/UserPolicy.php` |
| `App\Exceptions\RoleInUseException` | `app/Exceptions/RoleInUseException.php` |
| `App\Actions\Auth\EnsureRecentPasswordConfirmation` | `app/Actions/Auth/EnsureRecentPasswordConfirmation.php` |
| `App\Exceptions\PasswordConfirmationRequiredException` | `app/Exceptions/PasswordConfirmationRequiredException.php` |
| `App\Actions\SalesRegions\SetDefaultSalesRegion` | `app/Actions/SalesRegions/SetDefaultSalesRegion.php` |
| `App\Policies\SalesRegionPolicy` | `app/Policies/SalesRegionPolicy.php` |
| `App\Concerns\SalesRegionValidationRules` | `app/Concerns/SalesRegionValidationRules.php` |
| `App\Actions\Media\GenerateImageConversions` | `app/Actions/Media/GenerateImageConversions.php` |
| `App\Policies\MediaPolicy` | `app/Policies/MediaPolicy.php` |
| `App\Concerns\MediaValidationRules` | `app/Concerns/MediaValidationRules.php` |
| `App\Actions\NormalizeForSearch` | `app/Actions/NormalizeForSearch.php` |
| `App\Exceptions\UnresolvedSelectionException` | `app/Exceptions/UnresolvedSelectionException.php` |
| `App\Livewire\Components\MultiSelectOptionsResolver` | `app/Livewire/Components/MultiSelectOptionsResolver.php` |
| `App\Livewire\Components\SearchableMultiSelect` | `app/Livewire/Components/SearchableMultiSelect.php` |
| `App\Policies\ProductPolicy` | `app/Policies/ProductPolicy.php` |
| `App\Actions\Products\SyncProductSalesRegions` | `app/Actions/Products/SyncProductSalesRegions.php` |
| `App\Actions\Products\ResolveProductTaxRate` | `app/Actions/Products/ResolveProductTaxRate.php` |
| `App\Actions\Products\ResolvedTaxRate` | `app/Actions/Products/ResolvedTaxRate.php` |
| `App\Actions\Products\SearchSalesRegions` | `app/Actions/Products/SearchSalesRegions.php` |
| `App\Enums\TaxRateResolutionTier` | `app/Enums/TaxRateResolutionTier.php` |
| `App\Exceptions\NoDefaultSalesRegionException` | `app/Exceptions/NoDefaultSalesRegionException.php` |
| `App\Policies\ProductAttributeTypePolicy` | `app/Policies/ProductAttributeTypePolicy.php` |
| `App\Actions\Products\SyncProductAttributeValues` | `app/Actions/Products/SyncProductAttributeValues.php` |
| `App\Concerns\ProductAttributeValidationRules` | `app/Concerns/ProductAttributeValidationRules.php` |
| `App\Models\ProductVariant` | `app/Models/ProductVariant.php` |
| `App\Actions\Products\CreateProductVariant` | `app/Actions/Products/CreateProductVariant.php` |
| `App\Actions\Products\UpdateProductVariant` | `app/Actions/Products/UpdateProductVariant.php` |
| `App\Actions\Products\DeleteProductVariant` | `app/Actions/Products/DeleteProductVariant.php` |
| `App\Actions\Products\HashVariantCombination` | `app/Actions/Products/HashVariantCombination.php` |
| `App\Actions\Products\DeriveVariantSku` | `app/Actions/Products/DeriveVariantSku.php` |
| `App\Actions\Products\TranslateProductVariantUniqueViolation` | `app/Actions/Products/TranslateProductVariantUniqueViolation.php` |
| `App\Concerns\ProductVariantValidationRules` | `app/Concerns/ProductVariantValidationRules.php` |

Policies are named `<Model>Policy` — and here the name is not merely a convention but a binding: Laravel 13 auto-discovers `App\Policies\UserPolicy` for `App\Models\User` by that exact name, so renaming it silently unbinds every `Gate::authorize()` call against a `User` (see [base-standards.md](base-standards.md#directory-structure)). Policy **methods** are named after the ability, as a bare verb phrase in camelCase and without a `can` prefix: `viewAny`, `update`, `promoteToAdministrator`, `updateSensitiveAttributes` — matching how they read at the call site, `Gate::authorize('promoteToAdministrator', $target)`.

Enum cases use TitleCase keys with lowercase backing values — `case Active = 'active';` in `App\Enums\UserStatus`, matching the project `CLAUDE.md` rule. `App\Enums\RoleName` is the exception the rule tolerates: its backing values are the seeded role names *exactly as persisted* (`case Administrator = 'Administrator';`), because the value is compared byte-for-byte against a database row — see [architecture/authorization.md](../architecture/authorization.md#the-administrator-tiers-identity).

**Shared identity predicates on a model are named `is<Thing>(self $x): bool` and take the row.** `App\Models\Role` carries three: the `public static` `isAdministratorRole()` and `isSuperAdminRoleRow()`, both of which a *different* class calls with a `Role` in hand, and the `private` `isSuperAdminRole()`, which asks the same question about `$this` from inside the model's own guards. The `Row` suffix on the middle one exists only to disambiguate it from that private sibling; it is a wart, accepted deliberately over renaming a method 0008's guards already depend on. When adding the next one, prefer a name that needs no suffix — and never let a private instance helper and a public static one differ by suffix alone if you can avoid it.

## Livewire components and views

Component class is `StudlyCase`; its Blade view is the **kebab-case** version of the class name, in a mirrored directory structure under `resources/views/livewire/`:

| Component | View |
| --- | --- |
| `App\Livewire\Settings\Security` | `resources/views/livewire/settings/security.blade.php` |
| `App\Livewire\Settings\Profile` | `resources/views/livewire/settings/profile.blade.php` |
| `App\Livewire\Settings\DeleteUserForm` | `resources/views/livewire/settings/delete-user-form.blade.php` |

✅ Good — `DeleteUserForm` → `delete-user-form.blade.php` (each word boundary becomes a hyphen).
❌ Bad — do not use `deleteuserform.blade.php` or `DeleteUserForm.blade.php`; Livewire's convention-based view resolution expects the kebab-case mirror.

### Exception: a component named `Index` resolves to its **parent folder's** name

The mirror rule above has one exception, and it is Livewire's, not this project's. A component class named `Index` inside a subfolder drops the `.index` segment entirely and resolves to the **subfolder name**:

| Component | View — actual | View — what the mirror rule would predict |
| --- | --- | --- |
| `App\Livewire\Users\Index` | `resources/views/livewire/users.blade.php` | ~~`resources/views/livewire/users/index.blade.php`~~ |
| `App\Livewire\Roles\Index` | `resources/views/livewire/roles.blade.php` | ~~`resources/views/livewire/roles/index.blade.php`~~ |
| `App\Livewire\SalesRegions\Index` | `resources/views/livewire/sales-regions.blade.php` | ~~`resources/views/livewire/sales-regions/index.blade.php`~~ |
| `App\Livewire\Products\Index` | `resources/views/livewire/products.blade.php` | ~~`resources/views/livewire/products/index.blade.php`~~ |
| `App\Livewire\Products\AttributeTypes\Index` | `resources/views/livewire/products/attribute-types.blade.php` | ~~`resources/views/livewire/products/attribute-types/index.blade.php`~~ |

This is explicit in the installed vendor source:

```php
// vendor/livewire/livewire/src/Finder/Finder.php — Finder::generateNameFromClass()
// If using an index component in a sub folder, remove the '.index' so the name is the subfolder name...
if ($fullName->endsWith('.index')) {
    $fullName = $fullName->replaceLast('.index', '');
}
```

So `App\Livewire\Users\Index` becomes the component name `users`, and `users` resolves to `livewire/users`. The nested path is still *offered* as a fallback (`Finder` also probes `<folder>/index.blade.php` and `<folder>/<folder>.blade.php`), but the flat file is what this repo uses and what a reader should expect to find.

✅ Good — the real pairing in this repo: `app/Livewire/Users/Index.php` ↔ `resources/views/livewire/users.blade.php`.
❌ Bad — assuming the mirror rule holds and looking for (or creating) `resources/views/livewire/users/index.blade.php`. It is not the path Livewire reports as the component's view, and a second file there is a silently unused duplicate.

The third row (task 0017) adds the one thing the first two could not show: **the subfolder name is kebab-cased on the way down**, so a multi-word area segment splits — `App\Livewire\SalesRegions\Index` resolves to `livewire/sales-regions.blade.php`, not `livewire/salesregions.blade.php`. That is the ordinary mirror rule applied to the *folder* name after `.index` is stripped, but `Users` and `Roles` are single words and demonstrated none of it.

**This has already cost real time once — twice now — so it is worth stating as a habit rather than a rule to recall.** Task 0010's own Phase 1 spec — and its sibling 0011's — both wrote the nested path for `App\Livewire\Roles\Index`, and the error surfaced only when the story's test suite ran and threw `Illuminate\View\ViewException: File does not exist at path .../resources/views/livewire/roles.blade.php`. Livewire never even probes the nested path first, so nothing hints at the mistake until something renders. When adding an `Index` component, resolve the view path **by running the component**, not by reasoning about it.

Task 0017 hit the *other* half of the same trap, and it is worth knowing because it costs nothing to walk into: its task file quoted the rule correctly and its component was written to the flat path, but an `artisan make:` scaffold still deposited an unused `resources/views/livewire/sales-regions/index.blade.php` stub on disk. Nothing failed — the flat view resolved, the tests passed, and the stub simply sat there as a silently-unused duplicate until it was noticed and removed (verified: only `resources/views/livewire/sales-regions.blade.php` exists today). **So the check is not only "did I write the right path" but "is there a second file at the wrong one".**

Practical consequence when adding the next module screen: an `Index` component for a new area lands at `resources/views/livewire/<area>.blade.php`, one level *shallower* than its class. Any other component in that same subfolder follows the normal mirror rule, so the two live at different depths — that asymmetry is expected, not a mistake. **Story 0027 is the first real instance of this, replacing the hypothetical `App\Livewire\Users\Editor` this paragraph used to cite** (`Users` has no `Editor` component — its create/edit form is a modal on `Index` itself, not a second class): `App\Livewire\Products\Index` → `resources/views/livewire/products.blade.php` (the `Index`-in-a-subfolder exception, flat, the table's **fourth** row) sits one level shallower than its sibling `App\Livewire\Products\Editor` → `resources/views/livewire/products/editor.blade.php` (the ordinary mirror rule, nested) — same folder, two different view depths, exactly as predicted.

The **fifth** row (story 0028) is the first **two-level-deep** subfolder before an `Index` class, and it confirms the mechanism generalises rather than needing a special case: `Finder::generateNameFromClass()` strips only the trailing `.index` segment, so `App\Livewire\Products\AttributeTypes\Index` becomes the component name `products.attribute-types` (both remaining segments kebab-cased independently — `AttributeTypes` → `attribute-types`, not `attributetypes`), which resolves to the flat `livewire/products/attribute-types.blade.php` — one level shallower than the class's own three-segment namespace, never `livewire/products/attribute-types/index.blade.php`. Verified by running the component (per the habit two paragraphs above), not by reasoning about it from the vendor source alone.

**Story 0019 is the first real instance of that "any other component" case, and it is worth naming because the exception above is memorable enough to be over-applied.** `App\Livewire\Media\Gallery` resolves to `resources/views/livewire/media/gallery.blade.php` — the **normal** mirror rule, nested, because the class is not named `Index`. The exception keys on the class name, never on the component living in a subfolder. Note the story's own task file had to state this explicitly to stop the mistake being made in the other direction, which is the tell that the exception has become the thing people remember.

Story 0021 is the second confirmation: `App\Livewire\Components\WysiwygEditor` → `resources/views/livewire/components/wysiwyg-editor.blade.php`, the ordinary mirror rule again, for the identical reason — the class is not named `Index`, and living inside a subfolder that is itself not a module area (`Components/`, per [base-standards.md](base-standards.md#directory-structure)) changes nothing about which rule applies.

Story 0022 is the third: `App\Livewire\Components\SearchableMultiSelect` → `resources/views/livewire/components/searchable-multi-select.blade.php`. The sibling `MultiSelectOptionsResolver` in the same folder is a plain interface with no view of its own, and is not subject to this rule at all — the mirror rule (and its exception) governs a Livewire `Component` subclass, not every file that happens to live under `app/Livewire/`.

Note: `resources/views/livewire/auth/*.blade.php` (login, register, forgot-password, etc.) are **plain Blade views**, not Livewire components — they live under `livewire/` for directory consistency but are bound directly as Fortify's auth views, e.g. `Fortify::loginView(fn () => view('livewire.auth.login'))` in [`app/Providers/FortifyServiceProvider.php`](../../app/Providers/FortifyServiceProvider.php). Don't assume every file under `resources/views/livewire/` has a matching PHP component class — check for one before citing it.

## Traits and their methods

Validation-rule traits are suffixed `ValidationRules`, and every public method on them is suffixed `Rules` and returns a rule array — no exceptions in the current codebase:

```php
// app/Concerns/PasswordValidationRules.php — trait name ends in "ValidationRules"
trait PasswordValidationRules
{
    protected function passwordRules(): array { /* ... */ }        // ends in "Rules"
    protected function currentPasswordRules(): array { /* ... */ } // ends in "Rules"
}
```

```php
// app/Concerns/ProfileValidationRules.php
trait ProfileValidationRules
{
    protected function profileRules(?string $userId = null): array { /* ... */ }
    protected function nameRules(): array { /* ... */ }
    protected function emailRules(?string $userId = null): array { /* ... */ }
}
```

```php
// app/Concerns/UserValidationRules.php
trait UserValidationRules
{
    protected function roleRules(): array { /* ... */ }
    protected function statusRules(): array { /* ... */ }
}
```

```php
// app/Concerns/RoleValidationRules.php
trait RoleValidationRules
{
    protected function roleNameRules(?int $roleId = null): array { /* ... */ }
    protected function rolePermissionRules(): array { /* ... */ }
}
```

```php
// app/Concerns/MediaValidationRules.php
trait MediaValidationRules
{
    public const MAX_UPLOAD_KB = 8192;       // a constant, not a rule method — see below
    public const MAX_DIMENSION = 4000;

    protected function imageUploadRules(): array { /* ... */ }
    protected function mediaDetailsRules(): array { /* ... */ }
}
```

```php
// app/Concerns/SalesRegionValidationRules.php
trait SalesRegionValidationRules
{
    protected function rateRules(): array { /* ... */ }
    protected function codeRules(): array { /* ... */ }
    protected function descriptionRules(): array { /* ... */ }
    protected function replacementDefaultRules(): array { /* ... */ }
}
```

`SalesRegionValidationRules` (task 0017) is the convention applied unchanged to a fourth trait — `<Noun>ValidationRules`, every method `<noun>Rules()`, flat and single-concern, composed at the consumer (`use SalesRegionValidationRules;` in `App\Livewire\SalesRegions\Index`). One thing it demonstrates that the others do not: **a `<noun>Rules()` method's noun is the *field*, not the model**, so a trait named after the model can hold `rateRules()` / `codeRules()` — the model name is not repeated in each method. `replacementDefaultRules()` names the field it validates (`$replacementDefaultId`) rather than the operation that submits it.

```php
// app/Concerns/ProductValidationRules.php
trait ProductValidationRules
{
    protected function productNameRules(): array { /* ... */ }
    protected function productSkuRules(?string $productId = null): array { /* ... */ }
    protected function productCategoryIdRules(): array { /* ... */ }
    protected function productTypeRules(): array { /* ... */ }
    protected function productStatusRules(): array { /* ... */ }
    protected function productPriceRules(): array { /* ... */ }
    protected function productStockRules(): array { /* ... */ }
    protected function productDescriptionRules(): array { /* ... */ }
    protected function productFeaturedMediaIdRules(): array { /* ... */ }
    protected function productGalleryMediaIdsRules(): array { /* ... */ }
}
```

`ProductValidationRules` (story 0024) is a **deliberate, reasoned exception to the field-not-model rule directly above** — every method is entity-prefixed (`productNameRules()`, `productSkuRules()`, …), not `nameRules()`/`skuRules()`. This is not a style preference; it is forced by a real, verified PHP fatal error. `App\Concerns\ProductCategoryValidationRules` and `App\Concerns\ProfileValidationRules` **already both** declare `nameRules()`, and `App\Concerns\SalesRegionValidationRules` **already** claims `descriptionRules()` — PHP raises a fatal error the moment two traits composed onto one class declare the same method name. **Corrected 2026-09-04 (story 0027) — the sentence naming the "obvious future consumer" was wrong about which trait that consumer composes, and is quoted here rather than silently rewritten, per this project's audit-authored-page convention.** It used to read: *"…and the obvious future consumer (story 0027's product editor, which needs a create-a-category-on-the-fly control) composes exactly `ProductValidationRules` with `ProductCategoryValidationRules`."* Story 0027 shipped with no create-a-category-on-the-fly control at all — `App\Livewire\Products\Editor`'s category field is a plain `<flux:select>` populated from `categoryOptions()`, reading the existing catalog, with no inline "create a new category" affordance — so its class composes only `ProductValidationRules` (`use ProductValidationRules;`, verified against the shipped file), never `ProductCategoryValidationRules`. The collision the entity-prefix exception forestalls (`ProductCategoryValidationRules`/`ProfileValidationRules` already claiming `nameRules()`, `SalesRegionValidationRules` already claiming `descriptionRules()`) is therefore still real and still the reason for the prefix — it has simply not been exercised by any shipped consumer yet, and the rule was written defensively rather than reactively. The prefix is applied **uniformly across every method in the trait, not selectively** — an earlier draft exempted `descriptionRules()`, which is precisely the one name that collides today, and a blanket rule reviewed in one glance is safer than a per-method judgement about which names *might* collide with a trait that does not exist yet. Every method still ends in `Rules`, so the half of the convention that governs discoverability at the call site is unchanged; only the noun gains a prefix, and only in this trait.

✅ Good — the real, shipped naming: `productDescriptionRules()`, which would otherwise collide with `SalesRegionValidationRules::descriptionRules()` the moment both traits are composed onto one class.
❌ Bad — the field-not-model form this trait would otherwise use, and the one collision that is real today (adapted to illustrate; not present in the repo): `descriptionRules()` on `ProductValidationRules` fatals with `PHP Fatal error: Trait method descriptionRules has not been applied, because there are collisions with other trait method names` the instant a consumer also `use`s `SalesRegionValidationRules`.

> ⚠️ **Narrowed 2026-09-03 (story 0026, Phase 5 finding N-8) — the paragraph above's claim that the prefix is "applied uniformly across every method in the trait, not selectively" is no longer true of the whole file, and is quoted here rather than silently rewritten, per this project's audit-authored-page convention.** Story 0026 added two methods to this same trait, `salesRegionIdsRules()` and `salesRegionIdRules()`, and neither is entity-prefixed — they are not `productSalesRegionIdsRules()`/`productSalesRegionIdRules()`. That is correct, not an inconsistency: the two methods name the **related Sales Region entity**, not one of the product's own fields, so 0024's collision-driven exception was never a candidate rule for them in the first place — no other trait `ProductValidationRules` composes with declares `salesRegionIdsRules()`/`salesRegionIdRules()` (verified, not assumed), so the plain field-not-model rule at the top of this section governs them instead. Read "applied uniformly across every method in the trait" as scoped to what it always meant in practice — **uniform within the product-field group**, every method naming one of the product's own fields — rather than literally every method the file will ever hold. Nothing about the reasoning for *why* the product-field methods are prefixed has changed.

`App\Concerns\ProductAttributeValidationRules` (story 0028) is the sixth `<Noun>ValidationRules` trait, and its five methods — `attributeTypeNameRules()`, `attributeValueListRules()`, `attributeValueRowRules()`, `attributeValueIdRules()`, `attributeValueRules()` — read as entity-prefixed at a glance, the same shape `ProductValidationRules`'s collision-driven exception uses, but they are not that exception applied a second time: none of the five names an existing sibling trait already claims (`nameRules()`/`valueRules()`/`typeNameRules()` are all free today), so the prefix here follows the *field-not-model* rule directly — `attributeTypeName` and `attributeValue` are the actual submitted field names (`$name`, `$values[i]['value']`), not the trait's own model name repeated for no reason. The two row-shape methods (`attributeValueRowRules()`, `attributeValueIdRules()`) exist purely to close a security finding (see [database/schema.md](../database/schema.md#product_attribute_values)) rather than to validate business content, and are named after the exact wildcard path they gate (`values.*`, `values.*.id`).

`App\Concerns\ProductVariantValidationRules` (story 0029) is the **seventh** `<Noun>ValidationRules` trait, and it is entity-prefixed for the identical collision reason `ProductValidationRules` is — its four methods (`variantCombinationRules()`, `variantCombinationValueRules()`, `variantPriceRules()`, `variantStockRules()`, `variantFeaturedMediaIdRules()`) would otherwise collide directly with `ProductValidationRules`'s own `productPriceRules()`/`productStockRules()`/`productFeaturedMediaIdRules()` field-named siblings once a future variant editor composes both traits on one class, per naming.md's own field-not-model exception (the trait names read `variant<Field>Rules()`, not the bare field, because `priceRules()`/`stockRules()`/`featuredMediaIdRules()` are exactly the names a plain field-not-model reading would produce and exactly the names most likely to already exist on a sibling trait). **It deliberately does *not* `use ProductValidationRules`**, and deliberately declares **no** `skuRules()`/`variantSkuRules()` method at all — there is no SKU *input* to validate, since `product_variants.sku` is server-derived (never typed) and composing `ProductValidationRules` would put its `productSkuRules()` in reach of a caller that must never validate one. `variantCombinationRules()`/`variantCombinationValueRules()` are the trait's one genuinely new naming shape: a **two-pass** validation split, `variantCombinationRules()` bounding the submitted array's own shape/size alone (no rule touching the database) and `variantCombinationValueRules()` validating each element — named for the *pass*, not a submitted field, since `attributeValueIds` is the field and there is no `attributeValueIdsRules()`/`attributeValueIdRules()` pair here the way [`ProductAttributeValidationRules`](#classes) names its own row-shape methods after a wildcard path.

Note `RoleValidationRules` (task 0010) and `UserValidationRules` are **different traits about different things** despite the near-collision in name: the former validates a *`Role` row's* own fields, the latter validates the *role/status a user is being assigned*. Both are named after the model whose input they describe, which is the rule — not after the screen that submits it.

When adding a new validation concern, follow this exact pattern: `<Noun>ValidationRules` trait, `<noun>Rules()` methods — don't introduce a differently-named alternative (e.g. `getPasswordValidation()`). Traits stay **flat and single-concern**, composed at the consumer (`use ProfileValidationRules, UserValidationRules;` in `App\Livewire\Users\Index`, mirroring `CreateNewUser`'s `use PasswordValidationRules, ProfileValidationRules;`) — no trait in `app/Concerns/` `use`s another.

## Route names

Dot notation, `<resource>.<action>`, verified in `routes/settings.php`:

```php
// routes/settings.php
Route::livewire('settings/profile', Profile::class)->name('profile.edit');
Route::livewire('settings/appearance', Appearance::class)->name('appearance.edit');
Route::livewire('settings/security', Security::class)->name('security.edit');
```

Full real route names, including the ones Fortify registers, are listed in [api/routes.md](../api/routes.md).

## Permission names

Same dot notation as route names, one level lower: `<module-slug>.<action>`, where the module slug is **kebab-case** and the action is a bare verb. Verified in `database/seeders/RolePermissionSeeder.php`, which owns the canonical catalog:

```php
// database/seeders/RolePermissionSeeder.php
public const MODULES = [
    'users', 'products', 'sales-regions', 'shipping', 'payment-methods',
    'customers', 'orders', 'blog', 'store-languages', 'media',
];

public const ACTIONS = ['view', 'create', 'edit', 'delete'];

/**
 * Non-CRUD permissions that sit outside the module x action grid.
 *
 * @var array<int, string>
 */
public const ROLE_PERMISSIONS = ['roles.manage', 'roles.manage-administrators'];
```

✅ Good — `sales-regions.delete`, `payment-methods.view`, `roles.manage-administrators`: kebab-case slug, dot separator, verb (or verb phrase, itself kebab-cased) after the dot.
❌ Bad — do not write `salesRegions.delete`, `sales_regions.delete`, `delete-sales-regions`, or a prose form like `'manage administrator-level roles/users'`. A permission name that isn't in the seeded catalog makes `can()` / `hasPermissionTo()` throw `PermissionDoesNotExist` at runtime, so this is a correctness rule, not just a style preference.

A permission that a new feature needs is added to the constants above — never as a string only one component knows about. The catalog, the two seeded roles, and which of them hold what are documented in [architecture/authorization.md](../architecture/authorization.md#permission-catalog).

`'media'` (story 0019) is the **only** slug appended since task 0002 wrote this constant, and the one-line diff above is genuinely the whole production change — but what that one line costs elsewhere, and the one thing it silently breaks, are in [The `media` module, and what a catalog amendment costs](../architecture/authorization.md#the-media-module-and-what-a-catalog-amendment-costs). Read it before adding the eleventh.

**Where a permission name is written in PHP, name it once on the class that owns the rule.** Task 0009 established this for the two role-management names, as `public const` on the policy that decides with them — read by the policy itself, by `App\Actions\Roles\EnforceAdministratorPermissionGrant`, and by both classes' tests:

```php
// app/Policies/RolePolicy.php
public const ADMINISTRATOR_LEVEL_PERMISSION = 'roles.manage-administrators';
public const ROLE_MANAGEMENT_PERMISSION = 'roles.manage';
```

[`App\Policies\SalesRegionPolicy`](../../app/Policies/SalesRegionPolicy.php) (task 0017) is the second policy to follow it — `public const VIEW_PERMISSION = 'sales-regions.view';` / `EDIT_PERMISSION = 'sales-regions.edit';` — which makes `RolePolicy`'s shape the majority and `UserPolicy`'s repeated literals the outlier rather than the status quo. Note the constant names shorten as the class narrows: `RolePolicy` needs `ROLE_MANAGEMENT_PERMISSION` to distinguish two role-scoped rules, while `SalesRegionPolicy` has one ability per verb, so `VIEW_PERMISSION` / `EDIT_PERMISSION` are unambiguous read as `SalesRegionPolicy::EDIT_PERMISSION`. The rule is that the constant names the **rule**, at whatever precision the class requires — not that every policy uses the same constant names.

[`App\Policies\MediaPolicy`](../../app/Policies/MediaPolicy.php) (story 0019) is the **third** follower and the first to carry all four — `VIEW_PERMISSION` / `CREATE_PERMISSION` / `EDIT_PERMISSION` / `DELETE_PERMISSION`, one per CRUD verb — so of this app's four policies, only `UserPolicy` still repeats its literals. That deferral (task 0009's finding **F5**) is now the minority case by three to one; it remains a cleanup candidate rather than a pattern to copy.

**Two more followers shipped since, one of them missed by this page until now.** `App\Policies\ProductCategoryPolicy` (story 0023) already carries the identical four constants — a gap in this page's own record, corrected in place rather than left stale — and [`App\Policies\ProductPolicy`](../../app/Policies/ProductPolicy.php) (story 0024) is the fifth explicit follower, also with all four. Both gate on the same `products.*` permission strings (a product category is a product sub-resource, so it shares the module rather than inventing its own), so `ProductPolicy::VIEW_PERMISSION` and `ProductCategoryPolicy::VIEW_PERMISSION` are two different constants on two different classes that happen to equal the identical string `'products.view'` — read that as two policies agreeing on one catalog permission, not as duplication to collapse. [`App\Policies\ProductAttributeTypePolicy`](../../app/Policies/ProductAttributeTypePolicy.php) (story 0028) is the sixth explicit follower, on the same `products.*` catalog for the same reason. `UserPolicy` is now the sole outlier among **seven** policies rather than six.

✅ Good — `$user->hasPermissionTo(self::ADMINISTRATOR_LEVEL_PERMISSION)`, and `RolePolicy::ADMINISTRATOR_LEVEL_PERMISSION` from a collaborator.
❌ Bad — re-typing `'roles.manage-administrators'` at each call site. This is exactly what `App\Policies\UserPolicy` still does at four of its own call sites (task 0009's Phase 4 finding **F5**, pre-existing and deliberately deferred); it is a known cleanup candidate, not the pattern to copy. The constant name describes the *rule* (`ADMINISTRATOR_LEVEL_PERMISSION`), not the string, so a future catalog rename touches one line.

## Translation keys

`lang/<locale>/<domain>.php` — one file per domain area, keys grouped by feature, every segment `snake_case`. Verified in [`lang/en/users.php`](../../lang/en/users.php) and its Spanish counterpart, which must stay key-for-key identical:

```php
// lang/en/users.php
'statuses' => [
    'active' => 'Active',
    // ...
],

'email_change' => [
    'notification_subject' => 'Confirm your new email address',
    'pending_notice' => 'A change to :email is pending. Use the link sent to that address to confirm it.',
    'confirmed' => 'Your email address has been updated.',
    'refused' => 'This email verification link is no longer valid.',
    'throttled' => 'Too many email change requests. Please try again later.',
],
```

✅ Good — `users.statuses.active`, `users.email_change.throttled`: domain file, feature group, snake_case leaf. Values that interpolate use Laravel's `:placeholder` form (`:email`).
❌ Bad — do not write `users.emailChange.throttled` (camelCase segment), a flat `users.email_change_throttled` (no group), or a literal string inline in a component instead of a key. `App\Enums\UserStatus::label()` resolves `__('users.statuses.'.$this->value)` by convention, so a status label that isn't in the `statuses` group renders as its own raw key.

**A `label()` method on an enum is not automatic — an enum with one rendering site keeps its copy in that screen's own lang file.** `UserStatus::label()` exists because the status is rendered in more than one place and by the enum's own `cases()` loop. [`App\Enums\SalesRegionKind`](../../app/Enums/SalesRegionKind.php) deliberately has **no** `label()` even now that task 0018 renders it: `kind` drives structure everywhere on the Sales Regions list (indentation, chevron, grouping) and is surfaced as text in exactly one place, the edit modal's read-only context block, so the two labels live in that screen's own file as `sales-regions.labels.kind_country` / `kind_fiscal_territory` and the view matches on the case. Story 0016 deferred `label()` to "the first story that actually renders `kind`"; 0018 is that story and declined it, which is the decision to copy — **add `label()` when a second consumer appears, not when the first one does**, because a one-caller `label()` is indirection that hides which lang group owns the copy. Note the leaves are still snake_case (`kind_fiscal_territory`) even though the enum's backing value is too — the match is a coincidence of this enum, not a rule to rely on.

**A count-dependent message is one key with a `|`-delimited plural form, resolved with `trans_choice()` — never two keys and never a hand-built `$count === 1 ? … : …`.** [`lang/en/roles.php`](../../lang/en/roles.php) (task 0010) is the first one:

```php
// lang/en/roles.php
'index' => [
    'delete_blocked' => 'This role cannot be deleted while it is still held by :count user.|This role cannot be deleted while it is still held by :count users.',
],
```

```php
// app/Livewire/Roles/Index.php — deleteRole()
trans_choice('roles.index.delete_blocked', $role->users_count, ['count' => $role->users_count])
```

✅ Good — the singular/plural split lives in the *translation file*, so a locale with different plural rules (Spanish here, and any future one) can express them without touching PHP.
❌ Bad — `delete_blocked_one` / `delete_blocked_many` as two keys, or branching on the count in the component. Both hardcode English's two-form plural rule into code that other locales have to live with.

**Six `trans_choice()` keys exist in this codebase as of story 0024b, in two different established forms — neither is "the newer one", and both have coexisted since task 0019.** `lang/en/roles.php` (task 0010, extended by task 0011) has three keys in the **simple `singular|plural`** form shown above — `index.delete_blocked`, `index.summary`, `index.permission_count`. `lang/en/media.php` (story 0019) has two keys in a different, **explicit-range** form instead — `gallery.count_summary`, `gallery.selection_count` — because both of those need to express a genuine **zero**-count case (`{0} No images|{1} :count image|[2,*] :count images`) that the simple form's `count === 1 ? first : second` selection cannot represent. `lang/en/products.php`'s `categories.delete_blocked` (story 0024b) is the **sixth** key overall, and it goes back to the **simple** form: the guard it renders for (`App\Actions\ProductCategories\DeleteProductCategory`) only ever throws once the count is already positive, so there is no zero case to express and reaching for the explicit-range form would buy nothing.

✅ Good — the choice between the two forms is not precedent order, it is **which of the two already-established forms fits the message's own semantics**: does the message ever need to render at `count === 0`? If yes, explicit-range (`media.php`'s shape); if the count is guaranteed positive by the code path that renders it, simple `singular|plural` (`roles.php`'s and now `products.php`'s shape).
❌ Bad — treating this as "there are two forms, so pick whichever" without checking the zero-case question, or (a mistake this story's own task file caught at Phase 2 review) describing a new simple-form key as "the second `trans_choice` key, the first outside `roles.php`" — that undercounts by four the moment `media.php`'s two explicit-range keys are counted too.

**The rule binds a Blade template exactly as it binds a component.** Task 0011 added two more `trans_choice()` keys to the same group — `roles.index.summary` (the list's live role count) and `roles.index.permission_count` (each row's granted-permission count) — and the second one shipped its first draft with `':count permission|:count permissions'` written **inline in `resources/views/livewire/roles.blade.php`**, where `lang/es/roles.php` could never reach it (Phase 5 finding F-3). A hardcoded plural is no more acceptable in a view than in PHP; the giveaway is the `|` character appearing anywhere outside a `lang/` file.

**A key leaf is `snake_case` even when the value it names is not — map at render, never rename the value.** This story is where the two collide: the permission catalog's own names are `<module-slug>.<action>` with kebab-case segments (`sales-regions.view`, `roles.manage-administrators`), and those names are fixed by the seeded catalog. The labels are therefore **composed** from two flat arrays rather than written one key per permission:

```php
// lang/en/roles.php — top-level siblings of 'index', not nested under it
'modules' => ['users' => 'Users', 'sales_regions' => 'Sales regions', /* … */ 'roles' => 'Roles'],
'actions' => ['view' => 'View', /* … */ 'manage_administrators' => 'Manage administrator-level roles/users'],
```

```blade
{{-- resources/views/livewire/roles.blade.php --}}
__('roles.modules.'.str_replace('-', '_', $module)).' — '.__('roles.actions.'.str_replace('-', '_', $action))
```

✅ Good — 16 keys per language (10 module labels + 6 action labels) covering 38 of the 42 permissions, the hyphen mapped to an underscore at the point of lookup, and a new seeded module needing exactly one new key.
❌ Bad — `'sales-regions' => …` as a literal kebab-case key leaf (violates the rule above), one key per permission (42+ keys, and a catalog addition silently renders a raw key), or renaming the permission itself to match the key. The permission name is the database's, not the translation file's.

> **⚠️ Corrected 2026-08-29 — this warning said story 0019 had shipped the ❌, and it had not.** As written, it claimed that story appended the tenth module slug `media` and *"did **not** add a `roles.modules.media` leaf to either locale"*, so the Roles matrix rendered the raw key in both languages. That is false: `lang/en/roles.php` carries `'media' => 'Media'` and `lang/es/roles.php` carries `'media' => 'Medios'`, both present in story 0019's own tree and untouched by any story since — verified by reading both files, which is what the original claim says it did. It is the second false "verified" finding from that pass; [errors-log.md](../errors-log.md#one-docs-pass-reported-two-gaps-that-were-not-there-both-marked-verified--2026-08-29) records why one docs pass produced two. **Everything below the correction is the rule, and the rule is unchanged** — it is exactly *because* nothing fails that it is worth stating: the four `media.*` permissions would be seeded, grantable and enforced correctly with or without the leaf, `__()` returning its own key is not an error condition, and the seeder tests assert names and counts rather than rendered copy, so a missing leaf is **only** visible by looking at the screen. `media` is now the evidence the rule is followable, not the evidence it gets missed. Two rules follow. **(a) Adding a module slug means adding its `roles.modules.<slug>` leaf to `lang/en/` *and* `lang/es/` in the same change** — the label is not derived, and `__()` returning its own key is not an error condition. **(b) The `roles.actions.*` half needs nothing**, because a new module reuses the four existing CRUD verbs; only a genuinely new *action* segment would need a leaf there. Note `media` is a single lowercase word, so its leaf is `media` with no mapping — the `str_replace('-', '_', …)` step only matters for a kebab-case slug like `sales-regions`.

**When a lang file exists to supply copy for a registry, its key structure mirrors the registry's own keys exactly — one leaf per registry key, no extras, no renames.** [`lang/en/navigation.php`](../../lang/en/navigation.php) (task 0013) is the first such file, and the mirroring is what makes it reviewable: `config/modules.php` has `groups.platform` / `groups.settings` / `groups.taxes` and `items.dashboard` / `items.users` / `items.roles` / `items.sales_regions`, so the lang file has exactly those seven leaves under exactly those two headings.

```php
// lang/en/navigation.php — the leaves are config/modules.php's own array keys
'groups' => ['platform' => 'Platform', 'settings' => 'Settings', 'taxes' => 'Taxes'],
'items' => ['dashboard' => 'Dashboard', 'users' => 'Users', 'roles' => 'Roles & permissions', 'sales_regions' => 'Sales Regions'],
```

✅ Good — a registry key is simultaneously the translation leaf and the rendered `data-test` hook (`data-test="sidebar-link-roles"`), so one identifier connects the config entry, its copy, and the test that asserts on it. Adding a module means adding the same leaf to `lang/en/` and `lang/es/`, and nothing else.
❌ Bad — writing the copy into the registry itself (`'label' => 'Roles & permissions'` in `config/modules.php`), which puts a literal English string somewhere `lang/es/` cannot reach; or naming the leaf differently from the registry key (`items.roles_and_permissions` for the `roles` entry), which breaks the one-identifier property for no gain. Note this rule does **not** conflict with the snake_case rule above.

**Since task 0018 the multi-word case is shipped rather than hypothetical, and this paragraph is the sentence it was written against.** From task 0013 until then, every registry key was a single lowercase word (`dashboard`, `users`, `roles`), so nothing forced the decision and this text read forward: *"a future registry key that is genuinely multi-word is snake_case on both sides (`items.sales_regions`), never kebab-case."* The Sales Regions entry is that key, and it went in as `sales_regions` — verified in `config/modules.php`, both `navigation.php` files, and the rendered `data-test="sidebar-link-sales_regions"` hook that `tests/Feature/Navigation/SidebarModuleGatingTest.php` selects. Three identifiers move together, so getting the key wrong breaks all three at once.

The **values** inside that same entry stay kebab-case, and the distinction is the whole rule: `'permissions' => ['sales-regions.view']` is a seeded permission name, `'route' => 'sales-regions.index'` a route name, `'current_when' => 'sales-regions.*'` a route pattern. None of the three is a registry *key*, and each is owned by something outside this file — the seeded catalog and `routes/sales-regions.php` — exactly like the *permission* names above, whose kebab-case is imposed by the catalog and mapped at lookup.

Note `APP_LOCALE=en` today, so everything renders in English until the interface language switcher exists — an accepted, documented consequence of the English-source decision, not a defect. Adding a key means adding it to **both** `lang/en/` and `lang/es/` in the same change.

**Exception: a validation `attributes` block's leaf is the field name, byte-for-byte, even when that name is camelCase.** [`lang/en/sales-regions.php`](../../lang/en/sales-regions.php) (task 0017) is this repo's first `attributes` block — the array Laravel's `validate(..., attributes: __(...))` uses to substitute a human label for `:attribute` in a validation message. Its `replacementDefaultId` leaf is camelCase because it must equal `App\Livewire\SalesRegions\Index::$replacementDefaultId`'s own property name exactly, or Laravel silently fails to find the override and falls back to the raw field name. This is not a violation of the snake_case-leaf rule above — it is a different kind of key entirely, one Laravel itself defines the shape of, the same way a route parameter name or a Blade component prop name is never snake_cased just because it appears in a `lang/` file. Do not "fix" a camelCase `attributes` leaf to snake_case; doing so breaks the substitution instead of correcting a style slip.

## Boolean properties

Livewire component boolean properties are named as a predicate, prefixed `can`/`is`/`show`/`requires` — never a bare noun. Verified in `app/Livewire/Settings/Security.php`:

```php
public bool $canManageTwoFactor;
public bool $canManagePasskeys;
public bool $twoFactorEnabled;      // present-tense state, not prefixed — see note below
public bool $requiresConfirmation;
public bool $showModal;
public bool $showVerificationStep;
public bool $showDeleteModal;
```

Two patterns coexist in this file: `can*`/`requires*`/`show*` for capability/UI-state flags, and a bare past-participle (`twoFactorEnabled`) for a fact about the authenticated user's current state. Follow whichever of the two fits: use `can`/`requires`/`show` for UI/permission flags you're introducing, and a plain past-participle only for a mirrored model/domain fact (as `twoFactorEnabled` mirrors `User::hasEnabledTwoFactorAuthentication()`).

**The same rule binds a `#[Computed]` boolean method**, which is what a modern Livewire screen actually exposes to its view. `App\Livewire\Users\Index` carries four (task 0015a): `requiresPasswordConfirmation()`, `isEditingOwnRow()`, `isDeletingOwnRow()`, `isAdministratorRoleSelected()` — a predicate name, never a noun (`passwordConfirmation()`), and never a `get*` prefix.

**Name the predicate so it is unambiguous read *out* of its class.** `App\Actions\Auth\EnsureRecentPasswordConfirmation`'s non-throwing method is `isRecentlyConfirmed()`, deliberately not `isConfirmed()`: at the call site (`app(EnsureRecentPasswordConfirmation::class)->isRecentlyConfirmed()`) the class name supplies "password", but *recency* is the whole content of the check and a bare `isConfirmed()` reads as a yes/no about whether the password was ever confirmed at all. The invokable's own name follows the existing imperative-verb-phrase rule for actions (`Ensure…`, no `Action`/`Service` suffix), so the throwing and non-throwing halves of one rule read as a command and a question respectively.

_Last updated: 2026-09-04 — Story 0029 (Product variants — core backend). Added eight class/file table rows (`ProductVariant`, `CreateProductVariant`, `UpdateProductVariant`, `DeleteProductVariant`, `HashVariantCombination`, `DeriveVariantSku`, `TranslateProductVariantUniqueViolation`, `ProductVariantValidationRules`) — every action name an imperative verb phrase with no `Action`/`Service` suffix, matching the existing rule with nothing new to decide. Added `App\Concerns\ProductVariantValidationRules` as the **seventh** `<Noun>ValidationRules` trait, entity-prefixed for the same collision reason `ProductValidationRules` is (`variantPriceRules()`/`variantStockRules()`/`variantFeaturedMediaIdRules()` would otherwise collide with `ProductValidationRules`'s own field-named siblings), deliberately composing no other trait and declaring no SKU rule at all since the SKU is server-derived — plus its one genuinely new shape, `variantCombinationRules()`/`variantCombinationValueRules()` named for a validation **pass** rather than a submitted field. This story adds **no** new route name, permission, translation-key group, boolean property or `Index`-in-a-subfolder instance — see [architecture/authorization.md](../architecture/authorization.md#product-variant-actions-gate-against-the-parent-product-not-a-new-policy) for why no `ProductVariantPolicy` exists and no permission-name convention entry follows. **Verified as unchanged rather than assumed:** every other section on this page.

_Previously: 2026-09-04 — Story 0027 (Products list + editor UI). Added a **fourth row** to the `Index`-in-a-subfolder exception table (`App\Livewire\Products\Index` → `resources/views/livewire/products.blade.php`), and rewrote the "practical consequence" paragraph beneath it around a **real** instance of the depth asymmetry rather than the hypothetical `App\Livewire\Users\Editor` it used to cite (`Users` has no `Editor` class) — `Products\Index` (flat) and `Products\Editor` (nested, the ordinary mirror rule) now demonstrate it in one folder. **Corrected**, per this project's audit-authored-page convention, the `ProductValidationRules` entity-prefix exception's "obvious future consumer" sentence, which named story 0027 as composing `ProductValidationRules` with `ProductCategoryValidationRules` for a create-a-category-on-the-fly control — the shipped editor has no such control (a plain `<flux:select>` over the existing catalog) and composes only `ProductValidationRules`; the collision the prefix forestalls is real but still unexercised by any shipped consumer, quoted old text kept per convention. **Verified as unchanged rather than assumed:** the class/file table (no new class this page's rules govern — `Products\Index`/`Products\Editor` are Livewire components, covered by the mirror-rule section above rather than the table), the permission-name/`<Model>Policy` sections (no new permission, policy or catalog change), the route-name section (three new route *names*, `products.index`/`.create`/`.edit`, following the existing `<resource>.<action>` dot-notation rule with nothing new to decide), the `trans_choice()`/composed-label sections (`lang/{en,es}/products.php`'s new `index`/`editor` groups are flat, non-plural, non-composed keys), and the boolean-property rule (`$showFeaturedGallery`/`$showStripGallery`/`$showDeleteModal` all follow the existing `show`-prefix pattern)._

_Previously: 2026-09-03 — Story 0028 (Product variant attribute types & values — backend). Added the **fifth** row to the `Index`-in-a-subfolder exception table (after this story's own merge with story 0027's fourth row), and the first demonstrating a **two-level-deep** subfolder before `Index`: `App\Livewire\Products\AttributeTypes\Index` → the flat `resources/views/livewire/products/attribute-types.blade.php`, confirming `Finder::generateNameFromClass()` strips only the trailing `.index` segment and kebab-cases every remaining namespace segment independently, not merely the innermost one. Added `App\Concerns\ProductAttributeValidationRules` as the sixth `<Noun>ValidationRules` trait — entity-prefixed method names that read like `ProductValidationRules`'s collision exception but are not that exception applied again, since none of the five collide with an existing sibling trait; they follow the field-not-model rule directly, naming the actual submitted field. Added `App\Policies\ProductAttributeTypePolicy` as the permission-name convention's **sixth** explicit follower, narrowing `UserPolicy`'s outlier count from "one in six" to "one in seven". Added three class/file table rows (`ProductAttributeTypePolicy`, `SyncProductAttributeValues`, `ProductAttributeValidationRules`). **Verified as unchanged rather than assumed:** the route-name section (no route name — see [api/routes.md](../api/routes.md) for the route contract itself), the translation-keys sections (`lang/{en,es}/products.php` is untouched by this story — the shipped view is a one-line placeholder with no rendered copy), and the boolean-property rule (this story adds no new boolean property; `$showModal`/`$showDeleteModal` follow the existing `show`-prefix pattern unmodified).

_Previously: 2026-09-03 — Story 0026 (Product ↔ Sales Region assignment and tax resolution backend). **Narrowed** the `ProductValidationRules` entity-prefix exception's "applied uniformly across every method in the trait, not selectively" claim (Phase 5 finding N-8, quoted verbatim rather than silently rewritten): this story's `salesRegionIdsRules()`/`salesRegionIdRules()` land in the same trait un-prefixed, correctly, because they name the related Sales Region entity rather than a product field and never collide with a sibling trait — so "uniformly" always meant *within the product-field group*, not literally every method the file will ever hold. Added six class/file table rows (`SyncProductSalesRegions`, `ResolveProductTaxRate`, `ResolvedTaxRate`, `SearchSalesRegions`, `TaxRateResolutionTier`, `NoDefaultSalesRegionException`), all following existing rules with nothing new to decide: the imperative-verb-phrase action rule, `<Thing>Exception`, and a backed enum with TitleCase keys / lowercase values. **Verified as unchanged rather than assumed:** the `Index`-in-a-subfolder exception (this story ships no Livewire component), the route-name section (no route), the permission-name/`<Model>Policy` sections (no new permission, policy or catalog change), and the `trans_choice()`/composed-label sections (`lang/{en,es}/products.php`'s new `sales_regions.*` group is two flat, non-plural, non-composed keys — the existing plain-domain-file convention, nothing to rule on) and the boolean-property rule (no new boolean property).

_Previously: 2026-09-02 — Story 0024b (Product category in-use delete guard). Corrected the **trans_choice() / `|`-delimited plural** section, which was stale rather than merely incomplete: it documented `roles.php`'s three keys in the simple `singular|plural` form but never mentioned `lang/en/media.php`'s two keys (`gallery.count_summary`, `gallery.selection_count`, story 0019) in the **explicit-range** form, both already outside `roles.php`. `lang/en/products.php`'s new `categories.delete_blocked` key (this story) is therefore the **sixth** `trans_choice()` key overall, not "the second, the first outside `roles.php`" as an earlier draft of this story's own task file had it before Phase 2 review caught the gap. Added a real ✅/❌ pair on which of the two established forms to reach for (explicit-range only when the message must render at `count === 0`; simple `singular|plural` otherwise, as this story's key does). **Verified as unchanged rather than assumed:** the classes/file table, the `Index`-in-a-subfolder exception, the permission-name and `<Model>Policy` sections, the composed-label/snake_case-leaf rule, and the boolean-property rule — this story adds no class listed elsewhere on this page, no route, no permission and no boolean property (`App\Models\ProductCategory::products(): HasMany` is a relation method, not a shape any rule on this page governs)._

_Previously: 2026-09-01 — Story 0024 (Products — core CRUD backend). Added the **entity-prefix exception** to the "a `<noun>Rules()` method's noun is the field, not the model" rule (task 0017): `App\Concerns\ProductValidationRules` prefixes every method (`productNameRules()`, `productSkuRules()`, …) rather than the plain field name, because `ProductCategoryValidationRules`/`ProfileValidationRules` already both declare `nameRules()` and `SalesRegionValidationRules` already claims `descriptionRules()` — PHP fatals when two traits composed onto one class declare the same method, and story 0027's editor is expected to compose `ProductValidationRules` with `ProductCategoryValidationRules`. Applied uniformly across every method in the trait, not selectively, with a real ✅/❌ pair. Added `App\Policies\ProductPolicy` to the class/file table and to the **Permission names** "name a permission once on the class that owns the rule" section as the **fifth** explicit follower — and, found while adding it, corrected a gap this page had carried since story 0023: `ProductCategoryPolicy` already used the identical `public const` shape and was never added here, so `UserPolicy`'s outlier count moves from "one in four" to "one in six" rather than "one in five". **Verified as unchanged rather than assumed:** the classes/file table's other rows, the `Index`-in-a-subfolder exception (this story ships no Livewire component at all), the route-name and translation-keys sections (no route, no new registry entry — `lang/en|es/products.php` is a flat, non-composed key set with nothing to rule on beyond the existing plain-domain-file convention), and the boolean-property rule (`Product` has no boolean property or `#[Computed]` predicate)._

_Previously: 2026-08-31 — Story 0022 (Shared searchable, server-side-filtered multi-select component). Added four rows to the class/file table (`NormalizeForSearch`, `UnresolvedSelectionException`, `MultiSelectOptionsResolver`, `SearchableMultiSelect`) — all following existing rules with nothing new to decide (imperative-verb-phrase action, `<Thing>Exception`, one class per file). Added `App\Livewire\Components\SearchableMultiSelect` → `resources/views/livewire/components/searchable-multi-select.blade.php` as the **`Index`-in-a-subfolder exception's third confirmation**, and a note that its sibling `MultiSelectOptionsResolver` — a plain interface with no view — is outside that rule's scope entirely, since the mirror rule governs a Livewire `Component` subclass, not every file under `app/Livewire/`. **No new rule added to Permission names, Translation keys or Boolean properties**: this story adds no permission, no policy and no route (confirmed against the diff — see [base-standards.md](base-standards.md#directory-structure)); `lang/{en,es}/components.php`'s new `searchable_multi_select` key is a flat, one-key-per-string sibling to story 0021's `wysiwyg` key, with no plural or composed form to rule on; and its boolean properties (`$disabled`) reuse the existing bare-adjective pattern `WysiwygEditor::$disabled` already established, not a new shape. **Verified as unchanged rather than assumed:** the `trans_choice()`/composed-label sections and the `<Noun>ValidationRules` traits section — this story adds no plural or composed-label message and no validation trait (`mount()`'s two guards — the `is_subclass_of()` resolver check and the `maxChipAreaHeight` CSS-length allow-list, both D6/D14) are inline checks on the component itself, not `<noun>Rules()` methods, since neither is a Laravel validation rule shared with a second consumer)._

_Previously: 2026-08-31 — Story 0021 (Shared WYSIWYG rich-text editor component — frontend). Added `App\Livewire\Components\WysiwygEditor` → `resources/views/livewire/components/wysiwyg-editor.blade.php` as the **`Index`-in-a-subfolder exception's second confirmation**, alongside `Media\Gallery` — the ordinary mirror rule applies, unaffected by living inside `Components/`, a subfolder that is itself not a module area. **Verified as unchanged rather than assumed:** the class/file table (this story adds no `<Noun>Rules()` trait, no `<Model>Policy`, no new permission name and no route name — `WysiwygEditor` reuses `MediaPolicy`'s existing `viewAny`/`Media::class` ability rather than defining one of its own), the `trans_choice()`/composed-label sections (`components.php`'s keys are flat, one per string, with no plural or composed form), and the boolean-property rule — `$showGallery` and `$disabled` follow the existing `show`-prefix and bare-adjective patterns respectively, neither a new shape._

_Previously: 2026-08-29 — Story 0020 (Shared media gallery modal — frontend). **One correction, and it is to a warning this page added two days earlier.** The composed-label ⚠️ claimed story 0019 shipped without a `roles.modules.media` leaf, so the Roles permission matrix rendered a raw key in both locales — the page's own long-standing ❌ "arriving for real". It never arrived: both leaves (`'media' => 'Media'` / `'media' => 'Medios'`) are present in story 0019's own tree and untouched since, verified by reading the files the original claim says it read. Corrected in place with what it used to say, because the *rule* it hangs on is right and is worth keeping — a missing leaf fails nothing and is visible only by looking at the screen — and `media` is now the evidence the rule is followable rather than evidence it gets missed. This is the second false "verified" finding from story 0019's single Phase 6 pass, alongside the refusal-logging one on [architecture/authorization.md](../architecture/authorization.md#mediapolicy--the-fourth-policy-and-the-first-behind-no-route-at-all); [errors-log.md](../errors-log.md#one-docs-pass-reported-two-gaps-that-were-not-there-both-marked-verified--2026-08-29) records why one pass produced two. **Verified as unchanged rather than assumed:** the class/file table and the imperative-verb-phrase action rule (`App\Actions\Media\UpdateMediaDetails` follows it with nothing new to decide), the `Index`-in-a-subfolder exception and its `Media\Gallery` counter-example (`App\Livewire\Dev\MediaGalleryHarness` → `livewire/dev/media-gallery-harness.blade.php` is the ordinary mirror rule, and is a second confirmation that the exception keys on the class name), the `<Noun>ValidationRules` traits (`MediaValidationRules` gained a `max:2000` on an existing rule, not a method or a name), the permission-name and `<Model>Policy` sections (no permission, policy or catalog change), the route-name section (no route name), and the boolean-property rule — the story's new properties (`$open`, `$multi`, `$search`, `$editingMediaId`, `$pendingUploads`) follow the existing never-`null` and predicate-naming rules unmodified._

_Previously: 2026-08-27 — Story 0019 (Media Library upload and conversions — backend). Four changes. **Updated the quoted `RolePermissionSeeder::MODULES` constant**, which this page reproduces verbatim and which grew for the first time since task 0002 wrote it — `'media'` is the tenth slug, and a pointer now sends a reader to [what that one-line amendment actually costs](../architecture/authorization.md#the-media-module-and-what-a-catalog-amendment-costs) before they add an eleventh. **Turned this page's own ❌ into a ⚠️ about the shipped state**: the composed-label rule has warned since task 0011 that "a catalog addition silently renders a raw key", and story 0019 is where that happened — no `roles.modules.media` leaf was added to either locale, so the Roles permission matrix renders the literal key as a row label in both languages, with a fully green suite, because the seeder tests assert names and counts and never rendered copy. Recorded with the two rules that follow (add the leaf to both locales in the same change; the `roles.actions.*` half needs nothing, since a new module reuses the four existing verbs) rather than left as a prediction that came true unnoticed. Corrected the same paragraph's arithmetic — 16 keys now cover **38 of the 42** permissions, not "all 38". **Added `MediaValidationRules` to the traits section** as the fifth `<Noun>ValidationRules` trait, and the first that also carries **constants** (`MAX_UPLOAD_KB`, `MAX_DIMENSION`) beside its `<noun>Rules()` methods — the naming rule is unchanged, but a trait holding a shared limit as well as the rules that read it is new here. **Added `MediaPolicy` as the third follower** of "name a permission once on the class that owns the rule", and the first with all four CRUD constants, which leaves `UserPolicy`'s literals as one outlier in four. Also added the `Media\Gallery` counter-example to the `Index`-in-a-subfolder exception: it resolves to the **nested** `livewire/media/gallery.blade.php` by the normal mirror rule, because the exception keys on the class name and not on living in a subfolder — worth stating now that the exception is memorable enough to be over-applied. Three rows added to the class/file table. **Verified as unchanged rather than assumed:** the route-name, boolean-property and `attributes`-block sections (this story adds no route, and its two boolean-free component properties follow the existing never-`null` rule), and the `label()`-on-an-enum rule (story 0019 adds no enum)._

_Previously: 2026-08-26 — Task 0018 (Sales Regions & Taxes screen — UI). Three changes, all in **Translation keys**, and the first is the reason this page needed a pass at all. **The registry-mirroring rule's multi-word clause stopped being hypothetical.** It has read forward since task 0013 — *"a future registry key that is genuinely multi-word is snake_case on both sides (`items.sales_regions`), never kebab-case"* — naming the exact key by name against a registry in which every entry was a single lowercase word. Task 0018 shipped that key, as `sales_regions`, so the paragraph is rewritten from a prediction into a record, with the three identifiers that move together (config key, translation leaf, `data-test="sidebar-link-sales_regions"`) and the three kebab-case **values** in the same entry that correctly stay kebab because none of them is a registry key — `sales-regions.view` is the seeded catalog's, `sales-regions.index` and `sales-regions.*` are `routes/sales-regions.php`'s. The code block above it was also an under-count, listing two groups and three items where the shipped registry now has three and four. **Added the "`label()` on an enum is not automatic" rule**, because this story is where the question was live and answered *no*: story 0016 deferred `SalesRegionKind::label()` to "the first story that actually renders `kind`", 0018 is that story, and it renders `kind` as text in exactly one place while keeping the two labels in its own screen's lang file — the rule being *add `label()` when a second consumer appears, not when the first one does*. **Verified as accurate rather than rewritten:** the third `Index`-in-a-subfolder row and its stub warning (`resources/views/livewire/sales-regions.blade.php` is still the only file, and no `sales-regions/` directory exists), the `attributes`-block camelCase exception (0018 adds no `attributes` leaf — that group is 0017's), `SalesRegionValidationRules` and the `<noun>Rules()` rule (no trait changed), the permission-name and `<Model>Policy` sections (no permission, class or policy added), and the boolean-property rule (this story adds no PHP property at all — its state is Alpine's)._

_Previously: 2026-08-26 — Task 0017 (Sales Region tax configuration — backend). **The `attributes`-block exception under Translation keys was added mid-story** (Phase 5 code review nit, commit `618b865`) and is verified accurate here rather than duplicated: `lang/en/sales-regions.php` really does carry a camelCase `replacementDefaultId` leaf, and `App\Livewire\SalesRegions\Index::validate(..., attributes: __('sales-regions.attributes'))` really is what consumes it, so the leaf must equal the property name byte-for-byte. Added in this pass: a **third row** to the `Index`-in-a-subfolder exception table plus the one thing the first two rows could not demonstrate — the subfolder name is **kebab-cased** on the way down, so `App\Livewire\SalesRegions\Index` → `livewire/sales-regions.blade.php`, not `salesregions`; and the trap's other half, which 0017 walked into where 0010/0011 walked into the first — an `artisan make:` scaffold deposited an unused `livewire/sales-regions/index.blade.php` stub that broke nothing and simply sat there, so the check is "is there a second file at the wrong path", not only "did I write the right one" (verified: only the flat file exists today). Added `SalesRegionValidationRules` to **Traits**, with the property it demonstrates that the other four do not — **a `<noun>Rules()` method's noun is the *field*, not the model**, so a model-named trait holds `rateRules()` / `codeRules()` without repeating the model in each method. Added `SalesRegionPolicy` as the **second** follower of the "name a permission once on the class that owns the rule" convention, which makes `RolePolicy`'s shape the majority and `UserPolicy`'s literals the outlier — with the note that constant names shorten as the class narrows (`VIEW_PERMISSION`/`EDIT_PERMISSION` vs. `ROLE_MANAGEMENT_PERMISSION`), because the constant names the **rule** at whatever precision the class needs. Three rows added to the class/file table. Nothing else changed: this story adds no route name, no permission string, no enum and no boolean property or `#[Computed]` predicate that the existing rules do not already cover._

_Previously: 2026-08-24 — Task 0015a (step-up authentication for privileged Users actions): two additions, both to **Boolean properties**, plus two rows in the class/file table (`App\Actions\Auth\EnsureRecentPasswordConfirmation`, `App\Exceptions\PasswordConfirmationRequiredException` — both already conforming to the existing imperative-verb-phrase and `<Thing>Exception` rules, listed rather than newly ruled on). The section covered only `public bool $…` properties while a modern Livewire screen exposes `#[Computed]` boolean **methods** to its view; the rule is stated as binding both, with the story's four as the examples. Added the "name the predicate so it is unambiguous read *out* of its class" rule — `isRecentlyConfirmed()`, deliberately not `isConfirmed()`, because recency is the whole content of the check while the class name supplies "password". Nothing else on this page changed: this story adds no trait, route name, permission, translation-key group or Livewire component._

_Previously: 2026-08-22 — Task 0013 (module/sidebar access gating — UI): added the **registry-mirroring** rule to **Translation keys**, with [`lang/en/navigation.php`](../../lang/en/navigation.php) as its first real case — a lang file that exists to supply copy for a registry mirrors that registry's keys exactly, so one identifier is simultaneously the `config/modules.php` entry key, the translation leaf and the rendered `data-test` hook. Its ❌ is the literal-copy-in-config shape (unreachable from `lang/es/`) plus a renamed leaf. Recorded that this does not conflict with the snake_case-leaf rule directly above it — every registry key today is one lowercase word, and a future multi-word one is snake_case on **both** sides, unlike the permission names whose kebab-case is imposed by the seeded catalog and mapped at lookup. Nothing else in this file changed: this story adds no class, trait, route name, permission or Livewire component (its one new Blade file is an anonymous component, which the component ↔ view mirror rule does not govern)._

_Previously: 2026-08-21 — Task 0011 (Roles & permissions management — UI): extended **Translation keys** in two directions the shipped view forced. First, the `trans_choice()` rule now states explicitly that it binds a **Blade template** too — `roles.index.permission_count` shipped its first draft with the `|`-delimited plural written inline in `resources/views/livewire/roles.blade.php`, unreachable by `lang/es/` (Phase 5 finding F-3), and `roles.index.summary` is the third key in that group. Second, added the **composed-label / snake_case-leaf** convention with its real ✅/❌ pair: the seeded catalog's names are kebab-case and fixed, so the segment is mapped to its key at lookup (`sales-regions` → `sales_regions`) and the labels are composed from a 10-key `modules` array and a 6-key `actions` array — never one key per permission, and never by renaming the permission._

_Previously: 2026-08-20 — Task 0010 (Roles & permissions management — backend): added the `trans_choice()` / `|`-delimited plural convention to **Translation keys**, with `lang/en/roles.php`'s `delete_blocked` as the ✅ and a two-key/branch-in-PHP ❌; added `RoleValidationRules` to **Traits** with the note that it and `UserValidationRules` are named after the model whose input they describe rather than the screen that submits it; added `App\Livewire\Roles\Index` → `livewire/roles.blade.php` as the second row of the `Index`-in-a-subfolder exception table, with the "resolve the view path by running the component" habit this story's own spec got wrong; and listed `EnforceGrantorPermissionScope` and `RoleInUseException` in the class/file table._

_Previously: 2026-08-20 — Task 0009: added the "name a permission once on the class that owns the rule" convention to **Permission names**, with `RolePolicy`'s two `public const` names as the ✅ example and `UserPolicy`'s four remaining literals as the deferred ❌ (finding F5), and listed `App\Actions\Roles\EnforceAdministratorPermissionGrant` in the class/file table — an imperative verb phrase with no `Action` suffix, matching the existing invokable-action rule._

_Previously: 2026-08-19 — Task 0008a: recorded that `App\Enums\RoleName`'s backing values are deliberately the persisted role names rather than lowercase (they are compared byte-for-byte against a row), and the `is<Thing>(self $x): bool` naming for a model's shared identity predicates — including why `isSuperAdminRoleRow()` carries a suffix its sibling does not, and why that is a wart to avoid repeating rather than a pattern to copy._

_Previously: 2026-08-13 — Task 0004: documented the `<Model>Policy` / bare-verb-ability naming that Laravel's policy auto-discovery makes load-bearing, added `UserValidationRules` and the flat-composition rule to the traits section, and recorded Livewire's `Index`-in-a-subfolder exception to the component ↔ view mirror rule (`App\Livewire\Users\Index` → `livewire/users.blade.php`)._
