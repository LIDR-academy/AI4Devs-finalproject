package com.mtl.notification.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(NotificationKafkaProperties.class)
public class NotificationMessagingConfiguration {}
