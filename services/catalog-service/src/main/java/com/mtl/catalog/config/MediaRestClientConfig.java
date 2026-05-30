package com.mtl.catalog.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(MediaClientProperties.class)
public class MediaRestClientConfig {

  @Bean
  RestClient mediaRestClient(MediaClientProperties mediaClientProperties) {
    String base = mediaClientProperties.baseUrl().replaceAll("/$", "");
    return RestClient.builder().baseUrl(base).build();
  }
}
