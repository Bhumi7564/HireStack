package com.hirestack.communication;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunicationLogRepository extends JpaRepository<CommunicationLog, Long> {
    List<CommunicationLog> findByCandidateIdOrderByLoggedAtDesc(Long candidateId);
    List<CommunicationLog> findByApplicationIdOrderByLoggedAtDesc(Long applicationId);
}

