package com.tickets.back.services;

import com.tickets.back.model.Ticket;
import com.tickets.back.repositories.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;

    @Autowired
    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public List<Ticket> findAllTickets() {
        return ticketRepository.findAll();
    }

    public Optional<Ticket> findTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    public Ticket saveTicket(Ticket ticket) {
        return ticketRepository.save(ticket);
    }

    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }

    public List<Ticket> findByEstado(String estado) {
        return ticketRepository.findByEstado(estado);
    }

    public List<Ticket> findByCategoria(String categoria) {
        return ticketRepository.findByCategoria(categoria);
    }

    public List<Ticket> findByUsuarioAsignado(Long idUsuario) {
        return ticketRepository.findByUsuarioAsignado(idUsuario);
    }

    public List<Ticket> findByCreador(Long idCreador) {
        return ticketRepository.findByCreador(idCreador);
    }

    public List<Ticket> findByClienteEntregable(Integer idCliente) {
        return ticketRepository.findByClienteEntregable(idCliente);
    }

    public List<Ticket> findTicketsVencidos() {
        return ticketRepository.findByFechaLimiteBefore(LocalDate.now());
    }

    public List<Ticket> searchByKeyword(String keyword) {
        return ticketRepository.searchByKeyword(keyword);
    }

    public LocalDate convertToLocalDate(Object dateObject) {
        if (dateObject instanceof String) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            return LocalDate.parse((String) dateObject, formatter);
        }
        throw new IllegalArgumentException("Invalid date format or type");
    }

}