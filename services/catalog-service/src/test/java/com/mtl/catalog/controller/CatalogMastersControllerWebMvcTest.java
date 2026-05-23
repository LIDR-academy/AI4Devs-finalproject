package com.mtl.catalog.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mtl.catalog.application.MasterDataQueryService;
import com.mtl.catalog.dto.MasterDataPageResponse;
import com.mtl.catalog.dto.ProvinceListItemDto;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.oauth2.server.resource.autoconfigure.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(
    controllers = CatalogMastersController.class,
    excludeAutoConfiguration = OAuth2ResourceServerAutoConfiguration.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class CatalogMastersControllerWebMvcTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private MasterDataQueryService masterDataQueryService;

  @Test
  void listProvinces_devuelveJsonPaginado() throws Exception {
    when(masterDataQueryService.listProvinces(eq(0), eq(20), eq("01"), eq(false)))
        .thenReturn(
            MasterDataPageResponse.of(
                List.of(new ProvinceListItemDto(1L, "01 — Álava")),
                1,
                0,
                20,
                false));

    mockMvc
        .perform(get("/api/catalog/provinces").param("q", "01").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].id").value(1))
        .andExpect(jsonPath("$.content[0].label").value("01 — Álava"))
        .andExpect(jsonPath("$.unpaged").value(false));
  }

  @Test
  void listProvinces_pageInvalido_devuelve400ProblemJson() throws Exception {
    mockMvc
        .perform(get("/api/catalog/provinces").param("page", "-1"))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
        .andExpect(jsonPath("$.title").value("Petición inválida"));
  }

  @Test
  void listProvinces_unpaged_llamaServicio() throws Exception {
    when(masterDataQueryService.listProvinces(eq(0), eq(20), isNull(), eq(true)))
        .thenReturn(MasterDataPageResponse.of(List.of(), 0, 0, 0, true));

    mockMvc
        .perform(get("/api/catalog/provinces").param("unpaged", "true"))
        .andExpect(status().isOk());
  }
}
