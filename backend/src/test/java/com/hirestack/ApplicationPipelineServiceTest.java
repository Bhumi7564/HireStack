package com.hirestack;

import com.hirestack.application.*;
import com.hirestack.auth.User;
import com.hirestack.auth.UserRepository;
import com.hirestack.candidate.Candidate;
import com.hirestack.candidate.CandidateRepository;
import com.hirestack.common.BadRequestException;
import com.hirestack.common.InvalidStateTransitionException;
import com.hirestack.company.Company;
import com.hirestack.job.JobOpening;
import com.hirestack.job.JobRepository;
import com.hirestack.job.JobStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ApplicationPipelineServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private ApplicationStatusHistoryRepository historyRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ApplicationService applicationService;

    private Company testCompany;
    private JobOpening testJob;
    private Candidate testCandidate;
    private Application testApplication;

    @BeforeEach
    void setUp() {
        testCompany = Company.builder().id(1L).name("Test Tech").build();
        testJob = JobOpening.builder().id(10L).company(testCompany).title("Software Engineer").status(JobStatus.OPEN).build();
        testCandidate = Candidate.builder().id(20L).company(testCompany).firstName("John").lastName("Doe").email("john@example.com").build();
        testApplication = Application.builder()
                .id(100L)
                .job(testJob)
                .candidate(testCandidate)
                .currentStage(ApplicationStatus.APPLIED)
                .appliedDate(Instant.now())
                .build();
    }

    @Test
    @DisplayName("Valid Transition: APPLIED -> SCREENING succeeds")
    void testValidStateTransitionAppliedToScreening() {
        when(applicationRepository.findById(100L)).thenReturn(Optional.of(testApplication));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));

        UpdateStageRequest request = UpdateStageRequest.builder()
                .targetStage(ApplicationStatus.SCREENING)
                .reason("Passed resume screen")
                .build();

        ApplicationDTO result = applicationService.updateApplicationStage(100L, 1L, request);

        assertEquals(ApplicationStatus.SCREENING, result.getCurrentStage());
        verify(historyRepository, times(1)).save(any(ApplicationStatusHistory.class));
    }

    @Test
    @DisplayName("Invalid Transition: APPLIED -> HIRED throws InvalidStateTransitionException")
    void testInvalidDirectTransitionThrowsException() {
        when(applicationRepository.findById(100L)).thenReturn(Optional.of(testApplication));

        UpdateStageRequest request = UpdateStageRequest.builder()
                .targetStage(ApplicationStatus.HIRED)
                .reason("Skipping stages")
                .build();

        assertThrows(InvalidStateTransitionException.class, () ->
                applicationService.updateApplicationStage(100L, 1L, request)
        );
        verify(historyRepository, never()).save(any());
    }

    @Test
    @DisplayName("Terminal State: Cannot transition out of REJECTED")
    void testCannotTransitionFromTerminalRejectedState() {
        testApplication.setCurrentStage(ApplicationStatus.REJECTED);
        when(applicationRepository.findById(100L)).thenReturn(Optional.of(testApplication));

        UpdateStageRequest request = UpdateStageRequest.builder()
                .targetStage(ApplicationStatus.SCREENING)
                .reason("Re-attempting")
                .build();

        assertThrows(InvalidStateTransitionException.class, () ->
                applicationService.updateApplicationStage(100L, 1L, request)
        );
    }

    @Test
    @DisplayName("Duplicate application for same job and candidate is prevented")
    void testDuplicateApplicationPrevented() {
        when(applicationRepository.existsByJobIdAndCandidateId(10L, 20L)).thenReturn(true);

        CreateApplicationRequest request = CreateApplicationRequest.builder()
                .jobId(10L)
                .candidateId(20L)
                .build();

        assertThrows(BadRequestException.class, () ->
                applicationService.createApplication(1L, request)
        );
        verify(applicationRepository, never()).save(any());
    }
}

