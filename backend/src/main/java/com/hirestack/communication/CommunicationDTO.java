package com.hirestack.communication;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommunicationDTO {
    private Long id;
    private Long candidateId;
    private String candidateName;
    private Long applicationId;
    private Long userId;
    private String userName;
    private CommunicationType type;
    private String subject;
    private String content;
    private Instant loggedAt;
}

