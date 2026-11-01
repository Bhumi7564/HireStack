package com.hirestack.interview;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewPanelMemberRepository extends JpaRepository<InterviewPanelMember, Long> {
    List<InterviewPanelMember> findByInterviewId(Long interviewId);
    void deleteByInterviewIdAndUserId(Long interviewId, Long userId);
}

