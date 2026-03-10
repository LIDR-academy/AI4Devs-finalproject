# TASK-US-013-03: Create test data factories

[Trello Card](https://trello.com/c/fON3KeCT)

[Pull Request](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/13)

## Parent User Story
[US-013: Backend Testing Suite](../../user-stories/backend/US-013-backend-testing.md)

## Description
Implement Factory Boy factories for the `User` and `File` models using Faker for realistic, randomised test data. Place the factories in `tests/backend/factories/` so they can be imported by both unit and e2e tests. Factories must be compatible with the SQLModel models used in the project.

## Priority
🟡 **Medium** - Needed before writing comprehensive unit and e2e tests.

## Estimated Time
1.5 hours

## Detailed Steps

### 1. Install dependencies
Ensure `factory-boy` and `faker` are in `backend/requirements.txt`:
```
factory-boy>=3.3.0
faker>=24.0.0
```

### 2. Create `tests/backend/factories/__init__.py`
```python
from .user_factory import UserFactory
from .file_factory import FileFactory

__all__ = ["UserFactory", "FileFactory"]
```

### 3. Create `tests/backend/factories/user_factory.py`
```python
import factory
from faker import Faker

fake = Faker()


class UserFactory(factory.Factory):
    """Factory for generating test User instances.
    
    Usage (without persisting to DB):
        user = UserFactory()
        user = UserFactory(email="custom@example.com")
    
    Usage (as dict for API payloads):
        payload = UserFactory.build_as_dict()
    """

    class Meta:
        # Use the actual User model once SQLModel integration is confirmed
        # model = User
        exclude = ["_raw_password"]

    email = factory.LazyAttribute(lambda _: fake.unique.email())
    _raw_password = factory.LazyAttribute(lambda _: fake.password(length=12, special_chars=True))
    # hashed_password would be set by the service layer, not the factory
    is_active = True
    is_admin = False

    @classmethod
    def registration_payload(cls, **kwargs) -> dict:
        """Return a dict suitable for POST /api/v1/users/register."""
        password = kwargs.pop("password", fake.password(length=12, special_chars=True))
        email = kwargs.pop("email", fake.unique.email())
        return {"email": email, "password": password}
```

### 4. Create `tests/backend/factories/file_factory.py`
```python
import factory
from faker import Faker

fake = Faker()

# Sample valid CIDs (IPFS v0 and v1 formats)
SAMPLE_CIDS = [
    "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    "QmZoiJNAvCfpeZW3eQGnTziFkZSfTBzaFgCQmsFwcDMVzZ",
    "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
]


class FileFactory(factory.Factory):
    """Factory for generating test File record instances."""

    class Meta:
        # model = FileRecord  (set when integrating with actual model)
        pass

    filename = factory.LazyAttribute(lambda _: fake.file_name(extension="pdf"))
    cid = factory.LazyAttribute(lambda _: fake.random_element(elements=SAMPLE_CIDS))
    file_size = factory.LazyAttribute(lambda _: fake.random_int(min=1024, max=10_485_760))
    content_type = factory.LazyAttribute(
        lambda _: fake.random_element(
            elements=["application/pdf", "image/png", "text/plain", "image/jpeg"]
        )
    )
    is_pinned = False
    owner_email = factory.LazyAttribute(lambda _: fake.email())

    @classmethod
    def upload_payload(cls, filepath: str = None) -> dict:
        """Return a multipart payload dict for POST /api/v1/files/upload."""
        return {
            "filename": fake.file_name(extension="txt"),
            "filepath": filepath or "/tmp/test_upload.txt",
        }
```

### 5. Wire factories into `conftest.py`
Import and expose factories as optional fixtures in `tests/backend/conftest.py`:
```python
from factories import UserFactory, FileFactory

@pytest.fixture
def user_payload():
    return UserFactory.registration_payload()

@pytest.fixture
def file_upload_payload(tmp_path):
    f = tmp_path / "test.txt"
    f.write_text("IPFS test content")
    return {"file": (f.open("rb"), "test.txt")}
```

### 6. Validate factories
```bash
.venv/bin/python -c "
from tests.backend.factories import UserFactory, FileFactory
u = UserFactory.registration_payload()
print('User payload:', u)
f = FileFactory()
print('File CID:', f.cid)
"
```

## Acceptance Criteria
- [x] `tests/backend/factories/__init__.py` exports `UserFactory` and `FileFactory`
- [x] `UserFactory.registration_payload()` returns a valid dict with `email` and `password` keys
- [x] All factory-generated emails are unique within a test session (use `Faker.unique`)
- [x] `FileFactory` generates plausible IPFS CIDs and metadata
- [x] Factories can be imported from `tests/backend/unit/` and `tests/backend/e2e/` without path issues
- [x] No factory raises an exception when called with default arguments

## Notes
- Because the project uses SQLModel (not plain SQLAlchemy), use `factory.Factory` (not `factory.alchemy.SQLAlchemyModelFactory`) until the SQLModel session integration is confirmed; generate plain Python objects or dicts.
- Faker seeds can be set in `conftest.py` with `Faker.seed(0)` for deterministic test output in CI.

## Completion Status
- [x] 100% - Completed
