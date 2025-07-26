import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { TicketTable } from './components/tickets/TicketTable';
import { TicketForm } from './components/tickets/TicketForm';
import { ErrorBanner } from './components/common/ErrorBanner';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { ticketService } from './services/ticketService';
import type { Ticket, CreateTicketRequest, UpdateTicketRequest } from './types/ticket';
import './styles/global.css';

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);



  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ticketService.getAllTickets();

      setTickets(data);
    } catch (err) {
      setError('Failed to load tickets. Please try again.');
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreateTicket = async (ticketData: CreateTicketRequest) => {
    try {
      setFormLoading(true);
      await ticketService.createTicket(ticketData);
      setShowCreateModal(false);
      await fetchTickets(); // Refresh the list
    } catch (err) {
      setError('Failed to create ticket. Please try again.');
      console.error('Error creating ticket:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditTicket = async (ticketData: UpdateTicketRequest) => {
    if (!selectedTicket) return;
    
    try {
      setFormLoading(true);
      await ticketService.updateTicket(selectedTicket._id, ticketData);
      setShowEditModal(false);
      setSelectedTicket(null);
      await fetchTickets(); // Refresh the list
    } catch (err) {
      setError('Failed to update ticket. Please try again.');
      console.error('Error updating ticket:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;
    
    try {
      setFormLoading(true);
      await ticketService.deleteTicket(ticketToDelete);
      setShowDeleteModal(false);
      setTicketToDelete(null);
      await fetchTickets(); // Refresh the list
    } catch (err) {
      setError('Failed to delete ticket. Please try again.');
      console.error('Error deleting ticket:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = async (id: string) => {
    try {
      const ticket = await ticketService.getTicketById(id);
      setSelectedTicket(ticket);
      setShowEditModal(true);
    } catch (err) {
      setError('Failed to load ticket details. Please try again.');
      console.error('Error fetching ticket:', err);
    }
  };

  const openDeleteModal = (id: string) => {
    setTicketToDelete(id);
    setShowDeleteModal(true);
  };

  const closeError = () => setError(null);

  return (
    <div className="App">
      <Header />
      
      <main className="main">
        <div className="container">
          {error && <ErrorBanner error={error} onClose={closeError} />}
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <h2>All Tickets</h2>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setShowCreateModal(true)}
            >
              ➕ Create Ticket
            </button>
          </div>

          <TicketTable
            tickets={tickets}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            isLoading={loading}
          />
        </div>
      </main>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Ticket</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowCreateModal(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <TicketForm
                onSubmit={(data: CreateTicketRequest | UpdateTicketRequest) => {
                  if ('issue_title' in data && 'issue_description' in data && 'email' in data) {
                    handleCreateTicket(data as CreateTicketRequest);
                  }
                }}
                onCancel={() => setShowCreateModal(false)}
                isLoading={formLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {showEditModal && selectedTicket && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Ticket #{selectedTicket._id}</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowEditModal(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <TicketForm
                ticket={selectedTicket}
                onSubmit={(data: CreateTicketRequest | UpdateTicketRequest) => {
                  handleEditTicket(data as UpdateTicketRequest);
                }}
                onCancel={() => setShowEditModal(false)}
                isLoading={formLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Ticket"
        message="Are you sure you want to delete this ticket? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteTicket}
        onCancel={() => setShowDeleteModal(false)}
        isDestructive={true}
      />
    </div>
  );
}

export default App;
