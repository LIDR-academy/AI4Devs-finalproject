"""
Simulates the TOCTOU race the partial unique index protects against: two
callers both read "no current assignment" and both try to create one. The
service must translate the resulting IntegrityError into a domain-level
ConcurrentAssignmentError (surfaced by views as 409).
"""

from unittest.mock import patch

import pytest

from apps.comercial.models import Assignment
from apps.comercial.services import ConcurrentAssignmentError, asignar_grupo


@pytest.mark.django_db
def test_race_condition_surfaces_as_concurrent_assignment_error(
   user_factory, company_factory, group_factory
):
   actor = user_factory(email="actor@example.com", password="s3cret-pass!")
   company = company_factory()
   group_a = group_factory()
   group_b = group_factory()

   Assignment.objects.create(
      tipo=Assignment.TIPO_EMPRESA_GRUPO,
      origen_id=company.pk,
      destino_id=group_a.pk,
      usuario=actor,
      accion=Assignment.ACCION_ASIGNAR,
   )

   with patch("apps.comercial.services.current_assignment", return_value=None):
      with pytest.raises(ConcurrentAssignmentError):
         asignar_grupo(company.pk, group_b.pk, actor)
