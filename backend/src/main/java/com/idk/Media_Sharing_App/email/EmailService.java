package com.idk.Media_Sharing_App.email;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String to, String username, String token,
                                      String baseUrl) {
        String link = baseUrl + "/api/auth/verify-email?token=" + token;
        String subject = "Verify your email";
        String body = """
                Hi %s,
                
                Please verify your email by clicking the link below:
                
                %s
                
                This link expires in 24 hours.
                
                If you didn't create an account, ignore this email.
                """.formatted(username, link);

        sendEmail(to, subject, body);
    }

    public void sendPasswordResetEmail(String to, String username, String token,
                                       String baseUrl) {
        String link = baseUrl + "/api/auth/reset-password?token=" + token;
        String subject = "Reset your password";
        String body = """
                Hi %s,
                
                You requested a password reset. Click the link below:
                
                %s
                
                This link expires in 1 hour.
                
                If you didn't request this, ignore this email.
                """.formatted(username, link);

        sendEmail(to, subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom("onboarding@resend.dev");  // ← update with your domain
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, false);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
}