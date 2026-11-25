package com.idk.Media_Sharing_App.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // one bucket per IP address
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket getBucket(String ip, String path) {
        String key = ip + ":" + (path.contains("/media/search") ? "search" : "general");
        return buckets.computeIfAbsent(key, k ->
                path.contains("/media/search") ? createSearchBucket() : createBucket());
    }

    private Bucket createSearchBucket() {
        // 20 search requests per minute per IP
        Bandwidth limit = Bandwidth.classic(20, Refill.greedy(20, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket createBucket() {
        // 60 requests per minute per IP
        Bandwidth limit = Bandwidth.classic(60, Refill.greedy(60, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String ip = getClientIp(request);
        String path = request.getRequestURI();
        Bucket bucket = getBucket(ip, path);

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"error\": \"Too many requests — slow down\"}");
        }
    }

    /**
     * FIX [High]: always use the real socket address (request.getRemoteAddr()).
     * X-Forwarded-For is intentionally NOT trusted because it is trivially spoofable
     * by clients. If this application is ever deployed behind a trusted reverse proxy
     * (nginx, AWS ALB, etc.), add an application property and validate only then.
     */
    private String getClientIp(HttpServletRequest request) {
        return request.getRemoteAddr();
    }
}
