package com.hirestack.candidate;

import com.hirestack.common.BaseEntity;
import com.hirestack.company.Company;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "candidates", uniqueConstraints = {
        @UniqueConstraint(name = "uq_company_candidate_email", columnNames = {"company_id", "email"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidate extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;

    private String phone;

    @Column(name = "current_company")
    private String currentCompany;

    @Column(name = "current_title")
    private String currentTitle;

    @Column(name = "experience_years")
    @Builder.Default
    private BigDecimal experienceYears = BigDecimal.ZERO;

    private String location;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(nullable = false)
    @Builder.Default
    private String source = "CAREER_PORTAL";

    @Column(columnDefinition = "TEXT")
    private String notes;
}

