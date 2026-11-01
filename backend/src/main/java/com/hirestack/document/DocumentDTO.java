package com.hirestack.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DocumentDTO {
    private Long id;
    private Long candidateId;
    private String candidateName;
    private Long applicationId;
    private String fileName;
    private String fileType;
    private Long fileSizeBytes;
    private String storageType;
    private String documentCategory;
    private Long uploadedByUserId;
    private String uploadedByUserName;
    private Instant uploadedAt;
}

