package com.mtl.media.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(CatalogClientProperties.class)
public class CatalogRestClientConfig {

  @Bean
  RestClient catalogRestClient(CatalogClientProperties catalogClientProperties) {
    String base = catalogClientProperties.baseUrl().replaceAll("/$", "");
    return RestClient.builder().baseUrl(base).build();
  }
}
