package com.hirestack.feedback;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, Long> {
    List<InterviewFeedback> findByInterviewId(Long interviewId);
    Optional<InterviewFeedback> findByInterviewIdAndInterviewerId(Long interviewId, Long interviewerId);
    boolean existsByInterviewIdAndInterviewerId(Long interviewId, Long interviewerId);
}

