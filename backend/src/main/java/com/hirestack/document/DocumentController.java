package com.hirestack.document;

import com.hirestack.common.ApiResponse;
import com.hirestack.security.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Tag(name = "Document Management", description = "Endpoints for uploading, securing, and downloading resumes and candidate documents")
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping("/candidate/{candidateId}")
    @Operation(summary = "Get all documents for a candidate")
    public ResponseEntity<ApiResponse<List<DocumentDTO>>> getCandidateDocuments(@PathVariable Long candidateId) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.getDocumentsByCandidate(candidateId)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload candidate document (Resume, Portfolio, Certificate)")
    public ResponseEntity<ApiResponse<DocumentDTO>> uploadDocument(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam("file") MultipartFile file,
            @RequestParam("candidateId") Long candidateId,
            @RequestParam(value = "applicationId", required = false) Long applicationId,
            @RequestParam(value = "documentCategory", defaultValue = "RESUME") String documentCategory) throws IOException {

        DocumentDTO created = documentService.uploadDocument(
                principal != null ? principal.getId() : null,
                candidateId,
                applicationId,
                documentCategory,
                file);

        return new ResponseEntity<>(ApiResponse.ok("Document uploaded successfully", created), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download a secured document file")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) throws IOException {
        CandidateDocument doc = documentService.getDocumentEntity(id);
        Resource resource = documentService.loadFileAsResource(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                .body(resource);
    }
}

