package com.hirestack.analytics;

import com.hirestack.common.ApiResponse;
import com.hirestack.security.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Recruitment Intelligence & Analytics", description = "Endpoints for funnel conversion, KPIs, time-to-hire, and recruiter metrics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    @Operation(summary = "Get high-level recruitment KPI overview")
    public ResponseEntity<ApiResponse<OverviewStatsDTO>> getOverview(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getOverviewStats(principal.getCompanyId())));
    }

    @GetMapping("/pipeline")
    @Operation(summary = "Get recruitment pipeline funnel distribution")
    public ResponseEntity<ApiResponse<List<PipelineStatsDTO>>> getPipelineFunnel(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getPipelineFunnel(principal.getCompanyId())));
    }

    @GetMapping("/recruiters")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'RECRUITER')")
    @Operation(summary = "Get recruiter performance and workload analytics")
    public ResponseEntity<ApiResponse<List<RecruiterStatsDTO>>> getRecruiterStats(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getRecruiterStats(principal.getCompanyId())));
    }

    @GetMapping("/time-to-hire")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'RECRUITER')")
    @Operation(summary = "Get average days taken to fill positions by job opening")
    public ResponseEntity<ApiResponse<List<TimeToHireDTO>>> getTimeToHire(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getTimeToHireStats(principal.getCompanyId())));
    }

    @GetMapping("/source-effectiveness")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'RECRUITER')")
    @Operation(summary = "Get applicant source effectiveness and conversion rates")
    public ResponseEntity<ApiResponse<List<SourceStatsDTO>>> getSourceEffectiveness(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getSourceEffectiveness(principal.getCompanyId())));
    }
}

