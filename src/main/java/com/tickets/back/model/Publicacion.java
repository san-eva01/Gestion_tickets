package com.tickets.back.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "publicaciones")
@Data
public class Publicacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_publicacion")
    private Long idPublicacion;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @CreationTimestamp
    @Column(name = "fecha_publicacion", columnDefinition = "timestamp without time zone")
    private LocalDateTime fechaPublicacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "plataforma", nullable = false)
    private PlataformaPublicacion plataforma;

    @Column(name = "enlace", columnDefinition = "text")
    private String enlace;
}