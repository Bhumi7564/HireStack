package com.hirestack.communication;

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
public class CreateReminderRequest {
    private Long applicationId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Remind time is required")
    private Instant remindAt;
}

