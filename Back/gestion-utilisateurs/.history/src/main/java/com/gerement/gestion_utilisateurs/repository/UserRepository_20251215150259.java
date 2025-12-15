package com.gerement.gestion_utilisateurs.repository;

import com.gerement.gestion_utilisateurs.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    // Ajoutez cette méthode pour la recherche par IDs
    List<User> findByIdIn(List<Long> ids);
}