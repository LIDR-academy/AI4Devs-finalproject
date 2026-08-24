"""
DTOs returned by the ERP Gateway. Decoupled from Django models: mapping to
cache/persistence models is the responsibility of the consuming module
(financial cache, company retrieval), not of the gateway.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class CompanyDTO:
   proyecto: str  # "ADMIN" | "PEOPLE"
   id_externo: str
   app: str  # "SUITE_A" | "SUITE_B"
   razon_social: str
   nombre_comercial: str
   estado: str  # "activa" | "inactiva" | "baja_erp"

   @property
   def identity(self) -> tuple[str, str]:
      return (self.proyecto, self.id_externo)


@dataclass(frozen=True)
class PlanSubscriptionDTO:
   proyecto: str
   id_externo: str
   empresa_id_externo: str
   plan_nombre: str
   tipo_contrato: int  # 1 freemium | 2 paid
   estatus: int  # 1 current | 4 blocked | 0 expired
   fecha_inicio: str
   fecha_final: str
   prorroga: int
   precio_unitario: str


@dataclass(frozen=True)
class PaymentDTO:
   proyecto: str
   id_externo: str
   empresa_id_externo: str
   empresa_plan_id_externo: str
   estatus: int  # 0 deleted | 1 paid | 2 outstanding | 3 invoiced
   subtotal: str
   importe_descuento: str
   impuesto: str
   total: str
   fecha: str


@dataclass(frozen=True)
class BillingCycleDTO:
   proyecto: str
   id_externo: str
   empresa_plan_id_externo: str
   complemento_clave: str
   cantidad: str
   excedente: str
   periodo_inicio: str
   periodo_final: str


@dataclass(frozen=True)
class ClientDTO:
   id_externo: str
   rfc: str
   razon_social: str
