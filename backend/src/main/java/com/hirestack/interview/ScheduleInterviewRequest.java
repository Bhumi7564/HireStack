package com.hirestack.interview;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleInterviewRequest {
    @NotNull(message = "Application ID is required")
    private Long applicationId;

    @NotBlank(message = "Title is required")
    private String title;

    @Builder.Default
    private InterviewType interviewType = InterviewType.VIDEO;

    @Builder.Default
    private InterviewRound interviewRound = InterviewRound.FIRST_ROUND;

    @NotNull(message = "Start time is required")
    private Instant scheduledStartTime;

    @NotNull(message = "End time is required")
    private Instant scheduledEndTime;

    private String meetingLink;
    private String location;
    private String notes;

    @NotEmpty(message = "At least one interviewer panel member must be assigned")
    private List<Long> interviewerUserIds;
}

