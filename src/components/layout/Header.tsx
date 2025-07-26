import React from 'react';
import { HelpIcon } from '../common/HelpIcon';
import { DarkModeToggle } from '../common/DarkModeToggle';
import { WebhookToggle } from '../common/WebhookToggle';


// Modern SVG Ticket Icon
const TicketIcon: React.FC = () => (
  <svg 
    width="32" 
    height="32" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <path d="M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"/>
    <path d="M2 15v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4"/>
    <path d="M2 9h20"/>
    <path d="M2 15h20"/>
    <path d="M6 6h.01"/>
    <path d="M6 18h.01"/>
  </svg>
);

export const Header: React.FC = () => {
  const helpContent = `
    <h4>Ticket Management System</h4>
    <p><strong>Features:</strong></p>
    <ul>
      <li>View all tickets in a sortable, filterable table</li>
      <li>Create new tickets with the "Create Ticket" button</li>
      <li>Edit existing tickets by clicking on the ticket ID</li>
      <li>Delete tickets with confirmation</li>
      <li>Filter and sort tickets by any column</li>
      <li>Toggle between light and dark themes</li>
    </ul>
    <p><strong>Status Colors:</strong></p>
    <ul>
      <li>🟦 Open - New tickets that need attention</li>
      <li>🟡 In-progress - Tickets currently being worked on</li>
      <li>🟢 Closed - Completed tickets</li>
    </ul>
    <p><strong>Priority Levels:</strong></p>
    <ul>
      <li>🔴 Critical - Immediate attention required</li>
      <li>🟠 High - Important, needs prompt attention</li>
      <li>🟡 Medium - Normal priority</li>
      <li>🟢 Low - Low priority, can be addressed later</li>
    </ul>
  `;

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-brand">
            <div className="logo">
              <TicketIcon />
            </div>
            <div className="brand-text">
              <h1 className="brand-title">TicketFlow</h1>
              <p className="brand-subtitle">Management System</p>
            </div>
          </div>
          
          <div className="header-actions">
            <HelpIcon 
              title="Help & Information" 
              content={helpContent}
            />
                          <DarkModeToggle />
              <WebhookToggle />    
          </div>
        </div>
      </div>
    </header>
  );
}; 