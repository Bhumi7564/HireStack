package com.hirestack.communication;

import com.hirestack.application.Application;
import com.hirestack.application.ApplicationRepository;
import com.hirestack.auth.User;
import com.hirestack.auth.UserRepository;
import com.hirestack.candidate.Candidate;
import com.hirestack.candidate.CandidateRepository;
import com.hirestack.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunicationService {

    private final CommunicationLogRepository communicationRepository;
    private final ReminderRepository reminderRepository;
    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CommunicationDTO> getLogsByCandidate(Long candidateId) {
        return communicationRepository.findByCandidateIdOrderByLoggedAtDesc(candidateId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CommunicationDTO> getLogsByApplication(Long applicationId) {
        return communicationRepository.findByApplicationIdOrderByLoggedAtDesc(applicationId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommunicationDTO logCommunication(Long userId, CreateCommunicationRequest request) {
        Candidate candidate = candidateRepository.findById(request.getCandidateId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", request.getCandidateId()));

        Application application = null;
        if (request.getApplicationId() != null) {
            application = applicationRepository.findById(request.getApplicationId()).orElse(null);
        }

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        CommunicationLog log = CommunicationLog.builder()
                .candidate(candidate)
                .application(application)
                .user(user)
                .type(request.getType())
                .subject(request.getSubject())
                .content(request.getContent())
                .loggedAt(Instant.now())
                .build();

        log = communicationRepository.save(log);
        return toDTO(log);
    }

    @Transactional(readOnly = true)
    public List<ReminderDTO> getUserReminders(Long userId) {
        return reminderRepository.findByUserIdOrderByRemindAtAsc(userId).stream()
                .map(this::toReminderDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReminderDTO createReminder(Long userId, CreateReminderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Application application = null;
        if (request.getApplicationId() != null) {
            application = applicationRepository.findById(request.getApplicationId()).orElse(null);
        }

        Reminder reminder = Reminder.builder()
                .user(user)
                .application(application)
                .title(request.getTitle())
                .description(request.getDescription())
                .remindAt(request.getRemindAt())
                .completed(false)
                .createdAt(Instant.now())
                .build();

        reminder = reminderRepository.save(reminder);
        return toReminderDTO(reminder);
    }

    @Transactional
    public ReminderDTO toggleReminderStatus(Long id) {
        Reminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder", "id", id));

        reminder.setCompleted(!reminder.isCompleted());
        reminder = reminderRepository.save(reminder);
        return toReminderDTO(reminder);
    }

    public CommunicationDTO toDTO(CommunicationLog log) {
        return CommunicationDTO.builder()
                .id(log.getId())
                .candidateId(log.getCandidate().getId())
                .candidateName(log.getCandidate().getFirstName() + " " + log.getCandidate().getLastName())
                .applicationId(log.getApplication() != null ? log.getApplication().getId() : null)
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .userName(log.getUser() != null ? log.getUser().getFirstName() + " " + log.getUser().getLastName() : "System")
                .type(log.getType())
                .subject(log.getSubject())
                .content(log.getContent())
                .loggedAt(log.getLoggedAt())
                .build();
    }

    public ReminderDTO toReminderDTO(Reminder reminder) {
        String candidateName = null;
        String jobTitle = null;
        Long applicationId = null;

        if (reminder.getApplication() != null) {
            applicationId = reminder.getApplication().getId();
            candidateName = reminder.getApplication().getCandidate().getFirstName() + " " +
                    reminder.getApplication().getCandidate().getLastName();
            jobTitle = reminder.getApplication().getJob().getTitle();
        }

        return ReminderDTO.builder()
                .id(reminder.getId())
                .userId(reminder.getUser().getId())
                .applicationId(applicationId)
                .candidateName(candidateName)
                .jobTitle(jobTitle)
                .title(reminder.getTitle())
                .description(reminder.getDescription())
                .remindAt(reminder.getRemindAt())
                .completed(reminder.isCompleted())
                .createdAt(reminder.getCreatedAt())
                .build();
    }
}

