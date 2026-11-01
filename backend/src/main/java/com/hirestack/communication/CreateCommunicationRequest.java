package com.hirestack.communication;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateCommunicationRequest {
    @NotNull(message = "Candidate ID is required")
    private Long candidateId;

    private Long applicationId;

    @NotNull(message = "Communication type is required")
    private CommunicationType type;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Content is required")
    private String content;
}

