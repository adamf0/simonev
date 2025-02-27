import React from 'react';

const Modal = ({ isVisible, showClose=true, onClose, title, content, footer }) => {
  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop for modal */}
      <div className="modal-backdrop fade show" onClick={onClose}></div>

      <div className="modal fade show" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" style={{ display: 'block' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            {/* Modal Header */}
            <Modal.Header title={title} showClose={showClose} onClose={onClose} />

            {/* Modal Body */}
            <Modal.Body>{content}</Modal.Body>

            {/* Modal Footer */}
            <Modal.Footer content={footer} />
          </div>
        </div>
      </div>
    </>
  );
};

// Modal Header Sub-Component
Modal.Header = ({ title, showClose, onClose }) => {
  return (
    <div className="modal-header">
      <h5 className="modal-title">{title}</h5>
      {/* Conditionally render the close button */}
      {showClose && (
        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
      )}
    </div>
  );
};

// Modal Body Sub-Component
Modal.Body = ({ children }) => {
  return <div className="modal-body">{children}</div>;
};

// Modal Footer Sub-Component
Modal.Footer = ({ content }) => {
  return (
    <div className="modal-footer">
      {content}
    </div>
  );
};

export default Modal;
