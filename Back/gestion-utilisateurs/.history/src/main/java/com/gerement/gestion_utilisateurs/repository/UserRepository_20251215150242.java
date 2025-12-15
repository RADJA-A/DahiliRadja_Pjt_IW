package com.gerement.gestion_utilisateurs.repository;

import com.gerement.gestion_utilisateurs.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional ;

@Repository
public interface UserRepository extends JpaRepository<User, Long>  {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);

      List<User> findByIdIn(List<Long> ids);
}
