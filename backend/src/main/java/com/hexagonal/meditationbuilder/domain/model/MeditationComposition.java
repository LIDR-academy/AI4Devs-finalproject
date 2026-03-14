package com.hexagonal.meditationbuilder.domain.model;

import com.hexagonal.meditationbuilder.domain.enums.OutputType;

import java.time.Clock;
import java.time.Instant;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Aggregate Root: MeditationComposition
 *
 * Inmutable, con reglas de dominio:
 * - ID no nulo
 * - TextContent obligatorio
 * - createdAt/updatedAt no nulos y updatedAt >= createdAt
 * - OutputType derivado de la presencia de imagen:
 *      - Sin imagen -> PODCAST
 *      - Con imagen -> VIDEO
 *
 * Campos opcionales (musicReference, imageReference) pueden ser null.
 * Expone accessors opcionales vía Optional para mayor expresividad.
 */
public record MeditationComposition(
        UUID id,
        TextContent textContent,
        MusicReference musicReference,   // nullable
        ImageReference imageReference,   // nullable
        Instant createdAt,
        Instant updatedAt
) {

    // ===== Constructor canónico con invariantes =====
    public MeditationComposition {
        Objects.requireNonNull(id, "ID cannot be null");
        Objects.requireNonNull(textContent, "Text content is mandatory");
        Objects.requireNonNull(createdAt, "createdAt cannot be null");
        Objects.requireNonNull(updatedAt, "updatedAt cannot be null");

        if (updatedAt.isBefore(createdAt)) {
            throw new IllegalArgumentException("updatedAt must be >= createdAt");
        }
    }

    // ===== Factorías =====

    /**
     * Crea una composición nueva generando UUID y timestamps con el Clock indicado.
     */
    public static MeditationComposition create(TextContent text, Clock clock) {
        Objects.requireNonNull(text, "Text content is mandatory");
        Objects.requireNonNull(clock, "Clock cannot be null");
        Instant now = Instant.now(clock);
        return new MeditationComposition(UUID.randomUUID(), text, null, null, now, now);
        }

    /**
     * Crea una composición nueva con UUID proporcionado (por ej., desde otra bounded context),
     * usando el Clock indicado para los timestamps.
     */
    public static MeditationComposition create(UUID id, TextContent text, Clock clock) {
        Objects.requireNonNull(id, "ID cannot be null");
        Objects.requireNonNull(text, "Text content is mandatory");
        Objects.requireNonNull(clock, "Clock cannot be null");
        Instant now = Instant.now(clock);
        return new MeditationComposition(id, text, null, null, now, now);
    }

    // Conveniences sin Clock explícito (usa UTC)
    public static MeditationComposition create(TextContent text) {
        return create(text, Clock.systemUTC());
    }
    public static MeditationComposition create(UUID id, TextContent text) {
        return create(id, text, Clock.systemUTC());
    }

    // ===== API de modificación (devuelve nuevas instancias) =====

    /** Cambia el texto y actualiza updatedAt. */
    public MeditationComposition withText(TextContent newText, Clock clock) {
        Objects.requireNonNull(newText, "Text content cannot be null");
        Objects.requireNonNull(clock, "Clock cannot be null");
        return new MeditationComposition(
                id, newText, musicReference, imageReference, createdAt, Instant.now(clock)
        );
    }
    public MeditationComposition withText(TextContent newText) {
        return withText(newText, Clock.systemUTC());
    }

    /** Selecciona música (usa null para deseleccionar) y actualiza updatedAt. */
    public MeditationComposition withMusic(MusicReference music, Clock clock) {
        Objects.requireNonNull(clock, "Clock cannot be null");
        return new MeditationComposition(
                id, textContent, music, imageReference, createdAt, Instant.now(clock)
        );
    }
    public MeditationComposition withMusic(MusicReference music) {
        return withMusic(music, Clock.systemUTC());
    }

    /** Deselecciona música y actualiza updatedAt. */
    public MeditationComposition withoutMusic(Clock clock) {
        Objects.requireNonNull(clock, "Clock cannot be null");
        return new MeditationComposition(
                id, textContent, null, imageReference, createdAt, Instant.now(clock)
        );
    }
    public MeditationComposition withoutMusic() {
        return withoutMusic(Clock.systemUTC());
    }

    /** Añade imagen (no admite null) y actualiza updatedAt. */
    public MeditationComposition withImage(ImageReference image, Clock clock) {
        Objects.requireNonNull(image, "Image reference cannot be null");
        Objects.requireNonNull(clock, "Clock cannot be null");
        return new MeditationComposition(
                id, textContent, musicReference, image, createdAt, Instant.now(clock)
        );
    }
    public MeditationComposition withImage(ImageReference image) {
        return withImage(image, Clock.systemUTC());
    }

    /** Elimina imagen y actualiza updatedAt. */
    public MeditationComposition withoutImage(Clock clock) {
        Objects.requireNonNull(clock, "Clock cannot be null");
        return new MeditationComposition(
                id, textContent, musicReference, null, createdAt, Instant.now(clock)
        );
    }
    public MeditationComposition withoutImage() {
        return withoutImage(Clock.systemUTC());
    }

    // ===== Reglas de negocio derivadas =====

    /** Derivación del tipo de salida: sin imagen -> PODCAST; con imagen -> VIDEO. */
    public OutputType outputType() {
        return imageReference == null ? OutputType.PODCAST : OutputType.VIDEO;
    }

    public boolean hasImage() {
        return imageReference != null;
    }

    public boolean hasMusic() {
        return musicReference != null;
    }

    // ===== Accessors opcionales =====

    public Optional<MusicReference> musicReferenceOpt() {
        return Optional.ofNullable(musicReference);
    }

    public Optional<ImageReference> imageReferenceOpt() {
        return Optional.ofNullable(imageReference);
    }
}