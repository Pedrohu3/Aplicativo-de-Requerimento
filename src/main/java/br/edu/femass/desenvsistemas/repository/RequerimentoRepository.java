package br.edu.femass.desenvsistemas.repository;

import br.edu.femass.desenvsistemas.entity.Requerimento;
import br.edu.femass.desenvsistemas.entity.StatusRequerimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RequerimentoRepository extends JpaRepository<Requerimento, Long> {

    List<Requerimento> findBySolicitanteIdOrderByCriadoEmDesc(Long solicitanteId);

    boolean existsByTipoRequerimentoId(Long tipoRequerimentoId);

    @Query("""
            SELECT DISTINCT r FROM Requerimento r
            JOIN r.tipoRequerimento t
            JOIN t.etapas e
            WHERE r.status = :status
              AND e.ordem = r.etapaAtual
              AND e.role = :role
            ORDER BY r.criadoEm ASC
            """)
    List<Requerimento> findPendentesPorRole(
            @Param("status") StatusRequerimento status,
            @Param("role") br.edu.femass.desenvsistemas.entity.Role role
    );
}
