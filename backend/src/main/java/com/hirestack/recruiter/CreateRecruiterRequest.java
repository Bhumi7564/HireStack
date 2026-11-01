package com.hirestack.recruiter;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateRecruiterRequest {
    @NotNull(message = "User ID is required")
    private Long userId;

    private String department;
    private String title;
    private Integer maxActiveJobs;
}

