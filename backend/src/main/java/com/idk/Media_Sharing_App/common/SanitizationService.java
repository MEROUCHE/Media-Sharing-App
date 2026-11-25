package com.idk.Media_Sharing_App.common;

import org.springframework.stereotype.Component;

@Component
public class SanitizationService {

    /**
     * FIX [Medium]: XSS bypass via HTML entity decoding.
     * Previous implementation stripped tags THEN decoded entities,
     * allowing "&lt;script&gt;" to bypass tag removal and decode to "<script>".
     *
     * Fixed order: decode entities FIRST, then strip all HTML tags and dangerous patterns.
     * Note: OWASP AntiSamy is on the classpath — integrate it here if stricter policy is needed.
     */
    public String sanitize(String input) {
        if (input == null) return null;
        return input
                // Step 1: decode HTML entities first (so encoded tags are visible for stripping)
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .replaceAll("&amp;", "&")
                .replaceAll("&quot;", "\"")
                .replaceAll("&#x27;", "'")
                // Step 2: strip all resulting HTML tags
                .replaceAll("<[^>]*>", "")
                // Step 3: remove dangerous protocols and event handlers
                .replaceAll("(?i)javascript:", "")
                .replaceAll("(?i)data:", "")
                .replaceAll("(?i)vbscript:", "")
                .replaceAll("(?i)on\\w+\\s*=\\s*\"[^\"]*\"", "")
                .replaceAll("(?i)on\\w+\\s*=\\s*'[^']*'", "")
                .trim();
    }

    // sanitize but also enforce max length
    public String sanitize(String input, int maxLength) {
        String sanitized = sanitize(input);
        if (sanitized == null) return null;
        return sanitized.length() > maxLength
                ? sanitized.substring(0, maxLength)
                : sanitized;
    }
}
