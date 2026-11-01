package com.hirestack.document;

import com.hirestack.application.Application;
import com.hirestack.application.ApplicationRepository;
import com.hirestack.auth.User;
import com.hirestack.auth.UserRepository;
import com.hirestack.candidate.Candidate;
import com.hirestack.candidate.CandidateRepository;
import com.hirestack.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final CandidateDocumentRepository documentRepository;
    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    @Transactional(readOnly = true)
    public List<DocumentDTO> getDocumentsByCandidate(Long candidateId) {
        return documentRepository.findByCandidateIdOrderByUploadedAtDesc(candidateId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DocumentDTO> getDocumentsByApplication(Long applicationId) {
        return documentRepository.findByApplicationIdOrderByUploadedAtDesc(applicationId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DocumentDTO uploadDocument(
            Long currentUserId,
            Long candidateId,
            Long applicationId,
            String documentCategory,
            MultipartFile file) throws IOException {

        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", candidateId));

        Application application = null;
        if (applicationId != null) {
            application = applicationRepository.findById(applicationId).orElse(null);
        }

        User user = null;
        if (currentUserId != null) {
            user = userRepository.findById(currentUserId).orElse(null);
        }

        String subDirectory = "resumes/" + candidateId;
        String storagePath = storageService.storeFile(file, subDirectory);

        CandidateDocument document = CandidateDocument.builder()
                .candidate(candidate)
                .application(application)
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .fileSizeBytes(file.getSize())
                .storageType(storageService.getStorageType())
                .storagePath(storagePath)
                .documentCategory(documentCategory != null ? documentCategory : "RESUME")
                .uploadedByUser(user)
                .uploadedAt(Instant.now())
                .build();

        document = documentRepository.save(document);
        return toDTO(document);
    }

    @Transactional(readOnly = true)
    public Resource loadFileAsResource(Long documentId) throws IOException {
        CandidateDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        return storageService.loadFileAsResource(document.getStoragePath());
    }

    @Transactional(readOnly = true)
    public CandidateDocument getDocumentEntity(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
    }

    public DocumentDTO toDTO(CandidateDocument doc) {
        return DocumentDTO.builder()
                .id(doc.getId())
                .candidateId(doc.getCandidate().getId())
                .candidateName(doc.getCandidate().getFirstName() + " " + doc.getCandidate().getLastName())
                .applicationId(doc.getApplication() != null ? doc.getApplication().getId() : null)
                .fileName(doc.getFileName())
                .fileType(doc.getFileType())
                .fileSizeBytes(doc.getFileSizeBytes())
                .storageType(doc.getStorageType())
                .documentCategory(doc.getDocumentCategory())
                .uploadedByUserId(doc.getUploadedByUser() != null ? doc.getUploadedByUser().getId() : null)
                .uploadedByUserName(doc.getUploadedByUser() != null ?
                        doc.getUploadedByUser().getFirstName() + " " + doc.getUploadedByUser().getLastName() : "System")
                .uploadedAt(doc.getUploadedAt())
                .build();
    }
}

