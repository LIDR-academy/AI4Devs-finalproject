<?php
/**
 * View for App\Livewire\Roles\Index (story 0011). Flat path, not
 * roles/index.blade.php -- Livewire's Finder strips a trailing ".index"
 * segment for an Index component in a subfolder, the same exception
 * App\Livewire\Users\Index already relies on; see
 * docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name.
 *
 * This story owns markup and UI state only. Every query, mutation,
 * validation rule and authorization decision belongs to sibling story 0010's
 * component class -- the one deliberate exception is the per-row
 * canEdit/canDelete UI hint story 0011 added to roles(), a narrow,
 * precedented follow-up documented on that method itself.
 *
 * The permission catalog ($this->permissionOptions) is a flat, name-ordered
 * collection of Permission rows ("<module>.<action>"). Grouping by module is
 * a pure presentational transform over that already-fetched collection --
 * open item 2's resolution -- so it adds no query and stays inside this
 * story's split.
 */
?>
<div class="w-full">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <flux:heading size="xl">{{ __('Roles & permissions') }}</flux:heading>
            <flux:subheading>
                {{ trans_choice('roles.index.summary', $this->roles->count(), ['count' => $this->roles->count()]) }}
            </flux:subheading>
        </div>

        <flux:button variant="primary" icon="plus" wire:click="openCreateModal">
            {{ __('New role') }}
        </flux:button>
    </div>

    <div class="mt-6">
        @if ($this->roles->count() > 0)
            <flux:table>
                <flux:table.columns>
                    <flux:table.column>{{ __('Name') }}</flux:table.column>
                    <flux:table.column>{{ __('Permissions') }}</flux:table.column>
                    <flux:table.column>{{ __('Holders') }}</flux:table.column>
                    <flux:table.column>{{ __('Actions') }}</flux:table.column>
                </flux:table.columns>

                <flux:table.rows>
                    @foreach ($this->roles as $role)
                        <flux:table.row :key="$role->id">
                            <flux:table.cell>
                                <div class="font-medium text-zinc-800 dark:text-white">{{ $role->name }}</div>
                            </flux:table.cell>

                            <flux:table.cell>
                                {{ trans_choice(':count permission|:count permissions', $role->permissions->count(), ['count' => $role->permissions->count()]) }}
                            </flux:table.cell>

                            <flux:table.cell>
                                {{ $role->users_count }}
                            </flux:table.cell>

                            <flux:table.cell>
                                <div class="flex items-center gap-2">
                                    {{-- flux:button's own `tooltip` prop can't be bound conditionally: see
                                    resources/views/livewire/users.blade.php's identical comment and
                                    docs/errors-log.md (2026-08-16). Two separate branches instead. --}}
                                    @if ($role->canEdit)
                                        <flux:button
                                            variant="ghost"
                                            size="sm"
                                            icon="pencil-square"
                                            aria-label="{{ __('Edit :name', ['name' => $role->name]) }}"
                                            data-test="edit-role-{{ $role->id }}"
                                            wire:click="openEditModal(@js($role->id))"
                                            class="cursor-pointer!"
                                        />
                                    @else
                                        <flux:tooltip :content="__('roles.index.action_not_allowed')" class="cursor-not-allowed!">
                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="pencil-square"
                                                aria-label="{{ __('Edit :name', ['name' => $role->name]) }}"
                                                data-test="edit-role-{{ $role->id }}"
                                                disabled
                                            />
                                        </flux:tooltip>
                                    @endif

                                    @if ($role->canDelete)
                                        <flux:button
                                            variant="ghost"
                                            size="sm"
                                            icon="trash"
                                            aria-label="{{ __('Delete :name', ['name' => $role->name]) }}"
                                            data-test="delete-role-{{ $role->id }}"
                                            wire:click="confirmDeleteRole(@js($role->id))"
                                            class="cursor-pointer! text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                        />
                                    @else
                                        <flux:tooltip :content="__('roles.index.action_not_allowed')" class="cursor-not-allowed!">
                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="trash"
                                                aria-label="{{ __('Delete :name', ['name' => $role->name]) }}"
                                                data-test="delete-role-{{ $role->id }}"
                                                disabled
                                                class="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                            />
                                        </flux:tooltip>
                                    @endif
                                </div>
                            </flux:table.cell>
                        </flux:table.row>
                    @endforeach
                </flux:table.rows>
            </flux:table>
        @else
            <div class="p-8 text-center border rounded-lg border-zinc-200 dark:border-zinc-700">
                <flux:text>{{ __('roles.index.empty') }}</flux:text>
            </div>
        @endif
    </div>

    {{-- Create / edit modal --}}
    <flux:modal name="role-modal" class="max-w-2xl md:min-w-2xl" @close="closeModal" wire:model="showModal">
        {{-- Gated on $showModal so its "Cancel" text never collides with the delete modal's
        own, matching resources/views/livewire/users.blade.php's identical pattern. --}}
        @if ($showModal)
            <div class="space-y-6">
                <flux:heading size="lg">
                    {{ $editingRoleId === null ? __('Create role') : __('Edit role') }}
                </flux:heading>

                <div class="space-y-4">
                    <flux:input wire:model="name" :label="__('Name')" required autofocus />

                    @php
                        // Pure presentational transform over the already-fetched, unfiltered
                        // catalog -- open item 2's resolution. The module is the segment
                        // before the first dot in a "<module>.<action>" permission name; the
                        // two non-CRUD permissions (roles.manage,
                        // roles.manage-administrators) fall into a derived "roles"
                        // pseudo-module for free, with no hardcoded module list anywhere here.
                        $permissionGroups = $this->permissionOptions->groupBy(
                            fn ($permission) => explode('.', $permission->name, 2)[0]
                        );

                        // docs/conventions/naming.md requires snake_case translation-key
                        // leaves; a handful of catalog module/action segments are kebab-case
                        // (sales-regions, payment-methods, store-languages,
                        // manage-administrators), so the key is derived by mapping the
                        // hyphen -- the permission name itself is never touched.
                        $permissionLabel = function (string $module, string $action): string {
                            $moduleKey = str_replace('-', '_', $module);
                            $actionKey = str_replace('-', '_', $action);

                            return __('roles.modules.'.$moduleKey).' — '.__('roles.actions.'.$actionKey);
                        };
                    @endphp

                    {{-- The permission catalog is rendered in FULL, unconditionally, and is
                    never filtered to what the acting user may themselves grant -- see
                    docs/security/authorization-patterns.md#two-guards-on-one-payload-must-agree-on-what-an-omission-means.
                    The one exception is the administrator-level toggle just below, which is
                    absent from the DOM entirely (not disabled) for anyone who is not the
                    Super Admin. --}}
                    <flux:checkbox.group wire:model="selectedPermissionIds" :label="__('Permissions')">
                        @foreach ($permissionGroups as $module => $permissions)
                            <div class="mb-4 last:mb-0">
                                <flux:heading size="sm">{{ __('roles.modules.'.str_replace('-', '_', $module)) }}</flux:heading>
                                <flux:separator class="my-2" />

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    @foreach ($permissions as $permission)
                                        @php
                                            $action = explode('.', $permission->name, 2)[1] ?? '';
                                        @endphp

                                        @if ($permission->name === \App\Policies\RolePolicy::ADMINISTRATOR_LEVEL_PERMISSION)
                                            @if ($this->canGrantAdministratorLevel)
                                                <flux:checkbox
                                                    value="{{ $permission->id }}"
                                                    :label="$permissionLabel($module, $action)"
                                                />
                                            @endif
                                        @else
                                            <flux:checkbox
                                                value="{{ $permission->id }}"
                                                :label="$permissionLabel($module, $action)"
                                            />
                                        @endif
                                    @endforeach
                                </div>
                            </div>
                        @endforeach
                    </flux:checkbox.group>
                </div>

                <div class="flex gap-3 justify-end">
                    <flux:button variant="outline" wire:click="closeModal">
                        {{ __('Cancel') }}
                    </flux:button>

                    <flux:button
                        variant="primary"
                        wire:click="saveRole"
                        wire:loading.attr="disabled"
                        wire:target="saveRole"
                    >
                        {{ __('Save') }}
                    </flux:button>
                </div>
            </div>
        @endif
    </flux:modal>

    {{-- Delete confirmation modal --}}
    <flux:modal name="delete-role-modal" class="max-w-md md:min-w-md" @close="closeDeleteModal" wire:model="showDeleteModal">
        @if ($showDeleteModal)
            @php
                $deletingRole = $deletingRoleId ? $this->roles->firstWhere('id', $deletingRoleId) : null;
                $deletingRoleHolderCount = $deletingRole->users_count ?? 0;
            @endphp

            <div class="space-y-6">
                <div class="space-y-2">
                    <flux:heading size="lg">{{ __('Delete role') }}</flux:heading>

                    @if ($deletingRoleHolderCount > 0)
                        {{-- The PRD's "no confirm-and-proceed path" expressed in markup: the
                        destructive button below is not rendered at all in this branch. --}}
                        <flux:text>
                            {{ trans_choice('roles.index.delete_blocked', $deletingRoleHolderCount, ['count' => $deletingRoleHolderCount]) }}
                        </flux:text>
                    @else
                        <flux:text>
                            {{ __('Are you sure you want to delete ":name"? This cannot be undone.', ['name' => $deletingRoleName]) }}
                        </flux:text>
                    @endif

                    {{-- Inline outlet for deleteRole()'s own re-check (deletingRoleId): the
                    pre-emptive branch above already reflects the same holder count in the
                    normal case, but a role deleted/re-assigned between page load and click
                    would refuse here with no branch above to render it. --}}
                    <flux:error name="deletingRoleId" />
                </div>

                <div class="flex gap-3 justify-end">
                    <flux:button variant="outline" wire:click="closeDeleteModal">
                        {{ __('Cancel') }}
                    </flux:button>

                    @if ($deletingRoleHolderCount === 0)
                        <flux:button
                            variant="danger"
                            wire:click="deleteRole"
                            wire:loading.attr="disabled"
                            wire:target="deleteRole"
                        >
                            {{ __('Delete :name', ['name' => $deletingRoleName]) }}
                        </flux:button>
                    @endif
                </div>
            </div>
        @endif
    </flux:modal>
</div>
