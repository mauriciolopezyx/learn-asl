package com.backend.backend.app;

import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

@Component
public class CustomMetrics {
    private final MeterRegistry registry;

    public CustomMetrics(MeterRegistry meterRegistry) {
        this.registry = meterRegistry;
    }

    public void recordFrame(String userId) {
        registry.counter("camera_frames_received", "user", userId).increment();
    }
}
