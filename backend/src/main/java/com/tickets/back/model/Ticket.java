package com.tickets.back.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ticket")
    private Long idTicket;

    @Column(name = "titulo", nullable = false, length = 255)
    private String titulo;

    @Column(name = "descripcion", nullable = false, columnDefinition = "text")
    private String descripcion;

    @Column(name = "categoria", nullable = false)
    private String categoria;

    @Column(name = "estado", nullable = false)
    private String estado;

    @Column(name = "fecha_creacion", nullable = true, columnDefinition = "timestamp default CURRENT_TIMESTAMP")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_limite", nullable = true)
    private LocalDate fechaLimite;

    /*
     * @ManyToOne(fetch = FetchType.LAZY)
     * 
     * @JoinColumn(name = "id_creador", nullable = true)
     * private Usuario creador;
     * 
     * @ManyToOne(fetch = FetchType.LAZY)
     * 
     * @JoinColumn(name = "id_usuario_asignado", nullable = true)
     * private Usuario usuarioAsignado;
     * 
     * @ManyToOne(fetch = FetchType.LAZY)
     * 
     * @JoinColumn(name = "id_cliente_entregable", nullable = true)
     * private Cliente clienteEntregable;
     */

    @ManyToOne
    @JoinColumn(name = "id_creador", referencedColumnName = "id_usuario")
    private Usuario creador;

    @ManyToOne
    @JoinColumn(name = "id_usuario_asignado", referencedColumnName = "id_usuario")
    private Usuario usuarioAsignado;

    @ManyToOne
    @JoinColumn(name = "id_cliente_entregable", referencedColumnName = "id_cliente")
    private Cliente clienteEntregable;

}