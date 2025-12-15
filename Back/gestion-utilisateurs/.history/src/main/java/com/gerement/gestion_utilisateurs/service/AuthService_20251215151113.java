@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        
        return new AuthResponse(
                token,
                user.getEmail(),
                user.getNom(),
                user.getPrenom(),
                user.getRole().name(), // Retourner le nom du rôle
                user.getId()
        );
    }

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Utilisez l'enum directement
        try {
            user.setRole(Role.valueOf(request.getRole().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + request.getRole());
        }
        
        user.setActive(true);
        
        User savedUser = userRepository.save(user);
        
        String token = jwtService.generateToken(savedUser.getEmail(), savedUser.getRole().name());
        
        return new AuthResponse(
                token,
                savedUser.getEmail(),
                savedUser.getNom(),
                savedUser.getPrenom(),
                savedUser.getRole().name(),
                savedUser.getId()
        );
    }
}