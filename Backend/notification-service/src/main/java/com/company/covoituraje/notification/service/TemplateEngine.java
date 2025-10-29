package com.company.covoituraje.notification.service;

import com.company.covoituraje.shared.i18n.MessageService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Template engine that loads HTML templates and replaces variables.
 * Follows Template Method Pattern for email structure.
 * Follows SOLID principles with single responsibility and dependency inversion.
 */
@ApplicationScoped
public class TemplateEngine {

    @Inject
    MessageService messageService;
    
    private final Map<String, String> templateCache = new ConcurrentHashMap<>();

    /**
     * Renders a template with variables and locale support.
     * Supports both MessageService keys and HTML template files.
     */
    public String render(String templateName, Map<String, Object> variables, Locale locale) {
        // First try to load HTML template
        String htmlTemplate = loadHtmlTemplate(templateName, locale);
        if (htmlTemplate != null) {
            return replaceVariables(htmlTemplate, variables);
        }
        
        // Fallback to MessageService for simple text templates
        return renderMessageServiceTemplate(templateName, variables, locale);
    }

    /**
     * Loads HTML template from resources with locale support.
     * Caches templates for performance.
     */
    private String loadHtmlTemplate(String templateName, Locale locale) {
        String cacheKey = templateName + "_" + locale.toLanguageTag();
        
        return templateCache.computeIfAbsent(cacheKey, key -> {
            // Try locale-specific template first
            String templatePath = "email-templates/" + templateName + "_" + locale.toLanguageTag() + ".html";
            String template = loadTemplateFromResources(templatePath);
            
            if (template == null) {
                // Fallback to English template
                templatePath = "email-templates/" + templateName + "_en.html";
                template = loadTemplateFromResources(templatePath);
            }
            
            return template;
        });
    }

    /**
     * Loads template from classpath resources.
     */
    private String loadTemplateFromResources(String templatePath) {
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream(templatePath)) {
            if (inputStream == null) {
                return null;
            }
            return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            System.err.println("Failed to load template: " + templatePath + " - " + e.getMessage());
            return null;
        }
    }

    /**
     * Replaces variables in template using {{variableName}} syntax.
     * Follows Template Method Pattern for variable replacement.
     */
    private String replaceVariables(String template, Map<String, Object> variables) {
        if (variables == null || variables.isEmpty()) {
            return template;
        }
        
        String result = template;
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            String value = entry.getValue() != null ? entry.getValue().toString() : "";
            result = result.replace(placeholder, value);
        }
        
        return result;
    }

    /**
     * Fallback to MessageService for simple text templates.
     * Maintains backward compatibility.
     */
    private String renderMessageServiceTemplate(String key, Map<String, Object> vars, Locale locale) {
        Object tripId = vars != null ? vars.get("tripId") : null;
        Object seats = vars != null ? vars.get("seats") : null;

        if (tripId != null && seats != null) {
            return messageService.getMessage(key, locale, tripId, seats);
        } else if (tripId != null) {
            return messageService.getMessage(key, locale, tripId);
        } else if (seats != null) {
            return messageService.getMessage(key, locale, seats);
        }
        return messageService.getMessage(key, locale);
    }

    /**
     * Clears template cache. Useful for testing or when templates are updated.
     */
    public void clearCache() {
        templateCache.clear();
    }

    /**
     * Gets cache size for monitoring purposes.
     */
    public int getCacheSize() {
        return templateCache.size();
    }
}


