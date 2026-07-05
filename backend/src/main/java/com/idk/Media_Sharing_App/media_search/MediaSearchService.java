package com.idk.Media_Sharing_App.media_search;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

@Service
public class MediaSearchService {

    @Value("${tmdb.api.key}")
    private String tmdbApiKey;

    @Value("${rawg.api.key}")
    private String rawgApiKey;

    private final RestClient restClient;

    public MediaSearchService() {
        this.restClient = RestClient.create();
    }

    public List<MediaSearchResult> search(String query, String type) {
        return switch (type.toLowerCase()) {
            case "book"  -> searchBooks(query);
            case "movie" -> searchMovies(query);
            case "show"  -> searchShows(query);
            case "game"  -> searchGames(query);
            default -> throw new IllegalArgumentException(
                    "Invalid type: " + type + ". Must be book, movie, show or game");
        };
    }

    // --- Books via Open Library ---
    private List<MediaSearchResult> searchBooks(String query) {
        String url = "https://openlibrary.org/search.json?q="
                + query.replace(" ", "+") + "&limit=5&fields=key,title,author_name,number_of_pages_median,cover_i,first_sentence";

        JsonNode response = restClient.get()
                .uri(url)
                .retrieve()
                .body(JsonNode.class);

        List<MediaSearchResult> results = new ArrayList<>();
        if (response != null && response.has("docs")) {
            for (JsonNode doc : response.get("docs")) {
                String coverUrl = null;
                if (doc.has("cover_i")) {
                    coverUrl = "https://covers.openlibrary.org/b/id/"
                            + doc.get("cover_i").asText() + "-L.jpg";
                }

                results.add(new MediaSearchResult(
                        doc.has("title") ? doc.get("title").asText() : null,
                        doc.has("author_name") ? doc.get("author_name").get(0).asText() : null,
                        coverUrl,
                        doc.has("number_of_pages_median") ? doc.get("number_of_pages_median").asInt() : null,
                        null,  // Open Library doesn't return description in search
                        "book",
                        doc.has("key") ? doc.get("key").asText() : null
                ));
            }
        }
        return results;
    }

    // --- Movies via TMDB ---
    private List<MediaSearchResult> searchMovies(String query) {
        String url = "https://api.themoviedb.org/3/search/movie?query="
                + query.replace(" ", "+") + "&api_key=" + tmdbApiKey + "&page=1";

        JsonNode response = restClient.get()
                .uri(url)
                .retrieve()
                .body(JsonNode.class);

        List<MediaSearchResult> results = new ArrayList<>();
        if (response != null && response.has("results")) {
            int count = 0;
            for (JsonNode movie : response.get("results")) {
                if (count++ >= 5) break;

                String coverUrl = null;
                if (movie.has("poster_path") && !movie.get("poster_path").isNull()) {
                    coverUrl = "https://image.tmdb.org/t/p/w500"
                            + movie.get("poster_path").asText();
                }

                results.add(new MediaSearchResult(
                        movie.has("title") ? movie.get("title").asText() : null,
                        null,  // TMDB search doesn't return director — needs a second call
                        coverUrl,
                        movie.has("runtime") ? movie.get("runtime").asInt() : null,
                        movie.has("overview") ? movie.get("overview").asText() : null,
                        "movie",
                        movie.has("id") ? movie.get("id").asText() : null
                ));
            }
        }
        return results;
    }

    // --- Shows via TMDB ---
    private List<MediaSearchResult> searchShows(String query) {
        String url = "https://api.themoviedb.org/3/search/tv?query="
                + query.replace(" ", "+") + "&api_key=" + tmdbApiKey + "&page=1";

        JsonNode response = restClient.get()
                .uri(url)
                .retrieve()
                .body(JsonNode.class);

        List<MediaSearchResult> results = new ArrayList<>();
        if (response != null && response.has("results")) {
            int count = 0;
            for (JsonNode show : response.get("results")) {
                if (count++ >= 5) break;

                String coverUrl = null;
                if (show.has("poster_path") && !show.get("poster_path").isNull()) {
                    coverUrl = "https://image.tmdb.org/t/p/w500"
                            + show.get("poster_path").asText();
                }

                results.add(new MediaSearchResult(
                        show.has("name") ? show.get("name").asText() : null,
                        null,
                        coverUrl,
                        show.has("number_of_episodes") ? show.get("number_of_episodes").asInt() : null,
                        show.has("overview") ? show.get("overview").asText() : null,
                        "show",
                        show.has("id") ? show.get("id").asText() : null
                ));
            }
        }
        return results;
    }

    // --- Games via RAWG ---
    private List<MediaSearchResult> searchGames(String query) {
        String url = "https://api.rawg.io/api/games?search="
                + query.replace(" ", "+") + "&key=" + rawgApiKey + "&page_size=5";

        JsonNode response = restClient.get()
                .uri(url)
                .retrieve()
                .body(JsonNode.class);

        List<MediaSearchResult> results = new ArrayList<>();
        if (response != null && response.has("results")) {
            for (JsonNode game : response.get("results")) {
                String coverUrl = null;
                if (game.has("background_image") && !game.get("background_image").isNull()) {
                    coverUrl = game.get("background_image").asText();
                }

                // RAWG doesn't have a clean "studio" field in search
                // developers array needs parsing
                String developer = null;
                if (game.has("developers") && game.get("developers").isArray()
                        && game.get("developers").size() > 0) {
                    developer = game.get("developers").get(0).get("name").asText();
                }

                results.add(new MediaSearchResult(
                        game.has("name") ? game.get("name").asText() : null,
                        developer,
                        coverUrl,
                        null,  // no "total units" concept for games
                        null,
                        "game",
                        game.has("id") ? game.get("id").asText() : null
                ));
            }
        }
        return results;
    }
}