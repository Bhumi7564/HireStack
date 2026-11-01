package com.hirestack.interview;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PanelMemberDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String role;
}

