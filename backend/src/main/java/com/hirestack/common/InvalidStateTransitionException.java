package com.hirestack.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class InvalidStateTransitionException extends RuntimeException {
    public InvalidStateTransitionException(String currentStage, String targetStage, String reason) {
        super(String.format("Invalid pipeline transition from '%s' to '%s': %s", currentStage, targetStage, reason));
    }

    public InvalidStateTransitionException(String message) {
        super(message);
    }
}

