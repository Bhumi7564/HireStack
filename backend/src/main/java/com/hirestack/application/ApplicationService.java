package com.hirestack.application;

import com.hirestack.auth.User;
import com.hirestack.auth.UserRepository;
import com.hirestack.candidate.Candidate;
import com.hirestack.candidate.CandidateRepository;
import com.hirestack.common.BadRequestException;
import com.hirestack.common.InvalidStateTransitionException;
import com.hirestack.common.PagedResponse;
import com.hirestack.common.ResourceNotFoundException;
import com.hirestack.job.JobOpening;
import com.hirestack.job.JobRepository;
import com.hirestack.job.JobStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final JobRepository jobRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PagedResponse<ApplicationDTO> getApplicationsWithFilters(
            Long companyId,
            Long jobId,
            ApplicationStatus stage,
            Long recruiterId,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        Sort sort = sortDirection.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Application> appPage = applicationRepository.findWithFilters(companyId, jobId, stage, recruiterId, search, pageable);

        List<ApplicationDTO> content = appPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PagedResponse.<ApplicationDTO>builder()
                .content(content)
                .page(appPage.getNumber())
                .size(appPage.getSize())
                .totalElements(appPage.getTotalElements())
                .totalPages(appPage.getTotalPages())
                .last(appPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ApplicationDTO> getAllApplicationsForBoard(Long companyId, Long jobId) {
        return applicationRepository.findAllByCompanyAndJob(companyId, jobId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApplicationDTO getApplicationById(Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));
        return toDTO(application);
    }

    @Transactional
    public ApplicationDTO createApplication(Long userId, CreateApplicationRequest request) {
        if (applicationRepository.existsByJobIdAndCandidateId(request.getJobId(), request.getCandidateId())) {
            throw new BadRequestException("Candidate has already submitted an application for this job opening.");
        }

        JobOpening job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("JobOpening", "id", request.getJobId()));

        if (job.getStatus() == JobStatus.CLOSED) {
            throw new BadRequestException("Cannot apply to a closed job opening.");
        }

        Candidate candidate = candidateRepository.findById(request.getCandidateId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", request.getCandidateId()));

        Application application = Application.builder()
                .job(job)
                .candidate(candidate)
                .currentStage(ApplicationStatus.APPLIED)
                .appliedDate(Instant.now())
                .coverLetter(request.getCoverLetter())
                .rating(request.getRating() != null ? request.getRating() : 3)
                .build();

        application = applicationRepository.save(application);

        // Record initial status in history
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        ApplicationStatusHistory initialHistory = ApplicationStatusHistory.builder()
                .application(application)
                .fromStage(null)
                .toStage(ApplicationStatus.APPLIED)
                .changedByUser(user)
                .changeReason("Application created and registered in pipeline")
                .changedAt(Instant.now())
                .build();

        historyRepository.save(initialHistory);

        return toDTO(application);
    }

    @Transactional
    public ApplicationDTO updateApplicationStage(Long applicationId, Long userId, UpdateStageRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        ApplicationStatus currentStage = application.getCurrentStage();
        ApplicationStatus targetStage = request.getTargetStage();

        if (currentStage == targetStage) {
            return toDTO(application);
        }

        // Validate state transition
        if (!currentStage.canTransitionTo(targetStage)) {
            throw new InvalidStateTransitionException(
                    currentStage.name(),
                    targetStage.name(),
                    "Allowed next stages from " + currentStage + " are: " + currentStage.getAllowedNextStages()
            );
        }

        // Perform stage transition
        application.setCurrentStage(targetStage);

        if (targetStage == ApplicationStatus.HIRED) {
            application.setHiredDate(Instant.now());
        } else if (targetStage == ApplicationStatus.REJECTED) {
            application.setRejectionReason(request.getReason() != null ? request.getReason() : "Did not meet criteria for next round");
        }

        application = applicationRepository.save(application);

        // Record transition history
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        ApplicationStatusHistory historyEntry = ApplicationStatusHistory.builder()
                .application(application)
                .fromStage(currentStage)
                .toStage(targetStage)
                .changedByUser(user)
                .changeReason(request.getReason() != null ? request.getReason() : "Moved stage to " + targetStage)
                .changedAt(Instant.now())
                .build();

        historyRepository.save(historyEntry);

        return toDTO(application);
    }

    @Transactional(readOnly = true)
    public List<ApplicationHistoryDTO> getApplicationHistory(Long applicationId) {
        if (!applicationRepository.existsById(applicationId)) {
            throw new ResourceNotFoundException("Application", "id", applicationId);
        }

        return historyRepository.findByApplicationIdOrderByChangedAtAsc(applicationId).stream()
                .map(h -> ApplicationHistoryDTO.builder()
                        .id(h.getId())
                        .applicationId(h.getApplication().getId())
                        .fromStage(h.getFromStage())
                        .toStage(h.getToStage())
                        .changedByUserId(h.getChangedByUser() != null ? h.getChangedByUser().getId() : null)
                        .changedByUserName(h.getChangedByUser() != null ?
                                h.getChangedByUser().getFirstName() + " " + h.getChangedByUser().getLastName() : "System")
                        .changeReason(h.getChangeReason())
                        .changedAt(h.getChangedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public ApplicationDTO toDTO(Application application) {
        JobOpening job = application.getJob();
        Candidate candidate = application.getCandidate();

        String recruiterName = null;
        Long recruiterId = null;
        if (job.getRecruiter() != null && job.getRecruiter().getUser() != null) {
            recruiterId = job.getRecruiter().getId();
            recruiterName = job.getRecruiter().getUser().getFirstName() + " " + job.getRecruiter().getUser().getLastName();
        }

        return ApplicationDTO.builder()
                .id(application.getId())
                .jobId(job.getId())
                .jobTitle(job.getTitle())
                .department(job.getDepartment())
                .location(job.getLocation())
                .candidateId(candidate.getId())
                .candidateName(candidate.getFirstName() + " " + candidate.getLastName())
                .candidateEmail(candidate.getEmail())
                .candidatePhone(candidate.getPhone())
                .candidateSkills(candidate.getSkills())
                .candidateExperienceYears(candidate.getExperienceYears())
                .candidateCurrentCompany(candidate.getCurrentCompany())
                .candidateCurrentTitle(candidate.getCurrentTitle())
                .candidateLocation(candidate.getLocation())
                .candidateLinkedinUrl(candidate.getLinkedinUrl())
                .candidateNotes(candidate.getNotes())
                .currentStage(application.getCurrentStage())
                .appliedDate(application.getAppliedDate())
                .coverLetter(application.getCoverLetter())
                .rating(application.getRating())
                .rejectionReason(application.getRejectionReason())
                .hiredDate(application.getHiredDate())
                .recruiterId(recruiterId)
                .recruiterName(recruiterName)
                .createdAt(application.getCreatedAt())
                .build();
    }
}

