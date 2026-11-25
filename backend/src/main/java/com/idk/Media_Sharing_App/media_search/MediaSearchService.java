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
                        null,   // ← creator not fetched during search anymore
                        coverUrl,
                        null,   // ← runtime also not in search results
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


    public MediaSearchResult getDetails(String externalId, String type) {
        if (externalId == null || externalId.isBlank()) {
            throw new IllegalArgumentException("externalId is required");
        }
        String lowerType = type.toLowerCase();
        if (lowerType.equals("book")) {
            // OpenLibrary keys look like /works/OL12345W — prevent SSRF / path traversal
            if (!externalId.matches("^/works/OL[0-9A-Za-z]+$")) {
                throw new IllegalArgumentException("Invalid OpenLibrary book key");
            }
        } else if (!externalId.matches("^[0-9a-zA-Z_-]+$")) {
            throw new IllegalArgumentException("Invalid externalId format");
        }
        return switch (lowerType) {
            case "movie" -> getMovieDetails(externalId);
            case "show"  -> getShowDetails(externalId);
            case "book"  -> getBookDetails(externalId);
            case "game"  -> getGameDetails(externalId);
            default -> throw new IllegalArgumentException(
                    "Invalid type: " + type);
        };
    }

    private MediaSearchResult getMovieDetails(String movieId) {
        // single call with credits appended — one request instead of two
        String url = "https://api.themoviedb.org/3/movie/" + movieId
                + "?api_key=" + tmdbApiKey
                + "&append_to_response=credits";

        JsonNode movie = restClient.get()
                .uri(url)
                .retrieve()
                .body(JsonNode.class);

        if (movie == null) return null;

        // extract director from credits
        String director = null;
        if (movie.has("credits") && movie.get("credits").has("crew")) {
            for (JsonNode member : movie.get("credits").get("crew")) {
                if (member.has("job") &&
                        member.get("job").asText().equals("Director")) {
                    director = member.get("name").asText();
                    break;
                }
            }
        }

        String coverUrl = null;
        if (movie.has("poster_path") && !movie.get("poster_path").isNull()) {
            coverUrl = "https://image.tmdb.org/t/p/w500"
                    + movie.get("poster_path").asText();
        }

        return new MediaSearchResult(
                movie.has("title") ? movie.get("title").asText() : null,
                director,
                coverUrl,
                movie.has("runtime") ? movie.get("runtime").asInt() : null,
                movie.has("overview") ? movie.get("overview").asText() : null,
                "movie",
                movieId
        );
    }

    private MediaSearchResult getShowDetails(String showId) {
        String url = "https://api.themoviedb.org/3/tv/" + showId
                + "?api_key=" + tmdbApiKey
                + "&append_to_response=credits";

        JsonNode show = restClient.get()
                .uri(url)
                .retrieve()
                .body(JsonNode.class);

        if (show == null) return null;

        // for shows, look for "Executive Producer" or series creator
        String creator = null;
        if (show.has("created_by") && show.get("created_by").isArray()
                && show.get("created_by").size() > 0) {
            creator = show.get("created_by").get(0).get("name").asText();
        }

        String coverUrl = null;
        if (show.has("poster_path") && !show.get("poster_path").isNull()) {
            coverUrl = "https://image.tmdb.org/t/p/w500"
                    + show.get("poster_path").asText();
        }

        return new MediaSearchResult(
                show.has("name") ? show.get("name").asText() : null,
                creator,
                coverUrl,
                show.has("number_of_episodes") ? show.get("number_of_episodes").asInt() : null,
                show.has("overview") ? show.get("overview").asText() : null,
                "show",
                showId
        );
    }

    private MediaSearchResult getBookDetails(String bookKey) {
        // Open Library work details
        String url = "https://openlibrary.org" + bookKey + ".json";

        JsonNode book = restClient.get()
                .uri(url)
                .retrieve()
                .body(JsonNode.class);

        if (book == null) return null;

        String description = null;
        if (book.has("description")) {
            JsonNode desc = book.get("description");
            // description can be a string or an object with a "value" field
            description = desc.isTextual() ? desc.asText()
                    : desc.has("value") ? desc.get("value").asText() : null;
        }

        return new MediaSearchResult(
                book.has("title") ? book.get("title").asText() : null,
                null,  // author requires another call to /authors endpoint
                null,  // cover requires cover_i from original search
                null,
                description,
                "book",
                bookKey
        );
    }

    private MediaSearchResult getGameDetails(String gameId) {
        String url = "https://api.rawg.io/api/games/" + gameId
                + "?key=" + rawgApiKey;

        JsonNode game = restClient.get()
                .uri(url)
                .retrieve()
                .body(JsonNode.class);

        if (game == null) return null;

        String developer = null;
        if (game.has("developers") && game.get("developers").isArray()
                && game.get("developers").size() > 0) {
            developer = game.get("developers").get(0).get("name").asText();
        }

        String coverUrl = null;
        if (game.has("background_image") && !game.get("background_image").isNull()) {
            coverUrl = game.get("background_image").asText();
        }

        return new MediaSearchResult(
                game.has("name") ? game.get("name").asText() : null,
                developer,
                coverUrl,
                null,
                game.has("description_raw") ? game.get("description_raw").asText() : null,
                "game",
                gameId
        );
    }
}