## ADDED Requirements

### Requirement: User Entity Auth Fields
The User entity SHALL include properties for storing authentication state.

#### Scenario: Auth fields exist on User
- **WHEN** the User entity is inspected
- **THEN** it contains fields for HashedMagicLinkToken, TokenExpiresAt, LastLoginAt, and Status
