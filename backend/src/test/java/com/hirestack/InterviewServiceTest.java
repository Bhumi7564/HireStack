package com.hirestack;

import com.hirestack.application.Application;
import com.hirestack.application.ApplicationRepository;
import com.hirestack.auth.User;
import com.hirestack.auth.UserRepository;
import com.hirestack.candidate.Candidate;
import com.hirestack.common.BadRequestException;
import com.hirestack.interview.*;
import com.hirestack.job.JobOpening;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InterviewServiceTest {

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private InterviewPanelMemberRepository panelMemberRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private InterviewService interviewService;

    private Application application;
    private User interviewer;

    @BeforeEach
    void setUp() {
        JobOpening job = JobOpening.builder().id(1L).title("Backend Engineer").build();
        Candidate candidate = Candidate.builder().id(2L).firstName("Alice").lastName("Smith").email("alice@example.com").build();
        application = Application.builder().id(10L).job(job).candidate(candidate).build();
        interviewer = User.builder().id(5L).firstName("Alex").lastName("Rivera").email("alex@hirestack.io").build();
    }

    @Test
    @DisplayName("Scheduling interview with end time before start time throws BadRequestException")
    void testInvalidTimeRangeFails() {
        Instant start = Instant.now().plus(1, ChronoUnit.DAYS);
        Instant end = start.minus(1, ChronoUnit.HOURS);

        ScheduleInterviewRequest request = ScheduleInterviewRequest.builder()
                .applicationId(10L)
                .title("Tech Interview")
                .scheduledStartTime(start)
                .scheduledEndTime(end)
                .interviewerUserIds(Collections.singletonList(5L))
                .build();

        assertThrows(BadRequestException.class, () ->
                interviewService.scheduleInterview(1L, request)
        );
    }

    @Test
    @DisplayName("Scheduling interview detects interviewer conflicts")
    void testInterviewerConflictDetected() {
        Instant start = Instant.now().plus(1, ChronoUnit.DAYS);
        Instant end = start.plus(1, ChronoUnit.HOURS);

        when(applicationRepository.findById(10L)).thenReturn(Optional.of(application));
        when(userRepository.findById(1L)).thenReturn(Optional.of(interviewer));
        when(userRepository.findById(5L)).thenReturn(Optional.of(interviewer));
        when(interviewRepository.countInterviewerConflicts(5L, start, end)).thenReturn(1L);

        ScheduleInterviewRequest request = ScheduleInterviewRequest.builder()
                .applicationId(10L)
                .title("Conflict Interview")
                .scheduledStartTime(start)
                .scheduledEndTime(end)
                .interviewerUserIds(Collections.singletonList(5L))
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                interviewService.scheduleInterview(1L, request)
        );

        assertTrue(ex.getMessage().contains("scheduling conflict"));
    }
}

