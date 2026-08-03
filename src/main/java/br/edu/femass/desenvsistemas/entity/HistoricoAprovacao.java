package br.edu.femass.desenvsistemas.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "historico_aprovacao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoricoAprovacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requerimento_id", nullable = false)
    private Requerimento requerimento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aprovador_id", nullable = false)
    private User aprovador;

    @Column(nullable = false)
    private Integer etapaOrdem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role roleEtapa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AcaoAprovacao acao;

    @Column(length = 1000)
    private String observacao;

    @Enumerated(EnumType.STRING)
    private MotivoRejeicao motivoRejeicao;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime criadoEm = LocalDateTime.now();
}
