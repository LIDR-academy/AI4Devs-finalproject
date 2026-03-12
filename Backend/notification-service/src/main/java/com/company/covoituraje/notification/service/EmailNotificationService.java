package com.company.covoituraje.notification.service;

import com.company.covoituraje.shared.i18n.MessageService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import java.util.Locale;

@ApplicationScoped
public class EmailNotificationService {
    
    @Inject
    MessageService messageService;
    
    private String smtpHost = System.getenv().getOrDefault("SMTP_HOST", "localhost");
    private int smtpPort = Integer.parseInt(System.getenv().getOrDefault("SMTP_PORT", "1025"));
    private String smtpUser = System.getenv().getOrDefault("SMTP_USER", "");
    private String smtpPassword = System.getenv().getOrDefault("SMTP_PASSWORD", "");
    private String fromEmail = System.getenv().getOrDefault("FROM_EMAIL", "noreply@covoituraje.com");
    
    private Session mailSession;
    
    public void sendEmail(String to, String subject, String body) {
        try {
            if (mailSession == null) {
                initializeMailSession();
            }
            
            MimeMessage message = new MimeMessage(mailSession);
            message.setFrom(new InternetAddress(fromEmail));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
            message.setSubject(subject);
            message.setText(body, "UTF-8", "html");
            
            Transport.send(message);
            
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
            // Don't throw exception to avoid breaking the main flow
        }
    }
    
    public void sendBookingConfirmation(String email, String tripId, int seatsRequested, Locale locale) {
        String subject = messageService.getMessage("email.booking.confirmed.subject", locale, tripId);
        String body = messageService.getMessage("email.booking.confirmed.body", locale, seatsRequested);
        
        sendEmail(email, subject, body);
    }
    
    public void sendTripCancellation(String email, String tripId, Locale locale) {
        String subject = messageService.getMessage("email.trip.cancelled.subject", locale, tripId);
        String body = messageService.getMessage("email.trip.cancelled.body", locale, tripId);
        
        sendEmail(email, subject, body);
    }
    
    private void initializeMailSession() {
        try {
            java.util.Properties props = new java.util.Properties();
            props.put("mail.smtp.host", smtpHost);
            props.put("mail.smtp.port", smtpPort);
            props.put("mail.smtp.auth", !smtpUser.isEmpty());
            props.put("mail.smtp.starttls.enable", "true");
            
            if (!smtpUser.isEmpty()) {
                mailSession = Session.getInstance(props, new Authenticator() {
                    @Override
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(smtpUser, smtpPassword);
                    }
                });
            } else {
                mailSession = Session.getInstance(props);
            }
        } catch (Exception e) {
            System.err.println("Error initializing mail session: " + e.getMessage());
            // Create a minimal session for testing
            mailSession = Session.getInstance(new java.util.Properties());
        }
    }
}
