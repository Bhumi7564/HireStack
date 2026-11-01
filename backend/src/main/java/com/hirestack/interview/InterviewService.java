package com.hirestack.interview;

import com.hirestack.application.Application;
import com.hirestack.application.ApplicationRepository;
import com.hirestack.auth.User;
import com.hirestack.auth.UserRepository;
import com.hirestack.common.BadRequestException;
import com.hirestack.common.PagedResponse;
import com.hirestack.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final InterviewPanelMemberRepository panelMemberRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PagedResponse<InterviewDTO> getInterviewsWithFilters(
            Long companyId,
            InterviewStatus status,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        Sort sort = sortDirection.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Interview> interviewPage = interviewRepository.findWithFilters(companyId, status, search, pageable);

        List<InterviewDTO> content = interviewPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PagedResponse.<InterviewDTO>builder()
                .content(content)
                .page(interviewPage.getNumber())
                .size(interviewPage.getSize())
                .totalElements(interviewPage.getTotalElements())
                .totalPages(interviewPage.getTotalPages())
                .last(interviewPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<InterviewDTO> getInterviewsByApplication(Long applicationId) {
        return interviewRepository.findByApplicationId(applicationId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewDTO> getAssignedInterviewsForUser(Long userId) {
        return interviewRepository.findByPanelUserId(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InterviewDTO getInterviewById(Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", id));
        return toDTO(interview);
    }

    @Transactional
    public InterviewDTO scheduleInterview(Long currentUserId, ScheduleInterviewRequest request) {
        if (!request.getScheduledEndTime().isAfter(request.getScheduledStartTime())) {
            throw new BadRequestException("Interview scheduled end time must be after start time");
        }

        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", request.getApplicationId()));

        User currentUser = userRepository.findById(currentUserId).orElse(null);

        // Check for schedule conflicts among assigned panel members
        for (Long panelUserId : request.getInterviewerUserIds()) {
            long conflicts = interviewRepository.countInterviewerConflicts(
                    panelUserId, request.getScheduledStartTime(), request.getScheduledEndTime());
            if (conflicts > 0) {
                User interviewer = userRepository.findById(panelUserId).orElse(null);
                String name = (interviewer != null) ? interviewer.getFirstName() + " " + interviewer.getLastName() : "ID " + panelUserId;
                throw new BadRequestException("Interviewer " + name + " has a scheduling conflict during the selected time slot.");
            }
        }

        Interview interview = Interview.builder()
                .application(application)
                .title(request.getTitle())
                .interviewType(request.getInterviewType())
                .interviewRound(request.getInterviewRound())
                .status(InterviewStatus.SCHEDULED)
                .scheduledStartTime(request.getScheduledStartTime())
                .scheduledEndTime(request.getScheduledEndTime())
                .meetingLink(request.getMeetingLink())
                .location(request.getLocation())
                .notes(request.getNotes())
                .createdByUser(currentUser)
                .panelMembers(new ArrayList<>())
                .build();

        interview = interviewRepository.save(interview);

        // Assign panel members
        for (Long panelUserId : request.getInterviewerUserIds()) {
            User interviewer = userRepository.findById(panelUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", panelUserId));

            InterviewPanelMember member = InterviewPanelMember.builder()
                    .interview(interview)
                    .user(interviewer)
                    .role("INTERVIEWER")
                    .build();

            interview.getPanelMembers().add(member);
        }

        interview = interviewRepository.save(interview);
        return toDTO(interview);
    }

    @Transactional
    public InterviewDTO updateInterviewStatus(Long id, InterviewStatus status) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", id));

        interview.setStatus(status);
        interview = interviewRepository.save(interview);
        return toDTO(interview);
    }

    public InterviewDTO toDTO(Interview interview) {
        List<PanelMemberDTO> panelDTOs = interview.getPanelMembers().stream()
                .map(pm -> PanelMemberDTO.builder()
                        .id(pm.getId())
                        .userId(pm.getUser().getId())
                        .userName(pm.getUser().getFirstName() + " " + pm.getUser().getLastName())
                        .userEmail(pm.getUser().getEmail())
                        .role(pm.getRole())
                        .build())
                .collect(Collectors.toList());

        Application app = interview.getApplication();

        return InterviewDTO.builder()
                .id(interview.getId())
                .applicationId(app.getId())
                .candidateId(app.getCandidate().getId())
                .candidateName(app.getCandidate().getFirstName() + " " + app.getCandidate().getLastName())
                .candidateEmail(app.getCandidate().getEmail())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .title(interview.getTitle())
                .interviewType(interview.getInterviewType())
                .interviewRound(interview.getInterviewRound())
                .status(interview.getStatus())
                .scheduledStartTime(interview.getScheduledStartTime())
                .scheduledEndTime(interview.getScheduledEndTime())
                .meetingLink(interview.getMeetingLink())
                .location(interview.getLocation())
                .notes(interview.getNotes())
                .panelMembers(panelDTOs)
                .createdAt(interview.getCreatedAt())
                .build();
    }
}

