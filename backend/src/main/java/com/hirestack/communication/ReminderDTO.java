package com.hirestack.communication;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReminderDTO {
    private Long id;
    private Long userId;
    private Long applicationId;
    private String candidateName;
    private String jobTitle;
    private String title;
    private String description;
    private Instant remindAt;
    private boolean completed;
    private Instant createdAt;
}

