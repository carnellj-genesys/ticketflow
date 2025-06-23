import React, { useState } from 'react';

interface HelpIconProps {
  title?: string;
  content: string;
}

export const HelpIcon: React.FC<HelpIconProps> = ({ title = 'Help', content }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openHelp = () => setIsOpen(true);
  const closeHelp = () => setIsOpen(false);

  return (
    <>
      <button
        onClick={openHelp}
        className="tooltip"
        aria-label="Help"
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.25rem',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          padding: '0.25rem',
          borderRadius: '50%',
          width: '2rem',
          height: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ?
        <span className="tooltip-text">Click for help</span>
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={closeHelp}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{title}</h3>
              <button className="modal-close" onClick={closeHelp} aria-label="Close help">
                ×
              </button>
            </div>
            <div className="modal-body">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={closeHelp}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 