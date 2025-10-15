package com.company.covoituraje.trips.api;

final class RequestUser {
    private static final ThreadLocal<String> USER_ID = new ThreadLocal<>();
    private RequestUser() {}
    static void set(String userId) { USER_ID.set(userId); }
    static String get() { return USER_ID.get(); }
    static void clear() { USER_ID.remove(); }
}


