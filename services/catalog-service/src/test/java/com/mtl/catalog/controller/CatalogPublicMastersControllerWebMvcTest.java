package com.mtl.catalog.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mtl.catalog.application.MasterDataQueryService;
import com.mtl.catalog.dto.PublicProvinceNamesResponse;
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
    controllers = CatalogPublicMastersController.class,
    excludeAutoConfiguration = OAuth2ResourceServerAutoConfiguration.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class CatalogPublicMastersControllerWebMvcTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private MasterDataQueryService masterDataQueryService;

  @Test
  void listPublicProvinceNames_devuelveSoloNombres() throws Exception {
    when(masterDataQueryService.listPublicProvinceNames())
        .thenReturn(new PublicProvinceNamesResponse(List.of("A Coruña", "Álava")));

    mockMvc
        .perform(get("/api/catalog/public/provinces").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nombres[0]").value("A Coruña"))
        .andExpect(jsonPath("$.nombres[1]").value("Álava"));
  }
}
