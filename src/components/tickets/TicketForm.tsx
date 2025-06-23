import React, { useState, useEffect } from 'react';
import type { Ticket, CreateTicketRequest, UpdateTicketRequest } from '../../types/ticket';
import {
  validateIssueTitle,
  validateIssueDescription,
  validateEmailField,
  validatePhoneNumberField,
  validateStatus,
  validatePriority
} from '../../utils/validation';

interface TicketFormProps {
  ticket?: Ticket;
  onSubmit: (data: CreateTicketRequest | UpdateTicketRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TicketForm: React.FC<TicketFormProps> = ({
  ticket,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    issue_title: ticket?.issue_title || '',
    issue_description: ticket?.issue_description || '',
    email: ticket?.email || '',
    phone_number: ticket?.phone_number || '',
    status: ticket?.status || 'Open',
    priority: ticket?.priority || 'Medium'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (ticket) {
      setFormData({
        issue_title: ticket.issue_title,
        issue_description: ticket.issue_description,
        email: ticket.email,
        phone_number: ticket.phone_number,
        status: ticket.status,
        priority: ticket.priority
      });
    }
  }, [ticket]);

  const validateField = (name: string, value: string) => {
    let validation;
    switch (name) {
      case 'issue_title':
        validation = validateIssueTitle(value);
        break;
      case 'issue_description':
        validation = validateIssueDescription(value);
        break;
      case 'email':
        validation = validateEmailField(value);
        break;
      case 'phone_number':
        validation = validatePhoneNumberField(value);
        break;
      case 'status':
        validation = validateStatus(value);
        break;
      case 'priority':
        validation = validatePriority(value);
        break;
      default:
        validation = { isValid: true };
    }

    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, [name]: validation.error || '' }));
      return false;
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      return true;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const fields = ['issue_title', 'issue_description', 'email', 'phone_number', 'status', 'priority'];
    const isValid = fields.every(field => validateField(field, formData[field as keyof typeof formData]));

    if (isValid) {
      // If editing, only send changed fields
      if (ticket) {
        const updateData: UpdateTicketRequest = {};
        if (formData.issue_title !== ticket.issue_title) updateData.issue_title = formData.issue_title;
        if (formData.issue_description !== ticket.issue_description) updateData.issue_description = formData.issue_description;
        if (formData.email !== ticket.email) updateData.email = formData.email;
        if (formData.phone_number !== ticket.phone_number) updateData.phone_number = formData.phone_number;
        if (formData.status !== ticket.status) updateData.status = formData.status;
        if (formData.priority !== ticket.priority) updateData.priority = formData.priority;
        onSubmit(updateData);
      } else {
        // If creating, send all required fields
        const createData: CreateTicketRequest = {
          issue_title: formData.issue_title,
          issue_description: formData.issue_description,
          email: formData.email,
          phone_number: formData.phone_number,
          status: formData.status,
          priority: formData.priority
        };
        onSubmit(createData);
      }
    }
  };

  const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
    <div className="tooltip">
      {children}
      <span className="tooltip-text">{text}</span>
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="issue_title" className="form-label">
          Issue Title
          <Tooltip text="Brief description of the issue (max 100 characters)">
            <span style={{ marginLeft: 'var(--spacing-xs)', color: 'var(--text-muted)' }}>?</span>
          </Tooltip>
        </label>
        <input
          type="text"
          id="issue_title"
          name="issue_title"
          value={formData.issue_title}
          onChange={handleChange}
          className={`form-input ${errors.issue_title ? 'error' : ''}`}
          maxLength={100}
          disabled={isLoading}
        />
        {errors.issue_title && <div className="form-error">{errors.issue_title}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="issue_description" className="form-label">
          Issue Description
          <Tooltip text="Detailed description of the issue (max 500 characters)">
            <span style={{ marginLeft: 'var(--spacing-xs)', color: 'var(--text-muted)' }}>?</span>
          </Tooltip>
        </label>
        <textarea
          id="issue_description"
          name="issue_description"
          value={formData.issue_description}
          onChange={handleChange}
          className={`form-textarea ${errors.issue_description ? 'error' : ''}`}
          maxLength={500}
          disabled={isLoading}
        />
        {errors.issue_description && <div className="form-error">{errors.issue_description}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email
          <Tooltip text="Contact email for this ticket">
            <span style={{ marginLeft: 'var(--spacing-xs)', color: 'var(--text-muted)' }}>?</span>
          </Tooltip>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`form-input ${errors.email ? 'error' : ''}`}
          disabled={isLoading}
        />
        {errors.email && <div className="form-error">{errors.email}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="phone_number" className="form-label">
          Phone Number
          <Tooltip text="US phone number in E.164 format (+1XXXXXXXXXX)">
            <span style={{ marginLeft: 'var(--spacing-xs)', color: 'var(--text-muted)' }}>?</span>
          </Tooltip>
        </label>
        <input
          type="tel"
          id="phone_number"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          className={`form-input ${errors.phone_number ? 'error' : ''}`}
          placeholder="+1XXXXXXXXXX"
          disabled={isLoading}
        />
        {errors.phone_number && <div className="form-error">{errors.phone_number}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="priority" className="form-label">
          Priority
          <Tooltip text="How urgent this issue is">
            <span style={{ marginLeft: 'var(--spacing-xs)', color: 'var(--text-muted)' }}>?</span>
          </Tooltip>
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className={`form-select ${errors.priority ? 'error' : ''}`}
          disabled={isLoading}
        >
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        {errors.priority && <div className="form-error">{errors.priority}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="status" className="form-label">
          Status
          <Tooltip text="Current status of this ticket">
            <span style={{ marginLeft: 'var(--spacing-xs)', color: 'var(--text-muted)' }}>?</span>
          </Tooltip>
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={`form-select ${errors.status ? 'error' : ''}`}
          disabled={isLoading}
        >
          <option value="Open">Open</option>
          <option value="In-progress">In-progress</option>
          <option value="Closed">Closed</option>
        </select>
        {errors.status && <div className="form-error">{errors.status}</div>}
      </div>

      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || Object.keys(errors).length > 0}
        >
          {isLoading ? (
            <>
              <div className="spinner" style={{ width: '1rem', height: '1rem', marginRight: 'var(--spacing-xs)' }}></div>
              {ticket ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            ticket ? 'Update Ticket' : 'Create Ticket'
          )}
        </button>
      </div>
    </form>
  );
}; 