package com.hirestack.document;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateDocumentRepository extends JpaRepository<CandidateDocument, Long> {
    List<CandidateDocument> findByCandidateIdOrderByUploadedAtDesc(Long candidateId);
    List<CandidateDocument> findByApplicationIdOrderByUploadedAtDesc(Long applicationId);
}

