<?php

// Story 0024 -- created here; extended (never recreated) by 0024a, 0024b,
// 0026, 0027 and 0028. See docs/api's file-ownership hand-off note (R-13):
// if any of those runs uncoordinated, one silently overwrites another's
// keys, and a key missing from lang/es renders as its own raw key with no
// error.
return [
    'types' => [
        'physical' => 'Physical',
        'virtual' => 'Virtual',
    ],

    'statuses' => [
        'active' => 'Active',
        'draft' => 'Draft',
    ],

    'display_statuses' => [
        'out_of_stock' => 'Out of stock',
    ],

    'categories' => [
        'delete_blocked' => 'This category is used by :count product and cannot be deleted.'
            .'|This category is used by :count products and cannot be deleted.',

        // Story 0025 -- the product categories management screen. OQ-2 resolved: no header
        // summary key (nothing in the PRD or brief asks for one, unlike users.index.summary).
        'index' => [
            'action_not_allowed' => 'Action not allowed',
        ],
    ],

    // Story 0026 -- refusal messages for App\Concerns\ProductValidationRules'
    // salesRegionIdRules(). Both keys back the same Rule::exists()->where() match, so a
    // consumer's validate() call cannot distinguish which of the two conditions failed
    // (nonexistent vs. not assignable) from the closure alone -- either key is a reasonable
    // choice for the field-level message; 0027's save path decides which.
    'sales_regions' => [
        'not_in_catalog' => 'One of the selected sales regions is not in the catalog.',
        'not_assignable' => 'One of the selected sales regions cannot be assigned -- it may be disabled, or it may be a heading over fiscal territories rather than an assignable entry.',
        'unresolvable' => 'One of the selected sales regions could not be verified. Please review your selection and try again.',
    ],

    // Story 0027 -- the products list screen.
    'index' => [
        'title' => 'Products',
        'new_product' => 'New product',
        'empty' => 'No products found.',
        'thumbnail_alt' => 'Product thumbnail',
        'action_not_allowed' => 'Action not allowed',
        'delete_confirm_title' => 'Delete product',
        'delete_confirm_text' => 'Are you sure you want to delete ":name"? This cannot be undone.',
    ],

    // Story 0029 -- variant combination/SKU refusal messages (D-15's six-key contract).
    'variants' => [
        'duplicate_combination' => 'This combination of attribute values already exists on this product.',
        'derived_sku_taken' => 'The derived SKU :sku is already in use by another product or variant.',
        'derived_sku_empty_segment' => 'The attribute value ":value" cannot be used to derive a SKU -- please rename it.',
        'derived_sku_too_long' => 'The derived SKU would be longer than :max characters. Rename an attribute value or the product SKU to shorten it.',
        'parent_sku_change_collides' => 'Changing the product SKU would create a duplicate SKU for one of its variants. No changes were saved.',

        // Story 0029a -- the attribute type/value in-use delete guards (D-A5), both trans_choice
        // per 0024b's own D-14 precedent.
        'value_in_use' => 'This value cannot be removed: :count variant uses it.|This value cannot be removed: :count variants use it.',
        'type_in_use' => 'This type cannot be deleted: :count variant uses it.|This type cannot be deleted: :count variants use it.',

        // Story 0030a -- the non-blocking, informational per-row notice on the attribute types
        // screen's value repeater, shown before a rename is even attempted.
        'rename_notice' => 'Renaming this value will update the SKU of :count variant.|Renaming this value will update the SKU of :count variants.',

        // Story 0029b -- the cartesian combination generator. `summary` is a trans_choice over
        // the created count for 0031's own result-table UI -- this backend-only story never
        // calls it itself, but the action's whole outcome contract (D-G1) is this vocabulary.
        'generate' => [
            'empty_type' => 'The attribute type ":type" has no values, so it cannot be used to generate combinations.',
            'too_many' => 'Generating these types would create :attempted combinations, above the limit of :limit. Select fewer types or values.',
            'summary' => ':count variant created.|:count variants created.',
        ],

        // Story 0031 -- the single-variant builder nested in the product editor (D-15). Nested
        // sub-groups so nothing collides with 0029's flat leaves above.
        'builder' => [
            'heading' => 'Variants',
            'summary' => ':count variants',
            'add' => 'Add variant',
            'empty' => 'This product has no variants yet.',
            'requires_saved_product' => 'Save the product first to start adding variants.',
            'no_attribute_types' => 'No attribute types are defined yet. Define at least one before building a variant.',
            'action_not_allowed' => 'Action not allowed',
        ],

        'columns' => [
            'combination' => 'Combination',
            'sku' => 'SKU',
            'price' => 'Price',
            'stock' => 'Stock',
            'image' => 'Image',
            'actions' => 'Actions',
        ],

        'form' => [
            'create_title' => 'New variant',
            'edit_title' => 'Edit variant',
            'combination_legend' => 'Combination',
            'attribute_type_label' => 'Attribute type',
            'attribute_type_placeholder' => 'Select an attribute type',
            'attribute_value_label' => 'Value',
            'attribute_value_placeholder' => 'Select a value',
            'add_attribute_row' => 'Add attribute',
            'remove_attribute_row' => 'Remove attribute',
            'price_label' => 'Price',
            'price_prefilled_help' => "Pre-filled from the product's own price -- change it if this variant is priced differently.",
            'stock_label' => 'Stock',
            'save' => 'Save',
            'cancel' => 'Cancel',
        ],

        'sku' => [
            'preview_label' => 'Derived SKU',
            'preview_pending' => 'Choose attribute values to preview the SKU.',
            'preview_provisional' => 'Provisional -- may still change as more attribute values are chosen.',
            'derived_notice' => 'This SKU is derived from the product SKU and the chosen attribute values. It cannot be typed directly.',
            'remedy_hint' => "Change the product's SKU or rename the attribute value to resolve this.",
        ],

        'combination' => [
            'immutable_notice' => "A variant's combination cannot be changed once it exists. Remove this variant and build a new one instead.",
            'duplicate_of' => 'See :label',
        ],

        'image' => [
            'own_badge' => 'Own',
            'inherited_badge' => 'Inherited',
            'none' => 'No image',
            'choose' => 'Choose from gallery',
            'replace' => 'Change image',
            'revert_to_inherited' => "Use the product's image",
            'confirm_label' => 'Use this image',
        ],

        'delete' => [
            'title' => 'Delete variant',
            'confirm' => 'Are you sure you want to remove ":label" (:sku)?',
            'irreversible' => 'This action is permanent and cannot be undone.',
        ],
    ],

    // Story 0027 -- the routed product editor.
    'editor' => [
        'title_create' => 'New product',
        'title_edit' => 'Edit product',
        'name_label' => 'Name',
        'sku_label' => 'SKU',
        'category_label' => 'Category',
        'category_placeholder' => 'Select a category',
        'type_label' => 'Type',
        'type_placeholder' => 'Select a type',
        'status_label' => 'Status',
        'price_label' => 'Price',
        'stock_label' => 'Stock',
        'description_label' => 'Description',
        'description_sanitization_notice' => "Formatting is limited to the toolbar's options; anything else is removed when the product is saved.",
        'featured_image_label' => 'Featured image',
        'featured_image_choose' => 'Choose from gallery',
        'featured_image_clear' => 'Clear',
        'gallery_label' => 'Gallery',
        'gallery_add' => 'Add images',
        'regions_label' => 'Sales regions',
        'save' => 'Save',
        'cancel' => 'Cancel',
    ],

    // Story 0030 -- the product attribute types management screen (list, create/edit modal with
    // an inline values repeater, delete). Generic chrome (Save, Cancel, Name, Values, New
    // attribute type, Delete attribute type) stays as bare __('...') literals, matching every
    // other module screen -- only domain copy that needs to be consistent across contexts goes
    // here.
    'attribute_types' => [
        'summary' => ':total types · :values values',
        'no_types' => 'No attribute types found.',
        'no_values' => 'No values yet.',
        'action_not_allowed' => 'Action not allowed',
        // Not count-sensitive in English ("more" doesn't inflect), so a plain __() with a
        // :count placeholder is sufficient -- no trans_choice() needed.
        'value_preview_more' => '+:count more',
    ],
];
