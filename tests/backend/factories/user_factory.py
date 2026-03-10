"""Factory Boy helpers for user-oriented test payloads."""

from __future__ import annotations

import factory


class UserFactory(factory.Factory):
    """Generate registration payloads for auth/user test flows."""

    class Meta:
        model = dict

    email = factory.Sequence(lambda n: f"test.user.{n}@example.com")
    password = factory.LazyFunction(lambda: "StrongPassword123!")

    @classmethod
    def registration_payload(cls, **overrides):
        """Return a dict payload accepted by POST /api/v1/users/register."""
        return cls.build(**overrides)
