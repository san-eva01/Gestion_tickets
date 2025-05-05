package com.tickets.back.repositories;

import com.tickets.back.model.Publicacion;

import com.tickets.back.model.PlataformaPublicacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicacionRepository extends JpaRepository<Publicacion, Long> {
    List<Publicacion> findByIdUsuario(Long idUsuario);

    List<Publicacion> findByPlataforma(PlataformaPublicacion plataforma);

    @Query("SELECT p FROM Publicacion p WHERE p.idUsuario = :idUsuario AND p.plataforma = :plataforma")
    List<Publicacion> findByIdUsuarioAndPlataforma(
            @Param("idUsuario") Long idUsuario,
            @Param("plataforma") PlataformaPublicacion plataforma);
}