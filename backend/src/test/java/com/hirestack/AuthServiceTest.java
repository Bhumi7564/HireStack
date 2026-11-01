package com.hirestack;

import com.hirestack.auth.*;
import com.hirestack.common.BadRequestException;
import com.hirestack.company.Company;
import com.hirestack.company.CompanyRepository;
import com.hirestack.security.CustomUserPrincipal;
import com.hirestack.security.JwtTokenProvider;
import com.hirestack.security.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private Company company;
    private User user;

    @BeforeEach
    void setUp() {
        company = Company.builder().id(1L).name("Acme Corp").build();
        user = User.builder()
                .id(10L)
                .company(company)
                .email("recruiter@acme.com")
                .passwordHash("hashedPass")
                .firstName("Sarah")
                .lastName("Connor")
                .role(UserRole.ROLE_RECRUITER)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Login returns valid JWT token and user details")
    void testSuccessfulLogin() {
        LoginRequest request = LoginRequest.builder().email("recruiter@acme.com").password("secret").build();

        CustomUserPrincipal principal = CustomUserPrincipal.builder()
                .id(10L)
                .email("recruiter@acme.com")
                .role(UserRole.ROLE_RECRUITER)
                .active(true)
                .build();

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(principal);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mocked.jwt.token");
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getAccessToken());
        assertEquals("recruiter@acme.com", response.getEmail());
        assertEquals(UserRole.ROLE_RECRUITER, response.getRole());
    }

    @Test
    @DisplayName("Registration prevents duplicate email")
    void testRegistrationFailsForExistingEmail() {
        when(userRepository.existsByEmail("recruiter@acme.com")).thenReturn(true);

        RegisterRequest request = RegisterRequest.builder()
                .companyId(1L)
                .email("recruiter@acme.com")
                .password("password123")
                .firstName("Sarah")
                .lastName("Connor")
                .role(UserRole.ROLE_RECRUITER)
                .build();

        assertThrows(BadRequestException.class, () -> authService.register(request));
    }
}

