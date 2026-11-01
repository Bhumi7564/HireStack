package com.hirestack.application;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

        boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);

        Optional<Application> findByJobIdAndCandidateId(Long jobId, Long candidateId);

        List<Application> findByCandidateId(Long candidateId);

        List<Application> findByJobId(Long jobId);

        List<Application> findByCurrentStage(ApplicationStatus stage);

        @Query("SELECT a FROM Application a WHERE a.job.company.id = :companyId " +
                        "AND (:jobId IS NULL OR a.job.id = :jobId) " +
                        "AND (:stage IS NULL OR a.currentStage = :stage) " +
                        "AND (:recruiterId IS NULL OR a.job.recruiter.id = :recruiterId) " +
                        "AND (:search IS NULL OR (" +
                        "     LOWER(a.candidate.firstName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
                        "     OR LOWER(a.candidate.lastName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
                        "     OR LOWER(a.candidate.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
                        "     OR LOWER(a.job.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))))")
        Page<Application> findWithFilters(
                        @Param("companyId") Long companyId,
                        @Param("jobId") Long jobId,
                        @Param("stage") ApplicationStatus stage,
                        @Param("recruiterId") Long recruiterId,
                        @Param("search") String search,
                        Pageable pageable);

        @Query("SELECT a FROM Application a WHERE a.job.company.id = :companyId " +
                        "AND (:jobId IS NULL OR a.job.id = :jobId)")
        List<Application> findAllByCompanyAndJob(
                        @Param("companyId") Long companyId,
                        @Param("jobId") Long jobId);

        @Query("SELECT a FROM Application a WHERE a.job.company.id = :companyId")
        List<Application> findAllByCompanyId(@Param("companyId") Long companyId);

        long countByJobCompanyId(Long companyId);

        long countByJobCompanyIdAndCurrentStage(Long companyId, ApplicationStatus currentStage);

        long countByJobId(Long jobId);

        long countByCandidateId(Long candidateId);
}
