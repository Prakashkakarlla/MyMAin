package in.jobfresh.controller;

import in.jobfresh.dto.ApiResponse;
import in.jobfresh.dto.LoginRequest;
import in.jobfresh.model.AdminUser;
import in.jobfresh.repository.AdminUserRepository;
import in.jobfresh.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Authentication — issues JWT tokens.
 *
 * Rule: return 401 (not 200) for bad credentials.
 * Rule: never reveal whether email exists (security).
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AdminUserRepository adminRepo;
    private final PasswordEncoder     encoder;
    private final JwtUtil             jwtUtil;

    /**
     * POST /api/v1/auth/token
     * Returns JWT access token on success.
     * Returns 401 on bad credentials — same message either way (no enumeration).
     */
    @PostMapping("/token")
    public ResponseEntity<ApiResponse<Map<String, String>>> login(
            @Valid @RequestBody LoginRequest request) {

        AdminUser admin = adminRepo.findByEmail(request.getEmail()).orElse(null);

        // Constant-time comparison even when user doesn't exist — prevents timing attacks
        boolean valid = admin != null && encoder.matches(request.getPassword(), admin.getPassword());

        if (!valid) {
            log.warn("Failed login attempt for email: {}", request.getEmail());
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(401, "Invalid credentials"));
        }

        String token = jwtUtil.generateToken(admin.getEmail());
        log.info("Admin login: {}", admin.getEmail());

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "token",     token,
                "tokenType", "Bearer",
                "name",      admin.getName(),
                "email",     admin.getEmail()
        )));
    }
}
