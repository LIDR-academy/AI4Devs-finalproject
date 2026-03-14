package com.hexagonal.identity.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for GoogleUserInfo value object (TDD — Phase 3).
 */
class GoogleUserInfoTest {

    @Test
    void constructor_storesAllFields() {
        var info = new GoogleUserInfo("google-sub-001", "ana@gmail.com", "Ana García",
                "https://photo.url/pic.jpg");

        assertThat(info.identificadorGoogle()).isEqualTo("google-sub-001");
        assertThat(info.correo()).isEqualTo("ana@gmail.com");
        assertThat(info.nombre()).isEqualTo("Ana García");
        assertThat(info.urlFoto()).isEqualTo("https://photo.url/pic.jpg");
    }

    @Test
    void constructor_acceptsNullUrlFoto() {
        assertThatNoException().isThrownBy(() ->
                new GoogleUserInfo("sub", "a@b.com", "Ana", null));
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    void constructor_throwsWhenIdentificadorGoogleIsBlank(String sub) {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> new GoogleUserInfo(sub, "a@b.com", "Ana", null));
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    void constructor_throwsWhenCorreoIsBlank(String correo) {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> new GoogleUserInfo("sub", correo, "Ana", null));
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    void constructor_throwsWhenNombreIsBlank(String nombre) {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> new GoogleUserInfo("sub", "a@b.com", nombre, null));
    }
}
