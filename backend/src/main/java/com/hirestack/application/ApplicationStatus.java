package com.hirestack.application;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

public enum ApplicationStatus {
    APPLIED,
    SCREENING,
    INTERVIEW,
    OFFER,
    HIRED,
    REJECTED;

    public boolean canTransitionTo(ApplicationStatus nextStatus) {
        if (this == nextStatus) {
            return true;
        }

        switch (this) {
            case APPLIED:
                return nextStatus == SCREENING || nextStatus == REJECTED;
            case SCREENING:
                return nextStatus == INTERVIEW || nextStatus == REJECTED;
            case INTERVIEW:
                return nextStatus == OFFER || nextStatus == REJECTED;
            case OFFER:
                return nextStatus == HIRED || nextStatus == REJECTED;
            case HIRED:
            case REJECTED:
                return false; // Terminal states
            default:
                return false;
        }
    }

    public boolean isTerminal() {
        return this == HIRED || this == REJECTED;
    }

    public Set<ApplicationStatus> getAllowedNextStages() {
        switch (this) {
            case APPLIED:
                return EnumSet.of(SCREENING, REJECTED);
            case SCREENING:
                return EnumSet.of(INTERVIEW, REJECTED);
            case INTERVIEW:
                return EnumSet.of(OFFER, REJECTED);
            case OFFER:
                return EnumSet.of(HIRED, REJECTED);
            default:
                return Collections.emptySet();
        }
    }
}

