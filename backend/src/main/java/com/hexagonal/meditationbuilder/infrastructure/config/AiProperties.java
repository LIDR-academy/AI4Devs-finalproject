package com.hexagonal.meditationbuilder.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "ai")
public class AiProperties {
    /**
     * Metaprompt para IA, configurable por properties/yaml.
     */
    private String metaprompt;

    public String getMetaprompt() {
        return metaprompt;
    }

    public void setMetaprompt(String metaprompt) {
        this.metaprompt = metaprompt;
    }
    
}
