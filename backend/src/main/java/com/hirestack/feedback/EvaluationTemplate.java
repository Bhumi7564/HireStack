package com.hirestack.feedback;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.hirestack.common.BaseEntity;
import com.hirestack.company.Company;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "evaluation_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationTemplate extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false)
    private String title;

    private String department;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "criteria_json", columnDefinition = "jsonb")
    private String criteriaJson;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
