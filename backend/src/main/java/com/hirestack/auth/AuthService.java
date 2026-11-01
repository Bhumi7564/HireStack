package com.hirestack.auth;

import com.hirestack.common.BadRequestException;
import com.hirestack.common.ResourceNotFoundException;
import com.hirestack.company.Company;
import com.hirestack.company.CompanyRepository;
import com.hirestack.security.CustomUserPrincipal;
import com.hirestack.security.JwtTokenProvider;
import com.hirestack.security.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Value("${app.oauth.google.client-id:}")
    private String googleClientId;

    private final RestTemplate restTemplate = new RestTemplate();

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .id(user.getId())
                .companyId(user.getCompany() != null ? user.getCompany().getId() : null)
                .companyName(user.getCompany() != null ? user.getCompany().getName() : null)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        Long targetCompanyId = request.getCompanyId() != null ? request.getCompanyId() : 1L;
        Company company = companyRepository.findById(targetCompanyId)
                .orElseGet(() -> companyRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Company", "id", targetCompanyId)));

        // Safe default role: public registration always receives ROLE_INTERVIEWER
        UserRole assignedRole = UserRole.ROLE_INTERVIEWER;

        User user = User.builder()
                .company(company)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .phone(request.getPhone())
                .active(true)
                .build();

        user = userRepository.save(user);

        String jwt = tokenProvider.generateTokenForUser(user);

        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .id(user.getId())
                .companyId(company.getId())
                .companyName(company.getName())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        String token = request.getIdToken();
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Google ID token is required.");
        }

        Map<String, Object> tokenInfo;
        try {
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + token;
            tokenInfo = restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            throw new BadRequestException("Google token verification failed: Invalid or expired identity token.");
        }

        if (tokenInfo == null || tokenInfo.get("email") == null) {
            throw new BadRequestException("Google token verification failed: No verified email found in token.");
        }

        String email = ((String) tokenInfo.get("email")).toLowerCase().trim();
        String emailVerified = String.valueOf(tokenInfo.get("email_verified"));
        if (!"true".equalsIgnoreCase(emailVerified)) {
            throw new BadRequestException("Google email is not verified.");
        }

        if (googleClientId != null && !googleClientId.isBlank()
                && !googleClientId.contains("placeholder") && !googleClientId.contains("your-google")) {
            String aud = (String) tokenInfo.get("aud");
            if (!googleClientId.equals(aud)) {
                throw new BadRequestException("Google token client ID mismatch.");
            }
        }

        String firstName = (String) tokenInfo.get("given_name");
        String lastName = (String) tokenInfo.get("family_name");
        if (firstName == null || firstName.isBlank())
            firstName = "Google";
        if (lastName == null || lastName.isBlank())
            lastName = "User";

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            // New user registration via Google with safe default role (ROLE_INTERVIEWER)
            Company defaultCompany = companyRepository.findAll().stream().findFirst()
                    .orElseGet(() -> companyRepository.save(Company.builder()
                            .name("HireStack Global")
                            .build()));

            user = User.builder()
                    .company(defaultCompany)
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(UserRole.ROLE_INTERVIEWER)
                    .active(true)
                    .build();
            user = userRepository.save(user);
        } else {
            if (!user.isActive()) {
                throw new BadRequestException("Account is deactivated. Please contact your system administrator.");
            }
        }

        String jwt = tokenProvider.generateTokenForUser(user);

        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .id(user.getId())
                .companyId(user.getCompany() != null ? user.getCompany().getId() : null)
                .companyName(user.getCompany() != null ? user.getCompany().getName() : null)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();
    }

    @Transactional(readOnly = true)
    public UserSummaryResponse getCurrentUser(CustomUserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        return UserSummaryResponse.builder()
                .id(user.getId())
                .companyId(user.getCompany() != null ? user.getCompany().getId() : null)
                .companyName(user.getCompany() != null ? user.getCompany().getName() : null)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .phone(user.getPhone())
                .active(user.isActive())
                .build();
    }
}
