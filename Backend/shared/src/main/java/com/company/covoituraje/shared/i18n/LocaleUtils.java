package com.company.covoituraje.shared.i18n;

import java.util.Locale;

public class LocaleUtils {
    
    private static final Locale DEFAULT_LOCALE = Locale.ENGLISH;
    
    /**
     * Parses an Accept-Language header and returns the most appropriate locale.
     * 
     * @param acceptLanguageHeader the Accept-Language header value
     * @return the parsed locale, or DEFAULT_LOCALE if parsing fails
     */
    public static Locale parseAcceptLanguage(String acceptLanguageHeader) {
        if (acceptLanguageHeader == null || acceptLanguageHeader.trim().isEmpty()) {
            return DEFAULT_LOCALE;
        }
        
        try {
            // Split by comma and get the first language
            String[] languages = acceptLanguageHeader.split(",");
            if (languages.length > 0) {
                String firstLanguage = languages[0].trim();
                
                // Remove quality values (e.g., "ca;q=0.9" -> "ca")
                if (firstLanguage.contains(";")) {
                    firstLanguage = firstLanguage.split(";")[0].trim();
                }
                
                return fromLanguageTag(firstLanguage);
            }
        } catch (Exception e) {
            // If parsing fails, return default locale
        }
        
        return DEFAULT_LOCALE;
    }
    
    /**
     * Creates a Locale from a language tag (e.g., "ca-ES", "en-US").
     * 
     * @param tag the language tag
     * @return the locale, or DEFAULT_LOCALE if parsing fails
     */
    public static Locale fromLanguageTag(String tag) {
        if (tag == null || tag.trim().isEmpty()) {
            return DEFAULT_LOCALE;
        }
        
        try {
            Locale locale = Locale.forLanguageTag(tag);
            // Check if the locale is valid by comparing with known supported languages
            String language = locale.getLanguage();
            if (language.isEmpty() || language.equals("und")) {
                return DEFAULT_LOCALE;
            }
            return locale;
        } catch (Exception e) {
            return DEFAULT_LOCALE;
        }
    }
}
