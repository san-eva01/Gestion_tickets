package com.tickets.back.controller;

import com.tickets.back.model.Publicacion;
import com.tickets.back.model.PlataformaPublicacion;
import com.tickets.back.services.PublicacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/publicaciones")
public class PublicacionController {
    private final PublicacionService publicacionService;

    @Autowired
    public PublicacionController(PublicacionService publicacionService) {
        this.publicacionService = publicacionService;
    }

    @GetMapping
    public List<Publicacion> getAllPublicaciones() {
        return publicacionService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Publicacion> getPublicacionById(@PathVariable Long id) {
        return ResponseEntity.ok(publicacionService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Publicacion> createPublicacion(@RequestBody Publicacion publicacion) {
        Publicacion savedPublicacion = publicacionService.save(publicacion);
        return ResponseEntity.created(URI.create("/api/publicaciones/" + savedPublicacion.getIdPublicacion()))
                .body(savedPublicacion);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePublicacion(@PathVariable Long id) {
        publicacionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<Publicacion> getPublicacionesByUsuario(@PathVariable Long idUsuario) {
        return publicacionService.findByUsuario(idUsuario);
    }

    @GetMapping("/plataforma/{plataforma}")
    public List<Publicacion> getPublicacionesByPlataforma(@PathVariable PlataformaPublicacion plataforma) {
        return publicacionService.findByPlataforma(plataforma);
    }

    @GetMapping("/usuario/{idUsuario}/plataforma/{plataforma}")
    public List<Publicacion> getPublicacionesByUsuarioAndPlataforma(
            @PathVariable Long idUsuario,
            @PathVariable PlataformaPublicacion plataforma) {
        return publicacionService.findByUsuarioAndPlataforma(idUsuario, plataforma);
    }
}