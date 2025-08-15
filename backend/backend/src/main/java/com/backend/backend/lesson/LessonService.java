package com.backend.backend.lesson;

import com.backend.backend.lesson.dto.PredictionResponse;
import com.backend.backend.lesson.dto.VideoFrameDto;
import com.backend.backend.lesson.dto.WireframeResponse;
import com.backend.backend.user.User;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class LessonService {

    private final RestTemplate restTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    public LessonService(
            RestTemplateBuilder builder,
            SimpMessagingTemplate simpMessagingTemplate
    ) {
        this.restTemplate = builder.build();
        this.messagingTemplate = simpMessagingTemplate;
    }

    public void processVideoFrame(
            VideoFrameDto videoFrameDto,
            SimpMessageHeaderAccessor headerAccessor,
            String username
    ) {
        try {
//            PredictionResponse response = restTemplate.postForObject(
//                    "http://localhost:5000/predict",
//                    videoFrameDto,
//                    PredictionResponse.class
//            );

            WireframeResponse result = restTemplate.postForObject(
                    "http://localhost:5000/predict",
                    videoFrameDto,
                    WireframeResponse.class
            );

            assert result != null;
            //System.out.println("Flask prediction: " + response.prediction() + " with " + response.confidence() + "% confidence");

            messagingTemplate.convertAndSendToUser(username, "/topic/lesson/1", result);

        } catch (Exception e) {
            System.out.println("Error calling Flask: " + e.getMessage());
        }
    }
}
