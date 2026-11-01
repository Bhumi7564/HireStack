package com.hirestack.interview;

import com.hirestack.application.Application;
import com.hirestack.auth.User;
import com.hirestack.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_type", nullable = false)
    @Builder.Default
    private InterviewType interviewType = InterviewType.VIDEO;

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_round", nullable = false)
    @Builder.Default
    private InterviewRound interviewRound = InterviewRound.FIRST_ROUND;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    @Column(name = "scheduled_start_time", nullable = false)
    private Instant scheduledStartTime;

    @Column(name = "scheduled_end_time", nullable = false)
    private Instant scheduledEndTime;

    @Column(name = "meeting_link")
    private String meetingLink;

    private String location;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdByUser;

    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InterviewPanelMember> panelMembers = new ArrayList<>();
}

