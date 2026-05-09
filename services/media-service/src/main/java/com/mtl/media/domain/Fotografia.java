package com.mtl.media.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "fotografia")
public class Fotografia {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "fotografia_id")
  private Long fotografiaId;

  @Column(name = "arbol_id", nullable = false)
  private Long arbolId;

  @Column(name = "bucket_almacenamiento", nullable = false, length = 128)
  private String bucketAlmacenamiento;

  @Column(name = "clave_objeto", nullable = false, length = 512)
  private String claveObjeto;

  @Column(name = "nombre_fichero_original", nullable = false, length = 255)
  private String nombreFicheroOriginal;

  @Column(name = "tipo_mime", nullable = false, length = 64)
  private String tipoMime;

  @Column(name = "tamano_bytes", nullable = false)
  private long tamanoBytes;

  @Column(name = "checksum_sha256", length = 128)
  private String checksumSha256;

  @Column(name = "ancho_px")
  private Integer anchoPx;

  @Column(name = "alto_px")
  private Integer altoPx;

  @Column(name = "orden", nullable = false)
  private int orden;

  @Column(name = "es_principal", nullable = false)
  private boolean esPrincipal;

  @Enumerated(EnumType.STRING)
  @Column(name = "categoria", nullable = false, length = 16)
  private CategoriaFotografia categoria;

  @Column(name = "subida_en", nullable = false)
  private OffsetDateTime subidaEn;

  @Column(name = "subida_por", nullable = false)
  private Long subidaPor;

  @Column(name = "eliminado_en")
  private OffsetDateTime eliminadoEn;

  @Column(name = "eliminada_por")
  private Long eliminadaPor;

  public Long getFotografiaId() {
    return fotografiaId;
  }

  public void setFotografiaId(Long fotografiaId) {
    this.fotografiaId = fotografiaId;
  }

  public Long getArbolId() {
    return arbolId;
  }

  public void setArbolId(Long arbolId) {
    this.arbolId = arbolId;
  }

  public String getBucketAlmacenamiento() {
    return bucketAlmacenamiento;
  }

  public void setBucketAlmacenamiento(String bucketAlmacenamiento) {
    this.bucketAlmacenamiento = bucketAlmacenamiento;
  }

  public String getClaveObjeto() {
    return claveObjeto;
  }

  public void setClaveObjeto(String claveObjeto) {
    this.claveObjeto = claveObjeto;
  }

  public String getNombreFicheroOriginal() {
    return nombreFicheroOriginal;
  }

  public void setNombreFicheroOriginal(String nombreFicheroOriginal) {
    this.nombreFicheroOriginal = nombreFicheroOriginal;
  }

  public String getTipoMime() {
    return tipoMime;
  }

  public void setTipoMime(String tipoMime) {
    this.tipoMime = tipoMime;
  }

  public long getTamanoBytes() {
    return tamanoBytes;
  }

  public void setTamanoBytes(long tamanoBytes) {
    this.tamanoBytes = tamanoBytes;
  }

  public String getChecksumSha256() {
    return checksumSha256;
  }

  public void setChecksumSha256(String checksumSha256) {
    this.checksumSha256 = checksumSha256;
  }

  public Integer getAnchoPx() {
    return anchoPx;
  }

  public void setAnchoPx(Integer anchoPx) {
    this.anchoPx = anchoPx;
  }

  public Integer getAltoPx() {
    return altoPx;
  }

  public void setAltoPx(Integer altoPx) {
    this.altoPx = altoPx;
  }

  public int getOrden() {
    return orden;
  }

  public void setOrden(int orden) {
    this.orden = orden;
  }

  public boolean isEsPrincipal() {
    return esPrincipal;
  }

  public void setEsPrincipal(boolean esPrincipal) {
    this.esPrincipal = esPrincipal;
  }

  public CategoriaFotografia getCategoria() {
    return categoria;
  }

  public void setCategoria(CategoriaFotografia categoria) {
    this.categoria = categoria;
  }

  public OffsetDateTime getSubidaEn() {
    return subidaEn;
  }

  public void setSubidaEn(OffsetDateTime subidaEn) {
    this.subidaEn = subidaEn;
  }

  public Long getSubidaPor() {
    return subidaPor;
  }

  public void setSubidaPor(Long subidaPor) {
    this.subidaPor = subidaPor;
  }

  public OffsetDateTime getEliminadoEn() {
    return eliminadoEn;
  }

  public void setEliminadoEn(OffsetDateTime eliminadoEn) {
    this.eliminadoEn = eliminadoEn;
  }

  public Long getEliminadaPor() {
    return eliminadaPor;
  }

  public void setEliminadaPor(Long eliminadaPor) {
    this.eliminadaPor = eliminadaPor;
  }
}
