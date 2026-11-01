package com.hirestack.recruiter;

import com.hirestack.auth.User;
import com.hirestack.common.BaseEntity;
import com.hirestack.company.Company;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recruiters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recruiter extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    private String department;

    private String title;

    @Column(name = "max_active_jobs")
    @Builder.Default
    private Integer maxActiveJobs = 10;
}

