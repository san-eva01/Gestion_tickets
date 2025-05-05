package com.tickets.back.controller;

import com.tickets.back.model.Usuario;
import com.tickets.back.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    @Autowired
    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    // CREATE - Crear un nuevo usuario
    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody Usuario usuario) {
        try {
            // Validación básica (puedes usar anotaciones @Valid con DTOs para más
            // validaciones)
            if (usuario.getEmail() == null || usuario.getEmail().isEmpty()) {
                return ResponseEntity.badRequest().body("El email es obligatorio");
            }

            // Verificar si el email ya existe
            if (usuarioRepository.existsByEmail(usuario.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("El email ya está registrado");
            }

            Usuario nuevoUsuario = usuarioRepository.save(usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.internalServerError()
                    .body("Error de integridad de datos: " + e.getMessage());
        }
    }

    // READ - Obtener todos los usuarios
    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        return ResponseEntity.ok(usuarios);
    }

    // READ - Obtener un usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerUsuarioPorId(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // UPDATE - Actualizar un usuario existente
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(
            @PathVariable Long id,
            @RequestBody Usuario usuarioActualizado) {

        return usuarioRepository.findById(id)
                .map(usuarioExistente -> {
                    // Actualizar solo los campos permitidos
                    if (usuarioActualizado.getNombre() != null) {
                        usuarioExistente.setNombre(usuarioActualizado.getNombre());
                    }
                    if (usuarioActualizado.getEmail() != null) {
                        // Verificar que el nuevo email no esté en uso por otro usuario
                        if (!usuarioActualizado.getEmail().equals(usuarioExistente.getEmail()) &&
                                usuarioRepository.existsByEmail(usuarioActualizado.getEmail())) {
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                                    .body("El nuevo email ya está en uso");
                        }
                        usuarioExistente.setEmail(usuarioActualizado.getEmail());
                    }
                    // Actualizar otros campos según necesidad

                    Usuario usuarioGuardado = usuarioRepository.save(usuarioExistente);
                    return ResponseEntity.ok(usuarioGuardado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> actualizarUsuarioParcial(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {

        return usuarioRepository.findById(id)
                .map(usuario -> {
                    // Actualiza solo los campos recibidos
                    updates.forEach((key, value) -> {
                        switch (key) {
                            case "nombre":
                                usuario.setNombre((String) value);
                                break;
                            case "email":
                                usuario.setEmail((String) value);
                                break;
                            case "rol":
                                usuario.setRol((String) value);
                                break;
                            case "contrasena":
                                usuario.setContraseña((String) value);
                                break;
                        }
                    });

                    usuarioRepository.save(usuario);
                    return ResponseEntity.ok(usuario);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE - Eliminar un usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        try {
            if (!usuarioRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            usuarioRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("No se puede eliminar el usuario debido a restricciones de integridad");
        }
    }

    // Búsqueda personalizada (ejemplo adicional)
    @GetMapping("/buscar")
    public ResponseEntity<List<Usuario>> buscarPorNombre(
            @RequestParam String nombre) {
        List<Usuario> usuarios = usuarioRepository.findByNombreContainingIgnoreCase(nombre);
        return ResponseEntity.ok(usuarios);
    }
}