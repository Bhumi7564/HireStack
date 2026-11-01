package com.hirestack.feedback;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationScoreRepository extends JpaRepository<EvaluationScore, Long> {
    List<EvaluationScore> findByFeedbackId(Long feedbackId);
}

