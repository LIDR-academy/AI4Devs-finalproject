package com.hexagonal.meditationbuilder.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "ai")
public class AiProperties {
    /**
     * Metaprompt para IA, configurable por properties/yaml.
     */
    private String textMetaprompt;
    private String imageMetaprompt;

    public String getTextMetaprompt() {
        return textMetaprompt;
    }

    public void setTextMetaprompt(String metaprompt) {
        this.textMetaprompt = metaprompt;
    }

    public String getImageMetaprompt() {
        return imageMetaprompt;
    }

    public void setImageMetaprompt(String imageMetaprompt) {
        this.imageMetaprompt = imageMetaprompt;
    }
    
}
