package com.company.covoituraje.shared.i18n;

import java.text.MessageFormat;
import java.util.Locale;
import java.util.ResourceBundle;

public class MessageService {
    
    private static final String BASE_NAME = "messages";
    private static final Locale DEFAULT_LOCALE = Locale.ENGLISH;
    
    /**
     * Gets a message for the given key and locale, formatting it with the provided parameters.
     * 
     * @param key the message key
     * @param locale the locale for the message
     * @param params parameters to format the message
     * @return the formatted message, or the key if not found
     */
    public String getMessage(String key, Locale locale, Object... params) {
        if (key == null || key.trim().isEmpty()) {
            return "";
        }
        
        Locale targetLocale = locale != null ? locale : DEFAULT_LOCALE;
        
        try {
            ResourceBundle bundle = ResourceBundle.getBundle(BASE_NAME, targetLocale);
            String pattern = bundle.getString(key);
            return MessageFormat.format(pattern, params);
        } catch (Exception e) {
            // If key not found or other error, return the key as fallback
            return key;
        }
    }
    
    /**
     * Gets a message for the given key and locale, returning a default message if the key is not found.
     * 
     * @param key the message key
     * @param defaultMsg the default message to return if key not found
     * @param locale the locale for the message
     * @param params parameters to format the message
     * @return the formatted message, or the default message if key not found
     */
    public String getMessageOrDefault(String key, String defaultMsg, Locale locale, Object... params) {
        if (key == null || key.trim().isEmpty()) {
            return defaultMsg != null ? defaultMsg : "";
        }
        
        Locale targetLocale = locale != null ? locale : DEFAULT_LOCALE;
        
        try {
            ResourceBundle bundle = ResourceBundle.getBundle(BASE_NAME, targetLocale);
            String pattern = bundle.getString(key);
            return MessageFormat.format(pattern, params);
        } catch (Exception e) {
            // If key not found or other error, return the default message
            return defaultMsg != null ? defaultMsg : key;
        }
    }
}
