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

@Entity
@Table(name = "campos_formulario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampoFormulario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_requerimento_id", nullable = false)
    private TipoRequerimento tipoRequerimento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampoTipo tipo;

    @Column(nullable = false)
    private String label;

    private String placeholder;

    @Column(length = 2000)
    private String opcoes;

    @Column(nullable = false)
    @Builder.Default
    private Boolean obrigatorio = false;

    @Builder.Default
    private Boolean fixo = false;

    @Column(nullable = false)
    private Integer ordem;
}
