package com.tickets.back.services;

import com.tickets.back.model.Publicacion;
import com.tickets.back.model.PlataformaPublicacion;
import com.tickets.back.repositories.PublicacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PublicacionService {
    private final PublicacionRepository publicacionRepository;

    @Autowired
    public PublicacionService(PublicacionRepository publicacionRepository) {
        this.publicacionRepository = publicacionRepository;
    }

    public List<Publicacion> findAll() {
        return publicacionRepository.findAll();
    }

    public Publicacion findById(Long id) {
        return publicacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publicación no encontrada con id: " + id));
    }

    public Publicacion save(Publicacion publicacion) {
        return publicacionRepository.save(publicacion);
    }

    public void deleteById(Long id) {
        publicacionRepository.deleteById(id);
    }

    public List<Publicacion> findByUsuario(Long idUsuario) {
        return publicacionRepository.findByIdUsuario(idUsuario);
    }

    public List<Publicacion> findByPlataforma(PlataformaPublicacion plataforma) {
        return publicacionRepository.findByPlataforma(plataforma);
    }

    public List<Publicacion> findByUsuarioAndPlataforma(Long idUsuario, PlataformaPublicacion plataforma) {
        return publicacionRepository.findByIdUsuarioAndPlataforma(idUsuario, plataforma);
    }
}