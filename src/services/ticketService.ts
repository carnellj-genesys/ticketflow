import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { Ticket, CreateTicketRequest, UpdateTicketRequest } from '../types/ticket';
import { webhookService } from './webhookService';
import { configManager } from '../utils/config';

class TicketService {
  private baseUrl: string;
  private apiKey: string;
  private corsApiKey: string;
  
  constructor() {
    // Initialize with default values, will be updated after config loads
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/rest';
    this.apiKey = import.meta.env.VITE_API_KEY || '68544b73bb5cccc333f6d956';
    this.corsApiKey = import.meta.env.VITE_CORS_API_KEY || '68544b73bb5cccc333f6d956';
    
    // Load configuration
    this.loadConfig();
  }
  
  private async loadConfig() {
    try {
      await configManager.loadConfig();
      const apiConfig = configManager.getApiConfig();
      this.baseUrl = apiConfig.baseUrl;
      this.apiKey = apiConfig.apiKey;
      this.corsApiKey = apiConfig.corsApiKey;
      console.log(`🔧 TicketService configured with baseUrl: ${this.baseUrl}`);
    } catch (error) {
      console.warn('⚠️ Using fallback configuration for TicketService:', error);
    }
  }
  
  private getHeaders() {
    return {
      'x-apikey': this.apiKey,
      'CORS-API-Key': this.corsApiKey,
      'Content-Type': 'application/json'
    };
  }

  private logRequest(method: string, url: string, data?: any) {
    console.group(`🚀 API Request: ${method} ${url}`);
    console.log('📤 Request Headers:', this.getHeaders());
    if (data) {
      console.log('📤 Request Body:', data);
    }
    console.groupEnd();
  }

  private logResponse(method: string, url: string, response: AxiosResponse) {
    console.group(`✅ API Response: ${method} ${url}`);
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Headers:', response.headers);
    console.log('📥 Response Data:', response.data);
    console.groupEnd();
  }

  private logError(method: string, url: string, error: any) {
    console.group(`❌ API Error: ${method} ${url}`);
    console.error('📥 Error Details:', error);
    if (error.response) {
      console.error('📥 Error Status:', error.response.status);
      console.error('📥 Error Headers:', error.response.headers);
      console.error('📥 Error Data:', error.response.data);
    }
    console.groupEnd();
  }
  
  async getAllTickets(): Promise<Ticket[]> {
    const url = `${this.baseUrl}/ticket`;
    this.logRequest('GET', url);
    
    try {
      const response = await axios.get<Ticket[]>(url, {
        headers: this.getHeaders()
      });
      this.logResponse('GET', url, response);
      return response.data;
    } catch (error) {
      this.logError('GET', url, error);
      throw error;
    }
  }

  async getTicketById(id: string): Promise<Ticket> {
    const url = `${this.baseUrl}/ticket/${id}`;
    this.logRequest('GET', url);
    
    try {
      const response = await axios.get<Ticket>(url, {
        headers: this.getHeaders()
      });
      this.logResponse('GET', url, response);
      return response.data;
    } catch (error) {
      this.logError('GET', url, error);
      throw error;
    }
  }

  async createTicket(ticket: CreateTicketRequest): Promise<Ticket> {
    const url = `${this.baseUrl}/ticket`;
    this.logRequest('POST', url, ticket);
    
    try {
      const response = await axios.post<Ticket>(url, ticket, {
        headers: this.getHeaders()
      });
      this.logResponse('POST', url, response);
      
      // Notify webhook service about the created ticket
      await webhookService.notifyTicketCreated(response.data);
      
      return response.data;
    } catch (error) {
      this.logError('POST', url, error);
      throw error;
    }
  }

  async updateTicket(id: string, ticket: UpdateTicketRequest): Promise<Ticket> {
    const url = `${this.baseUrl}/ticket/${id}`;
    this.logRequest('PUT', url, ticket);
    
    try {
      const response = await axios.put<Ticket>(url, ticket, {
        headers: this.getHeaders()
      });
      this.logResponse('PUT', url, response);
      
      // Notify webhook service about the updated ticket
      await webhookService.notifyTicketUpdated(response.data);
      
      return response.data;
    } catch (error) {
      this.logError('PUT', url, error);
      throw error;
    }
  }

  async deleteTicket(id: string): Promise<void> {
    const url = `${this.baseUrl}/ticket/${id}`;
    this.logRequest('DELETE', url);
    
    try {
      // Get the ticket data before deleting it for the webhook
      const ticketToDelete = await this.getTicketById(id);
      
      const response = await axios.delete(url, {
        headers: this.getHeaders()
      });
      this.logResponse('DELETE', url, response);
      
      // Notify webhook service about the deleted ticket with actual data
      await webhookService.notifyTicketDeleted(ticketToDelete);
      
    } catch (error) {
      this.logError('DELETE', url, error);
      throw error;
    }
  }
}

export const ticketService = new TicketService(); 