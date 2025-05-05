package com.tickets.back.repositories;

import com.tickets.back.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByEstado(String estado);

    List<Ticket> findByCategoria(String categoria);

    @Query("SELECT t FROM Ticket t WHERE t.usuarioAsignado.idUsuario = :idUsuario")
    List<Ticket> findByUsuarioAsignado(@Param("idUsuario") Long idUsuario);

    @Query("SELECT t FROM Ticket t WHERE t.creador.idUsuario = :idCreador")
    List<Ticket> findByCreador(@Param("idCreador") Long idCreador);

    @Query("SELECT t FROM Ticket t WHERE t.clienteEntregable.idCliente = :idCliente")
    List<Ticket> findByClienteEntregable(@Param("idCliente") Integer idCliente);

    List<Ticket> findByFechaLimiteBefore(LocalDate fecha);

    @Query("SELECT t FROM Ticket t WHERE LOWER(t.titulo) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.descripcion) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Ticket> searchByKeyword(@Param("keyword") String keyword);
}