# Contract: DDL verificaciones (SQL Server)

**Feature**: `005-modelo-datos-verificaciones` | **Date**: 2026-07-30

DDL esperado tras aplicar Liquibase en `verificacion-infrastructure`.

## Tablas

### `dbo.certificados`

```sql
CREATE TABLE dbo.certificados (
    cod_verificacion   VARCHAR(64)  NOT NULL,
    num_recibo         CHAR(10)     NULL,
    nom_archivo        VARCHAR(30)  NULL,
    fec_cargue         DATETIME2    NOT NULL CONSTRAINT DF_certificados_fec_cargue DEFAULT GETDATE(),
    ctr_verificado     BIT          NULL CONSTRAINT DF_certificados_ctr_verificado DEFAULT 0,
    ctr_anulado        BIT          NULL CONSTRAINT DF_certificados_ctr_anulado DEFAULT 0,
    fec_anulado        DATETIME2    NULL,
    ctr_vencido        BIT          NULL CONSTRAINT DF_certificados_ctr_vencido DEFAULT 0,
    fec_vencido        DATETIME2    NULL,
    fec_vencimiento    DATETIME2    NULL,
    cnt_verificaciones INT          NULL,
    CONSTRAINT PK_certificados PRIMARY KEY (cod_verificacion)
);
```

### `dbo.certificados_verificacion`

```sql
CREATE TABLE dbo.certificados_verificacion (
    cod_verificacion  VARCHAR(64) NOT NULL,
    id_verificacion   INT         NOT NULL IDENTITY(1,1),
    fec_verificacion  DATETIME2   NULL,
    ip_verificacion   VARCHAR(45) NULL,
    CONSTRAINT PK_certificados_verificacion PRIMARY KEY (cod_verificacion, id_verificacion),
    CONSTRAINT FK_certificados_verificacion_certificados
        FOREIGN KEY (cod_verificacion) REFERENCES dbo.certificados (cod_verificacion)
);
```

## Índices

- `IX_certificados_num_recibo` on `dbo.certificados(num_recibo)`
- `IX_certificados_verificacion_cod` on `dbo.certificados_verificacion(cod_verificacion)`

## No crear

- Schema `verificaciones`
- Tablas `CodigoVerificacion` / `RegistroVerificacion`
