package br.edu.femass.desenvsistemas.repository;

import br.edu.femass.desenvsistemas.entity.TipoRequerimento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TipoRequerimentoRepository extends JpaRepository<TipoRequerimento, Long> {

    List<TipoRequerimento> findByAtivoTrueOrderByNomeAsc();
}
