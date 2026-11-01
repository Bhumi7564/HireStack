package com.hirestack.communication;

import com.hirestack.common.ApiResponse;
import com.hirestack.security.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/communication")
@RequiredArgsConstructor
@Tag(name = "Communication & Reminders", description = "Endpoints for candidate contact logs, activity timelines, and follow-up reminders")
public class CommunicationController {

    private final CommunicationService communicationService;

    @GetMapping("/candidate/{candidateId}")
    @Operation(summary = "Get communication log entries for a candidate")
    public ResponseEntity<ApiResponse<List<CommunicationDTO>>> getCandidateLogs(
            @PathVariable Long candidateId) {
        return ResponseEntity.ok(ApiResponse.ok(communicationService.getLogsByCandidate(candidateId)));
    }

    @GetMapping("/application/{applicationId}")
    @Operation(summary = "Get communication log entries for an application")
    public ResponseEntity<ApiResponse<List<CommunicationDTO>>> getApplicationLogs(
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(ApiResponse.ok(communicationService.getLogsByApplication(applicationId)));
    }

    @PostMapping("/logs")
    @Operation(summary = "Log a communication (call, email, note, offer letter)")
    public ResponseEntity<ApiResponse<CommunicationDTO>> logCommunication(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody CreateCommunicationRequest request) {
        CommunicationDTO created = communicationService.logCommunication(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Communication logged successfully", created), HttpStatus.CREATED);
    }

    @GetMapping("/reminders")
    @Operation(summary = "Get reminders for the current user")
    public ResponseEntity<ApiResponse<List<ReminderDTO>>> getReminders(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(communicationService.getUserReminders(principal.getId())));
    }

    @PostMapping("/reminders")
    @Operation(summary = "Create a reminder")
    public ResponseEntity<ApiResponse<ReminderDTO>> createReminder(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody CreateReminderRequest request) {
        ReminderDTO created = communicationService.createReminder(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Reminder created", created), HttpStatus.CREATED);
    }

    @PatchMapping("/reminders/{id}/toggle")
    @Operation(summary = "Toggle reminder completed status")
    public ResponseEntity<ApiResponse<ReminderDTO>> toggleReminder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Reminder updated", communicationService.toggleReminderStatus(id)));
    }
}

