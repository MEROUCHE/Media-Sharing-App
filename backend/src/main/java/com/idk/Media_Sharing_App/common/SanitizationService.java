package com.idk.Media_Sharing_App.common;

import org.springframework.stereotype.Component;

@Component
public class SanitizationService {

    // strips all HTML tags and trims whitespace
    public String sanitize(String input) {
        if (input == null) return null;
        return input
                .replaceAll("<[^>]*>", "")    // remove HTML tags
                .replaceAll("&lt;", "<")       // decode HTML entities
                .replaceAll("&gt;", ">")
                .replaceAll("&amp;", "&")
                .replaceAll("javascript:", "") // remove javascript: protocol
                .replaceAll("on\\w+=\"[^\"]*\"", "") // remove event handlers
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