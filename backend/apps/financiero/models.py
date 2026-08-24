from django.db import models

from apps.empresas.models import Company


class Plan(models.Model):
   ORIGEN_ERP = "erp"
   ORIGEN_EYEMASTER = "eyemaster"
   ORIGEN_CHOICES = [
      (ORIGEN_ERP, "Sincronizado del ERP"),
      (ORIGEN_EYEMASTER, "Creado en EyeMaster"),
   ]

   # proyecto/id_externo identify a plan mirrored from the ERP; both are
   # null for a plan created locally in EyeMaster (origen=eyemaster), which
   # has no ERP counterpart.
   proyecto = models.CharField(max_length=10, null=True, blank=True)
   id_externo = models.CharField(max_length=100, null=True, blank=True)
   nombre = models.CharField(max_length=150)
   precio_base = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
   origen = models.CharField(max_length=20, choices=ORIGEN_CHOICES, default=ORIGEN_ERP)
   prorroga = models.PositiveIntegerField(default=0)  # grace days, R-PLN-03

   class Meta:
      constraints = [
         models.UniqueConstraint(fields=["proyecto", "id_externo"], name="plan_identidad_unica")
      ]

   def __str__(self):
      return self.nombre


class Complemento(models.Model):
   clave = models.CharField(max_length=50, unique=True)
   nombre = models.CharField(max_length=150)

   def __str__(self):
      return self.nombre


class PlanComplemento(models.Model):
   """A plan's catalog of add-ons and each one's consumption limit. Only
   meaningful for locally-created plans (origen=eyemaster); ERP-synced
   plans don't populate this — their limits live in the ERP."""

   plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name="complementos_plan")
   complemento = models.ForeignKey(Complemento, on_delete=models.PROTECT, related_name="planes")
   limite = models.DecimalField(max_digits=12, decimal_places=2)

   class Meta:
      constraints = [
         models.UniqueConstraint(fields=["plan", "complemento"], name="plan_complemento_unico")
      ]

   def __str__(self):
      return f"{self.plan} - {self.complemento} (limite {self.limite})"


class EmpresaPlan(models.Model):
   TIPO_CONTRATO_FREEMIUM = 1
   TIPO_CONTRATO_PAGADO = 2
   TIPO_CONTRATO_CHOICES = [
      (TIPO_CONTRATO_FREEMIUM, "Freemium"),
      (TIPO_CONTRATO_PAGADO, "Pagado"),
   ]

   ESTATUS_EXPIRADO = 0
   ESTATUS_VIGENTE = 1
   ESTATUS_BLOQUEADO = 4
   ESTATUS_CHOICES = [
      (ESTATUS_VIGENTE, "Vigente"),
      (ESTATUS_BLOQUEADO, "Bloqueado"),
      (ESTATUS_EXPIRADO, "Expirado"),
   ]

   # id_externo is null for subscriptions created directly in EyeMaster
   # (origen=eyemaster) — they have no ERP counterpart to key on.
   empresa = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="planes")
   id_externo = models.CharField(max_length=100, null=True, blank=True)
   origen = models.CharField(max_length=20, choices=Plan.ORIGEN_CHOICES, default=Plan.ORIGEN_ERP)
   plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name="suscripciones")
   tipo_contrato = models.IntegerField(choices=TIPO_CONTRATO_CHOICES)
   estatus = models.IntegerField(choices=ESTATUS_CHOICES)
   fecha_inicio = models.DateField()
   fecha_final = models.DateField()
   prorroga = models.PositiveIntegerField(default=0)
   precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)
   ultima_sync = models.DateTimeField(auto_now=True)

   class Meta:
      constraints = [
         models.UniqueConstraint(
            fields=["empresa", "id_externo"], name="empresa_plan_identidad_unica"
         )
      ]
      ordering = ["-fecha_inicio"]

   def __str__(self):
      return f"{self.empresa} - {self.plan} ({self.fecha_inicio})"


class Pago(models.Model):
   ESTATUS_ELIMINADO = 0
   ESTATUS_PAGADO = 1
   ESTATUS_PENDIENTE = 2
   ESTATUS_FACTURADO = 3
   ESTATUS_CHOICES = [
      (ESTATUS_ELIMINADO, "Eliminado"),
      (ESTATUS_PAGADO, "Pagado"),
      (ESTATUS_PENDIENTE, "Pendiente"),
      (ESTATUS_FACTURADO, "Facturado"),
   ]

   empresa = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="pagos")
   empresa_plan = models.ForeignKey(
      EmpresaPlan, on_delete=models.PROTECT, related_name="pagos", null=True
   )
   id_externo = models.CharField(max_length=100)
   estatus = models.IntegerField(choices=ESTATUS_CHOICES)
   subtotal = models.DecimalField(max_digits=12, decimal_places=2)
   importe_descuento = models.DecimalField(max_digits=12, decimal_places=2, default=0)
   impuesto = models.DecimalField(max_digits=12, decimal_places=2)
   total = models.DecimalField(max_digits=12, decimal_places=2)
   fecha = models.DateField()
   ultima_sync = models.DateTimeField(auto_now=True)

   class Meta:
      constraints = [
         models.UniqueConstraint(fields=["empresa", "id_externo"], name="pago_identidad_unica")
      ]
      indexes = [models.Index(fields=["empresa", "estatus"])]
      ordering = ["-fecha"]

   def __str__(self):
      return f"{self.empresa} - {self.total} ({self.fecha})"


class CortePlan(models.Model):
   empresa_plan = models.ForeignKey(EmpresaPlan, on_delete=models.CASCADE, related_name="cortes")
   id_externo = models.CharField(max_length=100)
   complemento = models.ForeignKey(Complemento, on_delete=models.PROTECT, related_name="cortes")
   cantidad = models.DecimalField(max_digits=12, decimal_places=2)
   excedente = models.DecimalField(max_digits=12, decimal_places=2, default=0)
   periodo_inicio = models.DateField()
   periodo_final = models.DateField()

   class Meta:
      constraints = [
         models.UniqueConstraint(
            fields=["empresa_plan", "id_externo"], name="corte_plan_identidad_unica"
         )
      ]

   def __str__(self):
      return f"{self.empresa_plan} - {self.complemento} ({self.periodo_inicio})"
