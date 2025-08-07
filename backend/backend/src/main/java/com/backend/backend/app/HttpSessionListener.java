package com.backend.backend.app;

import jakarta.servlet.http.HttpSessionEvent;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicInteger;

@Component
class HttpSessionListener implements jakarta.servlet.http.HttpSessionListener {
    private static final AtomicInteger activeSessions = new AtomicInteger(0);

    @Override
    public void sessionCreated(HttpSessionEvent se) {
        activeSessions.incrementAndGet();
        System.out.println("Session created. Active sessions: " + activeSessions.get());
        System.out.println("Session ID: " + se.getSession().getId());
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        activeSessions.decrementAndGet();
        System.out.println("Session destroyed. Active sessions: " + activeSessions.get());
    }

    public static int getActiveSessionCount() {
        return activeSessions.get();
    }
}
