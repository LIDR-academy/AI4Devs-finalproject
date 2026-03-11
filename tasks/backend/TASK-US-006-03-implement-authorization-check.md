# TASK-US-006-03: Implement Authorization Check

[Trello Card](https://trello.com/c/FlMW5Af5)

## Parent User Story
[US-006: File Retrieval from IPFS](../../user-stories/backend/US-006-file-retrieval-ipfs.md)

## Description
Add authorization logic to ensure users can only retrieve files they own. Check file ownership in the database before allowing retrieval, and log all unauthorized access attempts for security auditing.

## Priority
🔴 Critical

## Estimated Time
1.5 hours

## Detailed Steps

### 1. Add Authorization Helper Function
Create `backend/core/files/authorization.py`:

```python
"""File authorization helpers."""

import logging
from typing import Optional
from sqlmodel import Session, select

from core.models import File, User

logger = logging.getLogger(__name__)


def check_file_access(
    session: Session,
    file_id: int,
    user: User
) -> tuple[bool, Optional[str]]:
    """
    Check if user has access to a file.
    
    Args:
        session: Database session
        file_id: File ID to check
        user: User requesting access
        
    Returns:
        Tuple of (has_access: bool, reason: Optional[str])
    """
    statement = select(File).where(File.id == file_id)
    file_record = session.exec(statement).first()
    
    if not file_record:
        return False, "file_not_found"
    
    # Check ownership
    if file_record.user_id != user.id:
        logger.warning(
            f"Access denied: User {user.email} (ID: {user.id}) attempted to "
            f"access file {file_id} owned by user_id {file_record.user_id}"
        )
        return False, "not_owner"
    
    # Check if file is soft-deleted
    if file_record.deleted_at:
        logger.warning(
            f"Access denied: User {user.email} attempted to access "
            f"deleted file {file_id}"
        )
        return False, "file_deleted"
    
    return True, None


def check_file_access_by_cid(
    session: Session,
    cid: str,
    user: User
) -> tuple[bool, Optional[File], Optional[str]]:
    """
    Check if user has access to a file by CID.
    
    Args:
        session: Database session
        cid: Content identifier
        user: User requesting access
        
    Returns:
        Tuple of (has_access: bool, file: Optional[File], reason: Optional[str])
    """
    statement = select(File).where(File.cid == cid)
    file_record = session.exec(statement).first()
    
    if not file_record:
        logger.warning(f"File with CID {cid} not found in database")
        return False, None, "file_not_found"
    
    # Check ownership
    if file_record.user_id != user.id:
        logger.warning(
            f"Access denied: User {user.email} (ID: {user.id}) attempted to "
            f"access file CID {cid} owned by user_id {file_record.user_id}"
        )
        return False, file_record, "not_owner"
    
    # Check if file is soft-deleted
    if file_record.deleted_at:
        logger.warning(
            f"Access denied: User {user.email} attempted to access "
            f"deleted file CID {cid}"
        )
        return False, file_record, "file_deleted"
    
    return True, file_record, None


def is_admin(user: User) -> bool:
    """
    Check if user has admin privileges.
    
    Args:
        user: User to check
        
    Returns:
        True if user is admin
    """
    return user.is_admin
```

### 2. Update Retrieve Endpoint with Authorization
Modify `backend/core/files/routes/retrieve.py`:

```python
from core.files.authorization import check_file_access_by_cid

@bp.route('/retrieve/<cid>', methods=['GET'])
@require_api_key
def retrieve_file(cid: str):
    """
    Retrieve a file from IPFS by CID with authorization check.
    """
    current_user = get_current_user()
    engine = get_engine()
    
    logger.info(f"File retrieval requested for CID: {cid} by user: {current_user.email}")
    
    with Session(engine) as session:
        # Check authorization
        has_access, file_record, reason = check_file_access_by_cid(
            session, cid, current_user
        )
        
        if not has_access:
            # Log unauthorized access attempt
            audit_log = AuditLog(
                user_id=current_user.id,
                action="file_retrieval_denied",
                resource_type="file",
                resource_id=file_record.id if file_record else None,
                details=json.dumps({
                    "cid": cid,
                    "reason": reason
                }),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', 'Unknown')
            )
            session.add(audit_log)
            session.commit()
            
            # Return appropriate error
            if reason == "file_not_found":
                return jsonify({
                    "status": 404,
                    "message": "File not found"
                }), 404
            elif reason == "not_owner":
                return jsonify({
                    "status": 403,
                    "message": "Access denied to this file"
                }), 403
            elif reason == "file_deleted":
                return jsonify({
                    "status": 410,
                    "message": "File has been deleted"
                }), 410
            else:
                return jsonify({
                    "status": 403,
                    "message": "Access denied"
                }), 403
        
        # Continue with file retrieval...
        # (rest of the existing code)
```

### 3. Add Admin Override (Optional Future Enhancement)
Add ability for admins to retrieve any file:

```python
def check_file_access_by_cid(
    session: Session,
    cid: str,
    user: User,
    admin_override: bool = False
) -> tuple[bool, Optional[File], Optional[str]]:
    """Check file access with optional admin override."""
    statement = select(File).where(File.cid == cid)
    file_record = session.exec(statement).first()
    
    if not file_record:
        return False, None, "file_not_found"
    
    # Admin override
    if admin_override and is_admin(user):
        logger.info(f"Admin {user.email} accessing file {cid} via override")
        return True, file_record, None
    
    # Check ownership
    if file_record.user_id != user.id:
        return False, file_record, "not_owner"
    
    if file_record.deleted_at:
        return False, file_record, "file_deleted"
    
    return True, file_record, None
```

### 4. Add Tests for Authorization
Create `tests/backend/test_file_authorization.py`:

```python
import unittest
from datetime import datetime
from core.files.authorization import (
    check_file_access_by_cid,
    check_file_access,
    is_admin
)

class TestFileAuthorization(unittest.TestCase):
    
    def test_owner_can_access_own_file(self):
        """File owner should have access."""
        has_access, file, reason = check_file_access_by_cid(
            self.session, self.test_cid, self.owner_user
        )
        self.assertTrue(has_access)
        self.assertIsNotNone(file)
        self.assertIsNone(reason)
    
    def test_non_owner_cannot_access_file(self):
        """Non-owner should not have access."""
        has_access, file, reason = check_file_access_by_cid(
            self.session, self.test_cid, self.other_user
        )
        self.assertFalse(has_access)
        self.assertEqual(reason, "not_owner")
    
    def test_deleted_file_access_denied(self):
        """Deleted files should not be accessible."""
        # Soft delete the file
        self.test_file.deleted_at = datetime.utcnow()
        self.session.commit()
        
        has_access, file, reason = check_file_access_by_cid(
            self.session, self.test_cid, self.owner_user
        )
        self.assertFalse(has_access)
        self.assertEqual(reason, "file_deleted")
    
    def test_nonexistent_file_returns_not_found(self):
        """Non-existent CID should return not found."""
        has_access, file, reason = check_file_access_by_cid(
            self.session, "QmNonExistent", self.owner_user
        )
        self.assertFalse(has_access)
        self.assertIsNone(file)
        self.assertEqual(reason, "file_not_found")
    
    def test_admin_can_override_access(self):
        """Admin should access any file with override."""
        has_access, file, reason = check_file_access_by_cid(
            self.session, self.test_cid, self.admin_user, admin_override=True
        )
        self.assertTrue(has_access)
    
    def test_unauthorized_attempts_are_logged(self):
        """Unauthorized access attempts should be logged."""
        initial_count = self.session.query(AuditLog).count()
        
        # Attempt unauthorized access
        response = self.client.get(
            f'/api/v1/files/retrieve/{self.test_cid}',
            headers={'X-API-Key': self.other_user_api_key}
        )
        
        self.assertEqual(response.status_code, 403)
        
        # Check audit log was created
        final_count = self.session.query(AuditLog).count()
        self.assertEqual(final_count, initial_count + 1)
```

## Acceptance Criteria
- ✅ Users can only retrieve files they own
- ✅ Returns 403 Forbidden for unauthorized access attempts
- ✅ Returns 404 Not Found for non-existent files
- ✅ Returns 410 Gone for soft-deleted files
- ✅ All unauthorized access attempts are logged in AuditLog
- ✅ Authorization check happens before file retrieval from IPFS
- ✅ Authorization helper functions are reusable
- ✅ Tests verify ownership checks work correctly
- ✅ Tests verify deleted file access is denied
- ✅ Tests verify audit logging occurs

## Notes
- Authorization is file-level, not CID-level
- Soft-deleted files return 410 Gone status
- Admin override is optional future enhancement
- All access denials are logged for security auditing
- Authorization happens at database level before IPFS call
- Reduces unnecessary IPFS API calls for unauthorized requests

## Completion Status
- [x] 100% - Completed
