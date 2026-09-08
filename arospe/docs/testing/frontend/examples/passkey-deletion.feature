# Specification artifact — NOT run by any BDD engine in this repo.
# Translated by hand into examples/passkey-deletion-browser-test.php.
# Grounded in real flow: app/Livewire/Settings/Security.php::deletePasskey(),
# resources/views/livewire/settings/security.blade.php (Passkeys section + Remove modal),
# route security.edit.

Feature: Remove a passkey
  As a signed-in user who manages passkeys for passwordless sign-in
  I want to remove a passkey I no longer use
  So that it can no longer be used to access my account

  # ❌ Imperative / technical — do NOT write it this way (contrast only):
  #
  # Scenario: Delete passkey
  #   Given a passkey row with id 5 owned by user 1
  #   When I click the trash button with wire:click="confirmDelete(5)"
  #   And I click the button with wire:click="deletePasskey"
  #   Then the "passkeys" table has no row where id = 5

  # ✅ Declarative / business language:

  Scenario: A user removes one of their registered passkeys
    Given a signed-in user who has a registered passkey
    When the user removes that passkey
    Then the passkey is no longer listed among their passkeys
    And the user is told they have no passkeys left
