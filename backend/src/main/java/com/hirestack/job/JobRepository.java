package com.hirestack.job;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<JobOpening, Long> {

    @Query("SELECT j FROM JobOpening j WHERE j.company.id = :companyId " +
            "AND (:department IS NULL OR LOWER(j.department) = LOWER(CAST(:department AS string))) " +
            "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', CAST(:location AS string), '%'))) " +
            "AND (:status IS NULL OR j.status = :status) " +
            "AND (:search IS NULL OR (" +
            "     LOWER(j.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "     OR LOWER(j.description) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))))")
    Page<JobOpening> findWithFilters(
            @Param("companyId") Long companyId,
            @Param("department") String department,
            @Param("location") String location,
            @Param("status") JobStatus status,
            @Param("search") String search,
            Pageable pageable);

    List<JobOpening> findByCompanyId(Long companyId);
    List<JobOpening> findByCompanyIdAndStatus(Long companyId, JobStatus status);
    List<JobOpening> findByRecruiterId(Long recruiterId);
    long countByCompanyId(Long companyId);
    long countByCompanyIdAndStatus(Long companyId, JobStatus status);
}

