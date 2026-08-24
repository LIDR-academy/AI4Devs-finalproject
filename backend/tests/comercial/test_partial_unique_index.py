"""
Proves the R-EST-07 guarantee lives in the database, not just in
application code: attempting to insert a second *current* Assignment row
for the same (origen_id, tipo) — bypassing AsignacionService entirely —
must fail at the database engine level via the partial unique index.
"""

import pytest
from django.db import IntegrityError
from django.db import transaction as db_transaction

from apps.comercial.models import Assignment


@pytest.mark.django_db
def test_second_current_assignment_violates_db_constraint(user_factory, company_factory):
   actor = user_factory(email="actor@example.com", password="s3cret-pass!")
   company = company_factory()

   Assignment.objects.create(
      tipo=Assignment.TIPO_EMPRESA_GRUPO,
      origen_id=company.pk,
      destino_id=1,
      usuario=actor,
      accion=Assignment.ACCION_ASIGNAR,
   )

   with pytest.raises(IntegrityError):
      with db_transaction.atomic():
         Assignment.objects.create(
            tipo=Assignment.TIPO_EMPRESA_GRUPO,
            origen_id=company.pk,
            destino_id=2,
            usuario=actor,
            accion=Assignment.ACCION_ASIGNAR,
         )


@pytest.mark.django_db
def test_two_different_types_for_same_origen_id_both_allowed(user_factory, company_factory):
   """Sanity check: the partial index is scoped by (origen_id, tipo), not
   origen_id alone — a company can have a current client AND a current
   group simultaneously."""
   actor = user_factory(email="actor@example.com", password="s3cret-pass!")
   company = company_factory()

   Assignment.objects.create(
      tipo=Assignment.TIPO_EMPRESA_CLIENTE,
      origen_id=company.pk,
      destino_id=1,
      usuario=actor,
      accion=Assignment.ACCION_ASIGNAR,
   )
   Assignment.objects.create(
      tipo=Assignment.TIPO_EMPRESA_GRUPO,
      origen_id=company.pk,
      destino_id=1,
      usuario=actor,
      accion=Assignment.ACCION_ASIGNAR,
   )

   assert Assignment.objects.filter(origen_id=company.pk, fecha_fin__isnull=True).count() == 2


@pytest.mark.django_db
def test_closed_assignment_does_not_block_a_new_current_one(user_factory, company_factory):
   actor = user_factory(email="actor@example.com", password="s3cret-pass!")
   company = company_factory()

   from django.utils import timezone

   closed = Assignment.objects.create(
      tipo=Assignment.TIPO_EMPRESA_GRUPO,
      origen_id=company.pk,
      destino_id=1,
      usuario=actor,
      accion=Assignment.ACCION_ASIGNAR,
   )
   closed.fecha_fin = timezone.now()
   closed.save(update_fields=["fecha_fin"])

   # allowed: the previous row is closed, so a new current one doesn't
   # violate the partial index
   Assignment.objects.create(
      tipo=Assignment.TIPO_EMPRESA_GRUPO,
      origen_id=company.pk,
      destino_id=2,
      usuario=actor,
      accion=Assignment.ACCION_REASIGNAR,
   )

   assert (
      Assignment.objects.filter(
         origen_id=company.pk, tipo=Assignment.TIPO_EMPRESA_GRUPO, fecha_fin__isnull=True
      ).count()
      == 1
   )
