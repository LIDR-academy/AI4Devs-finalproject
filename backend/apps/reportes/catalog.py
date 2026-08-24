"""
Predefined report catalog (documentacion-funcional.md §6.7 table). Each
entry is a fixed payload for the same flexible engine — running a catalog
entry and calling /consulta with its payload are the same code path.
"""

CATALOG = [
   {
      "key": "cliente_empresas_adeudo",
      "label": "Cliente -> empresas y adeudo",
      "medida": "adeudo",
      "dimensiones": ["cliente", "empresa"],
      "filtros": {},
   },
   {
      "key": "grupo_empresas_adeudo",
      "label": "Grupo -> empresas y adeudo",
      "medida": "adeudo",
      "dimensiones": ["grupo", "empresa"],
      "filtros": {},
   },
   {
      "key": "distribuidor_empresas_adeudo",
      "label": "Distribuidor -> empresas y adeudo",
      "medida": "adeudo",
      "dimensiones": ["distribuidor", "empresa"],
      "filtros": {},
   },
   {
      "key": "empresas_con_adeudo",
      "label": "Que empresas me deben?",
      "medida": "adeudo",
      "dimensiones": ["empresa"],
      "filtros": {"adeudo_min": "0.01"},
   },
]
