package com.hirestack;

import com.hirestack.analytics.AnalyticsService;
import com.hirestack.analytics.OverviewStatsDTO;
import com.hirestack.application.ApplicationRepository;
import com.hirestack.application.ApplicationStatus;
import com.hirestack.candidate.CandidateRepository;
import com.hirestack.interview.InterviewRepository;
import com.hirestack.interview.InterviewStatus;
import com.hirestack.job.JobRepository;
import com.hirestack.job.JobStatus;
import com.hirestack.recruiter.RecruiterRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AnalyticsServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private RecruiterRepository recruiterRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    @Test
    @DisplayName("Overview metrics are correctly aggregated")
    void testGetOverviewStats() {
        when(jobRepository.countByCompanyId(1L)).thenReturn(5L);
        when(jobRepository.countByCompanyIdAndStatus(1L, JobStatus.OPEN)).thenReturn(4L);
        when(candidateRepository.countByCompanyId(1L)).thenReturn(12L);
        when(applicationRepository.countByJobCompanyId(1L)).thenReturn(18L);
        when(interviewRepository.countByApplicationJobCompanyIdAndStatus(1L, InterviewStatus.SCHEDULED)).thenReturn(3L);
        when(applicationRepository.countByJobCompanyIdAndCurrentStage(1L, ApplicationStatus.HIRED)).thenReturn(2L);
        when(applicationRepository.findAllByCompanyId(1L)).thenReturn(Collections.emptyList());

        OverviewStatsDTO stats = analyticsService.getOverviewStats(1L);

        assertNotNull(stats);
        assertEquals(5L, stats.getTotalJobs());
        assertEquals(4L, stats.getActiveJobs());
        assertEquals(12L, stats.getTotalCandidates());
        assertEquals(18L, stats.getTotalApplications());
        assertEquals(3L, stats.getActiveInterviews());
        assertEquals(2L, stats.getHiredCount());
    }
}

