package com.mtl.catalog.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(CatalogKafkaProperties.class)
public class CatalogMessagingConfiguration {}
