package com.hexagonal.meditationbuilder.infrastructure.out.service.mapper;

import com.hexagonal.meditationbuilder.domain.model.ImageReference;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.AiImageRequest;
import com.hexagonal.meditationbuilder.infrastructure.out.service.dto.AiImageResponse;

import java.util.List;
import java.util.Objects;

/**
 * AiImageMapper - Maps between domain types and AI image service DTOs.
 *
 * Adaptado para soportar GPT Image y DALL·E:
 *  - GPT Image: usa 'output_format' y 'background'. Calidad: low|medium|high|auto
 *  - DALL·E:    usa 'response_format'. Calidad: standard|hd
 *
 * NOTAS:
 *  - Si conoces el modelo, usa los helpers específicos: toGptImageRequest(...) o toDalleRequest(...).
 *  - El método toCustomRequest(...) es "model-aware" y limpia/normaliza los campos en función del modelo.
 *  - Los métodos antiguos se marcan @Deprecated para mantener compatibilidad.
 *
 * @author Meditation Builder Team
 */
public final class AiImageMapper {

    /* ------------------------ Defaults y utilidades ------------------------ */

    private static final String DEFAULT_SIZE = "1024x1024";

    // GPT Image
    private static final String DEFAULT_GPT_QUALITY = "low";        // low|medium|high|auto
    private static final String DEFAULT_OUTPUT_FORMAT = "png";       // png|jpeg|webp
    private static final String DEFAULT_BACKGROUND = "auto";         // transparent|opaque|auto

    // DALL·E
    private static final String DEFAULT_DALLE_QUALITY = "standard";  // standard|hd
    private static final String DEFAULT_RESPONSE_FORMAT = "url";     // url|b64_json

    private static final int DEFAULT_N = 1;

    private AiImageMapper() {}

    private static boolean isGptImageModel(String model) {
        return model != null && model.startsWith("gpt-image");
    }

    private static boolean isDalleModel(String model) {
        return model != null && model.startsWith("dall-e");
    }

    private static String nonBlankOr(String val, String def) {
        return (val == null || val.isBlank()) ? def : val;
    }

    private static Integer positiveOr(Integer val, int def) {
        return (val == null || val <= 0) ? def : val;
    }

    /* -------------------------------------------------------------------------
     * REQUEST MAPPING (RECOMENDADOS)
     * ---------------------------------------------------------------------- */

    /**
     * Construye una petición para modelos GPT Image (p.ej., gpt-image-1-mini).
     * - Usa output_format/background (NO response_format).
     */
    public static AiImageRequest toGptImageRequest(
            String model,
            String prompt,
            Integer n,
            String size,
            String quality,
            String outputFormat,
            String background
    ) {
        Objects.requireNonNull(prompt, "prompt is required");

        // Defaults propios de GPT Image
        int nVal = positiveOr(n, DEFAULT_N);
        String sizeVal = nonBlankOr(size, DEFAULT_SIZE);
        String qualityVal = nonBlankOr(quality, DEFAULT_GPT_QUALITY);
        String outputFormatVal = nonBlankOr(outputFormat, DEFAULT_OUTPUT_FORMAT);
        String backgroundVal = nonBlankOr(background, DEFAULT_BACKGROUND);

        return new AiImageRequest(
                model,
                prompt,
                nVal,
                sizeVal,
                qualityVal,
                /* output_format */ outputFormatVal,
                /* background    */ backgroundVal,
                /* response_format (solo DALL·E) */ null
        );
    }

    /**
     * Construye una petición para modelos DALL·E (p.ej., dall-e-3).
     * - Usa response_format (NO output_format/background).
     * - Para dall-e-3, n debe ser 1.
     */
    public static AiImageRequest toDalleRequest(
            String model,
            String prompt,
            Integer n,
            String size,
            String quality,
            String responseFormat
    ) {
        Objects.requireNonNull(prompt, "prompt is required");

        int nVal = positiveOr(n, DEFAULT_N);
        if ("dall-e-3".equals(model)) {
            nVal = 1; // restricción del servicio
        }

        String sizeVal = nonBlankOr(size, DEFAULT_SIZE);
        String qualityVal = nonBlankOr(quality, DEFAULT_DALLE_QUALITY);
        String responseFormatVal = nonBlankOr(responseFormat, DEFAULT_RESPONSE_FORMAT);

        return new AiImageRequest(
                model,
                prompt,
                nVal,
                sizeVal,
                qualityVal,
                /* output_format */ null,     // no aplica
                /* background    */ null,     // no aplica
                /* response_format */ responseFormatVal
        );
    }

    /**
     * Mapeo "model-aware" totalmente configurable. Normaliza los campos dependiendo
     * de la familia del modelo y limpia los que no apliquen.
     *
     * @param model           "gpt-image-1(-mini)" o "dall-e-3" / "dall-e-2"
     * @param prompt          descripción de imagen
     * @param n               nº de imágenes
     * @param size            1024x1024 | 1024x1792 | 1792x1024
     * @param quality         GPT Image: low|medium|high|auto ; DALL·E: standard|hd
     * @param outputFormat    GPT Image: png|jpeg|webp
     * @param background      GPT Image: transparent|opaque|auto
     * @param responseFormat  DALL·E: url|b64_json
     */
    public static AiImageRequest toCustomRequest(
            String model,
            String prompt,
            Integer n,
            String size,
            String quality,
            String outputFormat,
            String background,
            String responseFormat
    ) {
        Objects.requireNonNull(prompt, "prompt is required");

        if (isGptImageModel(model)) {
            // Para GPT Image ignoramos response_format y aplicamos defaults propios
            return toGptImageRequest(
                    model,
                    prompt,
                    n,
                    nonBlankOr(size, DEFAULT_SIZE),
                    nonBlankOr(quality, DEFAULT_GPT_QUALITY),
                    nonBlankOr(outputFormat, DEFAULT_OUTPUT_FORMAT),
                    nonBlankOr(background, DEFAULT_BACKGROUND)
            );
        } else if (isDalleModel(model)) {
            // Para DALL·E ignoramos output_format/background y aplicamos defaults propios
            return toDalleRequest(
                    model,
                    prompt,
                    n,
                    nonBlankOr(size, DEFAULT_SIZE),
                    nonBlankOr(quality, DEFAULT_DALLE_QUALITY),
                    nonBlankOr(responseFormat, DEFAULT_RESPONSE_FORMAT)
            );
        }

        // Si no sabemos la familia, elegimos un set seguro y no invasivo:
        // - dejamos n y size con defaults
        // - NO seteamos campos específicos (output/background/responseFormat)
        return new AiImageRequest(
                (model != null && !model.isBlank()) ? model : null,
                prompt,
                positiveOr(n, DEFAULT_N),
                nonBlankOr(size, DEFAULT_SIZE),
                nonBlankOr(quality, DEFAULT_GPT_QUALITY), // valor neutro; el adapter puede sobreescribir
                null, // output_format
                null, // background
                null  // response_format
        );
    }

    /* -------------------------------------------------------------------------
     * Métodos "legacy" (mantener si tienes código que aún los usa)
     * ---------------------------------------------------------------------- */

    /**
     * @deprecated Usa toGptImageRequest(...) o toDalleRequest(...) según el modelo.
     */
    @Deprecated
    public static AiImageRequest toRequest(String prompt) {
        Objects.requireNonNull(prompt, "prompt is required");
        // Devolvemos un request minimalista y neutro (el adapter debería completar/normalizar).
        return new AiImageRequest(
                /* model */ null,
                prompt,
                DEFAULT_N,
                DEFAULT_SIZE,
                DEFAULT_GPT_QUALITY,
                /* output_format */ null,
                /* background    */ null,
                /* response_format */ null
        );
    }

    /**
     * @deprecated Usa toGptImageRequest(..., quality="high") o toDalleRequest(..., quality="hd").
     */
    @Deprecated
    public static AiImageRequest toHighQualityRequest(String prompt) {
        Objects.requireNonNull(prompt, "prompt is required");
        return new AiImageRequest(
                /* model */ null,
                prompt,
                DEFAULT_N,
                DEFAULT_SIZE,
                "high",        // alto para GPT Image; el adapter puede traducir si fuese DALL·E
                /* output_format */ null,
                /* background    */ null,
                /* response_format */ null
        );
    }

    /* -------------------------------------------------------------------------
     * RESPONSE MAPPING (sin cambios relevantes)
     * ---------------------------------------------------------------------- */

    /**
     * Extrae ImageReference del response (URL o base64).
     * Si sólo hay base64, devuelve un data URL "data:image/png;base64,<b64>".
     */
    public static ImageReference fromResponse(AiImageResponse response) {
        if (response == null) {
            throw new IllegalArgumentException("response is required");
        }

        List<AiImageResponse.ImageData> data = response.data();
        if (data == null || data.isEmpty()) {
            throw new IllegalArgumentException("response has no data");
        }

        AiImageResponse.ImageData imageData = data.get(0);

        String url = imageData.url();
        if (url != null && !url.isBlank()) {
            return new ImageReference(url);
        }

        String b64 = imageData.b64Json();
        if (b64 != null && !b64.isBlank()) {
            String dataUrl = "data:image/png;base64," + b64;
            return new ImageReference(dataUrl);
        }

        throw new IllegalArgumentException("response contains neither image URL nor base64 data");
    }

    /**
     * Devuelve el revised prompt si el proveedor lo aporta (p.ej., DALL·E 3).
     */
    public static String getRevisedPrompt(AiImageResponse response) {
        if (response == null) return null;
        List<AiImageResponse.ImageData> data = response.data();
        if (data == null || data.isEmpty()) return null;

        AiImageResponse.ImageData first = data.get(0);
        return first.revisedPrompt();
    }

    /**
     * ¿El response contiene imagen en base64?
     */
    public static boolean hasBase64Image(AiImageResponse response) {
        if (response == null) return false;
        List<AiImageResponse.ImageData> data = response.data();
        if (data == null || data.isEmpty()) return false;

        String b64 = data.get(0).b64Json();
        return b64 != null && !b64.isBlank();
    }

    /**
     * Extrae la imagen en base64 (sin prefijo data:).
     */
    public static String getBase64Image(AiImageResponse response) {
        if (response == null) return null;
        List<AiImageResponse.ImageData> data = response.data();
        if (data == null || data.isEmpty()) return null;

        return data.get(0).b64Json();
    }
}
