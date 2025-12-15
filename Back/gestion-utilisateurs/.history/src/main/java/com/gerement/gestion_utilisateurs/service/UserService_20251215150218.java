package com.gerement.gestion_utilisateurs.service;

import com.gerement.gestion_utilisateurs.dto.UserDTO;
import com.gerement.gestion_utilisateurs.model.User;
import com.gerement.gestion_utilisateurs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return convertToDTO(user);
    }
    
    public List<UserDTO> getUsersByIds(List<Long> ids) {
        List<User> users = userRepository.findByIdIn(ids);
        return users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return convertToDTO(user);
    }
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setActive(user.isActive());
        return dto;
    }
}