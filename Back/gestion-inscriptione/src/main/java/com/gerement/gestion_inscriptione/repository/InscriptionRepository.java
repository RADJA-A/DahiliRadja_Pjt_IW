package com.gerement.gestion_inscriptione.repository;
import com.gerement.gestion_inscriptione.model.Inscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InscriptionRepository extends JpaRepository<Inscription, Long> {
    List<Inscription> findByUserId(Long userId);
    List<Inscription> findByEvenementId(Long evenementId);
    Optional<Inscription> findByUserIdAndEvenementId(Long userId, Long evenementId);
    boolean existsByUserIdAndEvenementId(Long userId, Long evenementId);
}