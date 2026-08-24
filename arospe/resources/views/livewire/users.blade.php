<div class="w-full">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <flux:heading size="xl">{{ __('Users') }}</flux:heading>
            <flux:subheading>
                {{ __('users.index.summary', ['total' => $this->usersSummary['total'], 'active' => $this->usersSummary['active']]) }}
            </flux:subheading>
        </div>

        <flux:button variant="primary" icon="plus" wire:click="openCreateModal">
            {{ __('New user') }}
        </flux:button>
    </div>

    <div class="mt-6">
        @if (count($users) > 0)
            <flux:table>
                <flux:table.columns>
                    <flux:table.column>{{ __('Name') }}</flux:table.column>
                    <flux:table.column>{{ __('Role') }}</flux:table.column>
                    <flux:table.column>{{ __('Status') }}</flux:table.column>
                    <flux:table.column>{{ __('Actions') }}</flux:table.column>
                </flux:table.columns>

                <flux:table.rows>
                    @foreach ($users as $user)
                        <flux:table.row :key="$user['id']">
                            <flux:table.cell>
                                <div class="flex items-center gap-3">
                                    <flux:avatar :name="$user['name']" size="sm" />

                                    <div class="min-w-0">
                                        <div class="font-medium text-zinc-800 dark:text-white">{{ $user['name'] }}</div>
                                        <div class="text-zinc-500 dark:text-zinc-400 text-sm truncate">{{ $user['email'] }}</div>

                                        @if ($user['pendingEmail'])
                                            <div class="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                                                {{ __('users.email_change.pending_notice_admin', ['email' => $user['pendingEmail']]) }}
                                            </div>
                                        @endif
                                    </div>
                                </div>
                            </flux:table.cell>

                            <flux:table.cell>
                                {{ $user['role'] ?? '—' }}
                            </flux:table.cell>

                            <flux:table.cell>
                                @if ($user['status'] instanceof \App\Enums\UserStatus)
                                    <flux:badge
                                        :color="match ($user['status']) {
                                            \App\Enums\UserStatus::Active => 'lime',
                                            \App\Enums\UserStatus::Inactive => 'zinc',
                                            \App\Enums\UserStatus::Suspended => 'red',
                                        }"
                                    >
                                        {{ $user['status']->label() }}
                                    </flux:badge>
                                @else
                                    <flux:badge color="zinc">{{ __('Unknown') }}</flux:badge>
                                @endif
                            </flux:table.cell>

                            <flux:table.cell>
                                <div class="flex items-center gap-2">
                                    {{-- flux:button's own `tooltip` prop can't be bound conditionally (e.g.
                                    :tooltip="... ? null : '...'"): Livewire/Blaze's compiled attribute
                                    handling treats the prop as present whenever `tooltip=`/`:tooltip=` is
                                    written on the tag at all, regardless of the bound value, which rendered
                                    an empty tooltip bubble on every enabled row action. Wrapping with
                                    flux:tooltip ourselves, only in the disabled branch, keeps the attribute
                                    off the tag entirely when it doesn't apply. --}}
                                    @if ($user['canEdit'])
                                        <flux:button
                                            variant="ghost"
                                            size="sm"
                                            icon="pencil-square"
                                            aria-label="{{ __('Edit :name', ['name' => $user['name']]) }}"
                                            data-test="edit-user-{{ $user['id'] }}"
                                            wire:click="openEditModal(@js($user['id']))"
                                            class="cursor-pointer!"
                                        />
                                    @else
                                        {{-- The cursor class has to live on <flux:tooltip> (-> <ui-tooltip>), not
                                        the disabled <button> inside it: Flux's own disabled:pointer-events-none
                                        class takes the button out of hit-testing, so the browser resolves the
                                        hovered element (and its cursor) to the nearest ancestor that still
                                        receives pointer events -- confirmed via document.elementFromPoint() at
                                        the button's screen position, which returns <ui-tooltip>, not the button
                                        itself. A cursor rule placed on the button alone is therefore never
                                        actually shown to the user. --}}
                                        <flux:tooltip :content="__('users.index.action_not_allowed')" class="cursor-not-allowed!">
                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="pencil-square"
                                                aria-label="{{ __('Edit :name', ['name' => $user['name']]) }}"
                                                data-test="edit-user-{{ $user['id'] }}"
                                                disabled
                                            />
                                        </flux:tooltip>
                                    @endif

                                    @if ($user['canDelete'])
                                        <flux:button
                                            variant="ghost"
                                            size="sm"
                                            icon="trash"
                                            aria-label="{{ __('Delete :name', ['name' => $user['name']]) }}"
                                            data-test="delete-user-{{ $user['id'] }}"
                                            wire:click="confirmDelete(@js($user['id']))"
                                            class="cursor-pointer! text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                        />
                                    @else
                                        <flux:tooltip :content="__('users.index.action_not_allowed')" class="cursor-not-allowed!">
                                            <flux:button
                                                variant="ghost"
                                                size="sm"
                                                icon="trash"
                                                aria-label="{{ __('Delete :name', ['name' => $user['name']]) }}"
                                                data-test="delete-user-{{ $user['id'] }}"
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
                <flux:text>{{ __('No users found.') }}</flux:text>
            </div>
        @endif
    </div>

    {{-- Create / edit modal --}}
    <flux:modal name="user-modal" class="max-w-md md:min-w-md" @close="closeModal" wire:model="showModal">
        {{-- The inner content only renders while the modal is open (rather than being
        present-but-hidden at all times), so its "Cancel" text never collides with the
        delete-confirmation modal's own "Cancel" button for text-based lookups. --}}
        @if ($showModal)
            <div class="space-y-6">
                <flux:heading size="lg">
                    {{ $editingUserId === null ? __('Create user') : __('Edit user') }}
                </flux:heading>

                <div class="space-y-4">
                    <flux:input wire:model="name" :label="__('Name')" required autofocus />

                    <div>
                        <flux:input wire:model="email" :label="__('Email')" type="email" required />

                        @if ($editingPendingEmail)
                            <flux:text class="mt-2">
                                {{ __('users.email_change.pending_notice_admin', ['email' => $editingPendingEmail]) }}
                            </flux:text>
                        @endif
                    </div>

                    {{-- Story 0015a: the edit form warns that changing role, status or email
                    requires re-confirming the password (widened by Phase 4 finding F2 to
                    include email). Never shown on a self-edit -- a self-service email change
                    is exempt by construction (App\Actions\Users\UpdateUser only runs the
                    step-up guard when ! $isSelfEdit), and role/status changes are always
                    silently no-op'd on the actor's own row -- so the notice would be
                    misleading there. Gated on isEditingOwnRow (Phase 4 re-audit finding N6 --
                    previously the raw `$editingUserId !== auth()->id()` comparison, now the
                    same identity idiom openEditModal()/UpdateUser's $isSelfEdit use) and on
                    the same requiresPasswordConfirmation() predicate the guard itself reads
                    (EnsureRecentPasswordConfirmation::isRecentlyConfirmed()), so the hint and
                    the guard cannot drift. Placed above the role/status selects so it is read
                    before the fields it applies to. --}}
                    @if ($editingUserId !== null && ! $this->isEditingOwnRow && $this->requiresPasswordConfirmation)
                        <flux:callout
                            variant="warning"
                            icon="exclamation-triangle"
                            :heading="__('users.index.step_up_notice_edit')"
                            data-test="edit-modal-reconfirm-notice"
                        />
                    @endif

                    {{-- Story 0015a, Phase 4 finding F1: the create form warns only when the
                    selected role is Administrator-tier -- an ordinary-role creation is never
                    step-up-gated. Gated on the same two predicates
                    CreateUser's own guard fires on (isAdministratorRoleSelected mirrors
                    Role::isAdministratorRole(), requiresPasswordConfirmation mirrors the
                    freshness check), so the hint and the guard cannot drift. --}}
                    @if ($editingUserId === null && $this->isAdministratorRoleSelected && $this->requiresPasswordConfirmation)
                        <flux:callout
                            variant="warning"
                            icon="exclamation-triangle"
                            :heading="__('users.index.step_up_notice_create')"
                            data-test="create-modal-reconfirm-notice"
                        />
                    @endif

                    <flux:select wire:model="roleId" :label="__('Role')" :placeholder="__('Select a role')">
                        @foreach ($this->roleOptions as $option)
                            <flux:select.option value="{{ $option['id'] }}">{{ $option['name'] }}</flux:select.option>
                        @endforeach
                    </flux:select>

                    <flux:select wire:model="status" :label="__('Status')">
                        @foreach (\App\Enums\UserStatus::cases() as $statusOption)
                            <flux:select.option value="{{ $statusOption->value }}">{{ $statusOption->label() }}</flux:select.option>
                        @endforeach
                    </flux:select>
                </div>

                <div class="flex gap-3 justify-end">
                    <flux:button variant="outline" wire:click="closeModal">
                        {{ __('Cancel') }}
                    </flux:button>

                    <flux:button
                        variant="primary"
                        wire:click="save"
                        wire:loading.attr="disabled"
                        wire:target="save"
                    >
                        {{ __('Save') }}
                    </flux:button>
                </div>
            </div>
        @endif
    </flux:modal>

    {{-- Delete confirmation modal --}}
    <flux:modal name="delete-user-modal" class="max-w-md md:min-w-md" @close="closeDeleteModal" wire:model="showDeleteModal">
        {{-- Likewise gated on $showDeleteModal, mirroring the create/edit modal above: its
        "Cancel" button must not sit in the DOM (even hidden) at the same time as the create/edit
        modal's own "Cancel" button, for text-based lookups. The confirm button's "Delete :name"
        text is unambiguous on its own — the row action is icon-only (see F1) and no longer
        shares that label. --}}
        @if ($showDeleteModal)
            <div class="space-y-6">
                <div class="space-y-2">
                    <flux:heading size="lg">{{ __('Delete user') }}</flux:heading>
                    <flux:text>
                        {{ __('Are you sure you want to delete ":name"? This cannot be undone.', ['name' => $deletingUserName]) }}
                    </flux:text>
                </div>

                {{-- Story 0015a: same predicate as the edit modal's notice above, so the hint
                and the guard cannot drift. Also gated on ! isDeletingOwnRow (Phase 4 re-audit
                finding N6): deleteUser() silently no-ops on the actor's own row (story 0015's
                F11) rather than throwing the step-up exception, so this notice would otherwise
                promise a re-confirmation prompt that never arrives. Placed above the
                destructive button so it is read before the actor commits to it. --}}
                @if (! $this->isDeletingOwnRow && $this->requiresPasswordConfirmation)
                    <flux:callout
                        variant="warning"
                        icon="exclamation-triangle"
                        :heading="__('users.index.step_up_notice_delete')"
                        data-test="delete-modal-reconfirm-notice"
                    />
                @endif

                <div class="flex gap-3 justify-end">
                    <flux:button variant="outline" wire:click="closeDeleteModal">
                        {{ __('Cancel') }}
                    </flux:button>

                    <flux:button
                        variant="danger"
                        wire:click="deleteUser"
                        wire:loading.attr="disabled"
                        wire:target="deleteUser"
                    >
                        {{ __('Delete :name', ['name' => $deletingUserName]) }}
                    </flux:button>
                </div>
            </div>
        @endif
    </flux:modal>
</div>
