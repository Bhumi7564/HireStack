package com.hirestack.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
@Builder
@AllArgsConstructor
public class CustomUserPrincipal implements UserDetails {

    private final Long id;
    private final Long companyId;
    private final String email;
    private final String password;
    private final String firstName;
    private final String lastName;
    private final UserRole role;
    private final boolean active;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }

    public static CustomUserPrincipal create(com.hirestack.auth.User user) {
        return CustomUserPrincipal.builder()
                .id(user.getId())
                .companyId(user.getCompany() != null ? user.getCompany().getId() : null)
                .email(user.getEmail())
                .password(user.getPasswordHash())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .active(user.isActive())
                .build();
    }
}
