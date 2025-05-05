package com.tickets.back.controller;

import com.tickets.back.model.Ticket;
import com.tickets.back.services.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    @Autowired
    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        List<Ticket> tickets = ticketService.findAllTickets();
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        Optional<Ticket> ticket = ticketService.findTicketById(id);
        return ticket.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        Ticket savedTicket = ticketService.saveTicket(ticket);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTicket);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable Long id, @RequestBody Ticket ticket) {
        Optional<Ticket> existingTicket = ticketService.findTicketById(id);
        if (existingTicket.isPresent()) {
            ticket.setIdTicket(id);
            Ticket updatedTicket = ticketService.saveTicket(ticket);
            return ResponseEntity.ok(updatedTicket);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Ticket> partialUpdateTicket(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        Optional<Ticket> existingTicketOpt = ticketService.findTicketById(id);
        if (existingTicketOpt.isPresent()) {
            Ticket existingTicket = existingTicketOpt.get();

            // Actualizar solo los campos proporcionados en el mapa de actualizaciones
            if (updates.containsKey("titulo")) {
                existingTicket.setTitulo((String) updates.get("titulo"));
            }
            if (updates.containsKey("descripcion")) {
                existingTicket.setDescripcion((String) updates.get("descripcion"));
            }
            if (updates.containsKey("categoria")) {
                existingTicket.setCategoria((String) updates.get("categoria"));
            }
            if (updates.containsKey("estado")) {
                existingTicket.setEstado((String) updates.get("estado"));
            }
            if (updates.containsKey("fechaLimite")) {
                // Aquí se necesitaría la conversión adecuada de String a LocalDate
                // Este es un ejemplo simplificado
                existingTicket.setFechaLimite(ticketService.convertToLocalDate(updates.get("fechaLimite")));
            }

            // No se incluyen las relaciones (creador, usuarioAsignado, clienteEntregable)
            // ya que requerirían lógica adicional para buscar las entidades por ID

            Ticket updatedTicket = ticketService.saveTicket(existingTicket);
            return ResponseEntity.ok(updatedTicket);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        Optional<Ticket> existingTicket = ticketService.findTicketById(id);
        if (existingTicket.isPresent()) {
            ticketService.deleteTicket(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Ticket>> getTicketsByEstado(@PathVariable String estado) {
        List<Ticket> tickets = ticketService.findByEstado(estado);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<Ticket>> getTicketsByCategoria(@PathVariable String categoria) {
        List<Ticket> tickets = ticketService.findByCategoria(categoria);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Ticket>> getTicketsByUsuarioAsignado(@PathVariable Long idUsuario) {
        List<Ticket> tickets = ticketService.findByUsuarioAsignado(idUsuario);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/creador/{idCreador}")
    public ResponseEntity<List<Ticket>> getTicketsByCreador(@PathVariable Long idCreador) {
        List<Ticket> tickets = ticketService.findByCreador(idCreador);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/cliente/{idCliente}")
    public ResponseEntity<List<Ticket>> getTicketsByCliente(@PathVariable Integer idCliente) {
        List<Ticket> tickets = ticketService.findByClienteEntregable(idCliente);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Ticket>> searchTickets(@RequestParam String keyword) {
        List<Ticket> tickets = ticketService.searchByKeyword(keyword);
        return ResponseEntity.ok(tickets);
    }
}