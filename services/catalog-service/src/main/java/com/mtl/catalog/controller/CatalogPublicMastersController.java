package com.mtl.catalog.controller;

import com.mtl.catalog.application.MasterDataQueryService;
import com.mtl.catalog.dto.PublicProvinceNamesResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog/public")
public class CatalogPublicMastersController {

  private final MasterDataQueryService masterDataQueryService;

  public CatalogPublicMastersController(MasterDataQueryService masterDataQueryService) {
    this.masterDataQueryService = masterDataQueryService;
  }

  @GetMapping("/provinces")
  public PublicProvinceNamesResponse listPublicProvinceNames() {
    return masterDataQueryService.listPublicProvinceNames();
  }
}
