import React from "react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
  fullWidth?: boolean;
}

// Base modal component
export function CustomModal({
  isOpen,
  onClose,
  title,
  children,
  width = "400px",
  fullWidth = false,
}: CustomModalProps) {
  if (!isOpen) return null;

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    // Close when click on backdrop
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  const overlayFinal: React.CSSProperties = fullWidth
    ? { ...overlayStyle, alignItems: "flex-start", padding: 0 }
    : overlayStyle;

  const modalFinal: React.CSSProperties = fullWidth
    ? { ...modalStyle, width: "100%", borderRadius: 0, maxHeight: "none" }
    : { ...modalStyle, width };

  return (
    <div style={overlayFinal} onClick={handleOverlayClick}>
      <div style={modalFinal}>
        {title && <h2 style={{ marginBottom: "1rem" }}>{title}</h2>}
        <button style={closeButtonStyle} onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

/** Inline dark-themed overlay styles */
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "#1a1a1a",
  color: "white",
  padding: "1rem 1.5rem",
  borderRadius: "8px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
  position: "relative",
  maxHeight: "90vh",
  overflowY: "auto",
};

const closeButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: "0.5rem",
  right: "0.5rem",
  background: "transparent",
  border: "none",
  color: "white",
  fontSize: "1.2rem",
  cursor: "pointer",
};

