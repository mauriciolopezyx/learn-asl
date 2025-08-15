package com.backend.backend.lesson;

import com.backend.backend.lesson.dto.VideoFrameDto;
import com.backend.backend.user.User;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Date;

@RestController
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    @MessageMapping("video-input")
    public void processVideoFrame(
            VideoFrameDto videoFrameDto,
            SimpMessageHeaderAccessor headerAccessor,
            Principal principal
    ) {
        lessonService.processVideoFrame(videoFrameDto, headerAccessor, principal.getName());
    }

}
