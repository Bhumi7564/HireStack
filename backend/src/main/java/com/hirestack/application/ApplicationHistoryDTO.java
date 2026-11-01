package com.hirestack.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationHistoryDTO {
    private Long id;
    private Long applicationId;
    private ApplicationStatus fromStage;
    private ApplicationStatus toStage;
    private Long changedByUserId;
    private String changedByUserName;
    private String changeReason;
    private Instant changedAt;
}

