package com.hirestack.communication;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUserIdOrderByRemindAtAsc(Long userId);
    List<Reminder> findByUserIdAndCompletedFalseOrderByRemindAtAsc(Long userId);
}

