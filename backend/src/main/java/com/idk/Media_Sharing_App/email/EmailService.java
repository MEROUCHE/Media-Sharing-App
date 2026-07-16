package com.idk.Media_Sharing_App.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.Map;

@Service
public class EmailService {

    @Value("${RESEND_API_KEY}")
    private String resendApiKey;

    private final RestClient restClient;

    public EmailService() {
        this.restClient = RestClient.create();
    }

    public void sendVerificationEmail(String to, String username,
                                      String verificationLink) {
        String subject = "Verify your email";
        String body = """
                Hi %s,
                
                Please verify your email by clicking the link below:
                
                %s
                
                This link expires in 24 hours.
                
                If you didn't create an account, ignore this email.
                """.formatted(username, verificationLink);

        sendEmail(to, subject, body);
    }

    public void sendPasswordResetEmail(String to, String username,
                                       String resetLink) {
        String subject = "Reset your password";
        String body = """
                Hi %s,
                
                You requested a password reset. Click the link below:
                
                %s
                
                This link expires in 1 hour.
                
                If you didn't request this, ignore this email.
                """.formatted(username, resetLink);

        sendEmail(to, subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            Map<String, Object> payload = Map.of(
                    "from", "onboarding@smugless.lol",
                    "to", new String[]{to},
                    "subject", subject,
                    "text", body
            );

            restClient.post()
                    .uri("https://api.resend.com/emails")
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();

        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
}