package com.idk.Media_Sharing_App.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Component
public class InputValidationFilter extends OncePerRequestFilter {

    private static final String[] DANGEROUS_PATTERNS = {
            "<script", "javascript:", "vbscript:", "onload=",
            "onerror=", "onclick=", "eval(", "document.cookie"
    };

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String queryString = request.getQueryString();
        if (queryString != null) {
            // decode URL encoding before checking
            String decoded = URLDecoder.decode(queryString, StandardCharsets.UTF_8);
            if (containsDangerousPattern(decoded)) {
                response.setStatus(400);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write("{\"error\": \"Invalid input detected\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean containsDangerousPattern(String input) {
        String lower = input.toLowerCase();
        for (String pattern : DANGEROUS_PATTERNS) {
            if (lower.contains(pattern)) return true;
        }
        return false;
    }
}