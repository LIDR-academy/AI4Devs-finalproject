package com.company.covoituraje.notification.api;

import com.company.covoituraje.notification.domain.NotificationSubscription;
import com.company.covoituraje.notification.repository.NotificationSubscriptionRepository;
import com.company.covoituraje.notification.service.NotificationService;
import com.company.covoituraje.notification.service.EmailWorker;
import com.company.covoituraje.notification.service.NotificationEvents;
import com.company.covoituraje.shared.i18n.LocaleUtils;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Locale;

@Path("/notifications")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NotificationResource {

    @Inject
    private NotificationService notificationService;
    @Inject
    private NotificationSubscriptionRepository subscriptionRepository;
    @Inject
    EmailWorker emailWorker;
    
    static final class AuthContext {
        private static final ThreadLocal<String> USER_ID = new ThreadLocal<>();
        static void setUserId(String userId) { USER_ID.set(userId); }
        static String getUserId() { return USER_ID.get(); }
        static void clear() { USER_ID.remove(); }
    }

    public NotificationResource() {}

    @POST
    @Path("/subscribe")
    public Response subscribe(
        @HeaderParam("Accept-Language") String acceptLanguage,
        SubscriptionRequest request
    ) {
        try {
            String userId = AuthContext.getUserId();
            if (userId == null) {
                return Response.status(401).entity("{\"error\": \"Unauthorized\"}").build();
            }

            NotificationSubscription subscription = notificationService.subscribeUser(
                userId, 
                request.endpoint, 
                request.p256dhKey, 
                request.authKey
            );

            return Response.ok(subscription).build();
        } catch (Exception e) {
            return Response.status(500).entity("{\"error\": \"Internal server error\"}").build();
        }
    }

    @DELETE
    @Path("/unsubscribe")
    public Response unsubscribe(
        @HeaderParam("Accept-Language") String acceptLanguage,
        @QueryParam("endpoint") String endpoint
    ) {
        try {
            String userId = AuthContext.getUserId();
            if (userId == null) {
                return Response.status(401).entity("{\"error\": \"Unauthorized\"}").build();
            }
            if (endpoint == null || endpoint.isBlank()) {
                return Response.status(400).entity("{\"error\": \"Missing endpoint query param\"}").build();
            }

            notificationService.unsubscribeUser(userId, endpoint);
            return Response.ok("{\"message\": \"Unsubscribed successfully\"}").build();
        } catch (Exception e) {
            return Response.status(500).entity("{\"error\": \"Internal server error\"}").build();
        }
    }

    @GET
    @Path("/subscriptions")
    public Response getSubscriptions(@HeaderParam("Accept-Language") String acceptLanguage) {
        try {
            String userId = AuthContext.getUserId();
            if (userId == null) {
                return Response.status(401).entity("{\"error\": \"Unauthorized\"}").build();
            }

            List<NotificationSubscription> subscriptions = subscriptionRepository.findActiveByUserId(userId);
            return Response.ok(subscriptions).build();
        } catch (Exception e) {
            return Response.status(500).entity("{\"error\": \"Internal server error\"}").build();
        }
    }

    @POST
    @Path("/send")
    public Response sendNotification(
        @HeaderParam("Accept-Language") String acceptLanguage,
        NotificationRequest request
    ) {
        try {
            String userId = AuthContext.getUserId();
            if (userId == null) {
                return Response.status(401).entity("{\"error\": \"Unauthorized\"}").build();
            }

            notificationService.sendPushNotification(userId, request.title, request.body);
            return Response.ok("{\"message\": \"Notification sent\"}").build();
        } catch (Exception e) {
            return Response.status(500).entity("{\"error\": \"Internal server error\"}").build();
        }
    }

    @GET
    @Path("/health")
    public Response health() {
        return Response.ok("{\"status\": \"UP\", \"service\": \"notification-service\"}").build();
    }

    // --- Event endpoints (internal or admin-triggered) ---
    @POST
    @Path("/events/booking-confirmed")
    public Response bookingConfirmed(
        @HeaderParam("Accept-Language") String acceptLanguage,
        BookingConfirmedRequest request
    ) {
        String userId = AuthContext.getUserId();
        if (userId == null) {
            return Response.status(401).entity("{\"error\": \"Unauthorized\"}").build();
        }
        java.util.Locale locale = request.locale != null && !request.locale.isBlank() ? java.util.Locale.forLanguageTag(request.locale) : java.util.Locale.ENGLISH;
        NotificationEvents.BookingConfirmedEvent event = new NotificationEvents.BookingConfirmedEvent(userId, request.email, request.tripId, request.seats, locale);
        emailWorker.handle(event);
        return Response.ok("{\"message\": \"Event processed\"}").build();
    }

    @POST
    @Path("/events/trip-cancelled")
    public Response tripCancelled(
        @HeaderParam("Accept-Language") String acceptLanguage,
        TripCancelledRequest request
    ) {
        String userId = AuthContext.getUserId();
        if (userId == null) {
            return Response.status(401).entity("{\"error\": \"Unauthorized\"}").build();
        }
        java.util.Locale locale = request.locale != null && !request.locale.isBlank() ? java.util.Locale.forLanguageTag(request.locale) : java.util.Locale.ENGLISH;
        NotificationEvents.TripCancelledEvent event = new NotificationEvents.TripCancelledEvent(userId, request.email, request.tripId, locale);
        emailWorker.handle(event);
        return Response.ok("{\"message\": \"Event processed\"}").build();
    }

    // DTOs
    public static class SubscriptionRequest {
        public String endpoint;
        public String p256dhKey;
        public String authKey;
    }

    public static class UnsubscribeRequest {
        public String endpoint;
    }

    public static class NotificationRequest {
        public String title;
        public String body;
    }

    public static class BookingConfirmedRequest {
        public String email;
        public String tripId;
        public int seats;
        public String locale;
    }

    public static class TripCancelledRequest {
        public String email;
        public String tripId;
        public String locale;
    }
}
