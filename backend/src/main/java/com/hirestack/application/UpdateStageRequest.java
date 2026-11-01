package com.hirestack.application;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateStageRequest {
    @NotNull(message = "Target stage is required")
    private ApplicationStatus targetStage;

    private String reason;
}

