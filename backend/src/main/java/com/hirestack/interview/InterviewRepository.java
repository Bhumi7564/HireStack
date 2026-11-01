package com.hirestack.interview;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

        List<Interview> findByApplicationId(Long applicationId);

        @Query("SELECT i FROM Interview i WHERE i.application.job.company.id = :companyId " +
                        "AND (:status IS NULL OR i.status = :status) " +
                        "AND (:search IS NULL OR (" +
                        "     LOWER(i.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
                        "     OR LOWER(i.application.candidate.firstName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
                        "     OR LOWER(i.application.candidate.lastName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))))")
        Page<Interview> findWithFilters(
                        @Param("companyId") Long companyId,
                        @Param("status") InterviewStatus status,
                        @Param("search") String search,
                        Pageable pageable);

        @Query("SELECT i FROM Interview i JOIN i.panelMembers pm WHERE pm.user.id = :userId")
        List<Interview> findByPanelUserId(@Param("userId") Long userId);

        @Query("SELECT COUNT(i) FROM Interview i JOIN i.panelMembers pm " +
                        "WHERE pm.user.id = :userId " +
                        "AND i.status = 'SCHEDULED' " +
                        "AND ((i.scheduledStartTime < :endTime AND i.scheduledEndTime > :startTime))")
        long countInterviewerConflicts(
                        @Param("userId") Long userId,
                        @Param("startTime") Instant startTime,
                        @Param("endTime") Instant endTime);

        long countByApplicationJobCompanyIdAndStatus(Long companyId, InterviewStatus status);
}
