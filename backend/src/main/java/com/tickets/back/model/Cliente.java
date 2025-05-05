package com.tickets.back.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.ZonedDateTime;

@Entity
@Table(name = "cliente")
@Data
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private long idCliente;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "tipo")
    private String tipo;

    @Column(name = "fecha_creacion", nullable = false)
    private ZonedDateTime fechaCreacion = ZonedDateTime.now();

    @Column(name = "email", nullable = false)
    private String email;
}
