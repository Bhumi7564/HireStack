package com.hirestack.interview;

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
public class InterviewDTO {
    private Long id;
    private Long applicationId;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private Long jobId;
    private String jobTitle;
    private String title;
    private InterviewType interviewType;
    private InterviewRound interviewRound;
    private InterviewStatus status;
    private Instant scheduledStartTime;
    private Instant scheduledEndTime;
    private String meetingLink;
    private String location;
    private String notes;
    private List<PanelMemberDTO> panelMembers;
    private boolean hasFeedback;
    private Instant createdAt;
}

