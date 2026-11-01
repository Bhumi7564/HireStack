package com.hirestack.candidate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {

        Optional<Candidate> findByCompanyIdAndEmail(Long companyId, String email);

        boolean existsByCompanyIdAndEmail(Long companyId, String email);

        @Query("SELECT c FROM Candidate c WHERE c.company.id = :companyId " +
                        "AND (:source IS NULL OR LOWER(c.source) = LOWER(CAST(:source AS string))) " +
                        "AND (:search IS NULL OR (" +
                        "     LOWER(c.firstName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
                        "     OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
                        "     OR LOWER(c.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
                        "     OR LOWER(c.skills) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
                        "     OR LOWER(c.currentCompany) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))))")
        Page<Candidate> findWithFilters(
                        @Param("companyId") Long companyId,
                        @Param("source") String source,
                        @Param("search") String search,
                        Pageable pageable);

        long countByCompanyId(Long companyId);
}
