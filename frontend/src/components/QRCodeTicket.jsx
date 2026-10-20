import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * QRCodeTicket Component
 * Renders a crisp, scannable QR Code E-Ticket with cinema pass aesthetics.
 * Supports inline badge/thumbnail or full interactive scan modal.
 */
function QRCodeTicket({ booking, size = 130, showDetails = true }) {
    const [showModal, setShowModal] = useState(false);

    if (!booking) return null;

    const bookingRef = booking.bookingReference || (booking._id ? `IMV-${booking._id.slice(-6).toUpperCase()}` : 'IMV-PASS');
    const isCancelled = booking.status === 'Cancelled';

    // Verification payload encoded in QR code
    const ticketPayload = JSON.stringify({
        app: 'IMovies Premiere',
        ref: bookingRef,
        bookingId: booking._id,
        movie: booking.movieTitle,
        seats: booking.seats,
        theater: booking.theaterName || 'IMovies Grand Screen',
        showTime: booking.showTime || '07:30 PM',
        amount: booking.totalAmount,
        status: booking.status || 'Confirmed',
        timestamp: booking.createdAt || new Date().toISOString(),
        verified: !isCancelled
    });

    return (
        <div className="qr-ticket-container">
            {/* Inline QR Badge */}
            <div 
                className="d-flex align-items-center gap-3 p-2 rounded-3 border bg-white shadow-sm cursor-pointer"
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onClick={() => setShowModal(true)}
                title="Click to expand scannable digital boarding pass"
            >
                <div className="p-1 bg-white rounded border d-flex align-items-center justify-content-center">
                    <QRCodeSVG 
                        value={ticketPayload} 
                        size={size} 
                        level="H" 
                        includeMargin={false}
                        fgColor={isCancelled ? '#888888' : '#111827'}
                    />
                </div>
                {showDetails && (
                    <div className="small">
                        <div className="fw-bold text-dark d-flex align-items-center gap-1">
                            <span>📱 Scannable E-Pass</span>
                            <span className="badge bg-success" style={{ fontSize: '0.65rem' }}>Active</span>
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Ref: <strong className="text-danger">{bookingRef}</strong>
                        </div>
                        <div className="text-secondary" style={{ fontSize: '0.7rem' }}>
                            Tap to enlarge & scan
                        </div>
                    </div>
                )}
            </div>

            {/* Expanded QR Ticket Modal */}
            {showModal && (
                <div 
                    className="modal show d-block" 
                    tabIndex="-1" 
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1060, backdropFilter: 'blur(4px)' }}
                    onClick={() => setShowModal(false)}
                >
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg overflow-hidden rounded-4">
                            {/* Modal Header */}
                            <div className="modal-header bg-dark text-white border-0 py-3 px-4">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="fs-4">🎟️</span>
                                    <div>
                                        <h6 className="modal-title fw-bold text-white mb-0">IMovies Digital Boarding Pass</h6>
                                        <small className="text-secondary" style={{ fontSize: '0.75rem' }}>Official Scannable Ticket Verification</small>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white" 
                                    aria-label="Close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>

                            {/* Modal Body: Ticket Pass */}
                            <div className="modal-body p-4 text-center bg-light">
                                <div className="bg-white p-4 rounded-4 shadow-sm border border-secondary border-opacity-25 mx-auto" style={{ maxWidth: '360px' }}>
                                    <div className="mb-2">
                                        <span className={`badge ${isCancelled ? 'bg-secondary' : 'bg-danger'} px-3 py-1 text-uppercase letter-spacing-1`}>
                                            {isCancelled ? 'Cancelled Pass' : 'Gate Entry Valid'}
                                        </span>
                                    </div>
                                    <h5 className="fw-bold text-dark mb-1">{booking.movieTitle}</h5>
                                    <p className="text-muted small mb-3">
                                        📍 {booking.theaterName || 'IMovies Grand Screen'}
                                    </p>

                                    {/* High-Res QR Code */}
                                    <div className="p-3 bg-white rounded-3 border d-inline-block shadow-sm mb-3">
                                        <QRCodeSVG 
                                            value={ticketPayload} 
                                            size={200} 
                                            level="H" 
                                            includeMargin={true}
                                            fgColor={isCancelled ? '#777' : '#000'}
                                        />
                                    </div>

                                    <div className="bg-light p-2 rounded-3 text-start small mb-3">
                                        <div className="d-flex justify-content-between text-muted mb-1">
                                            <span>Booking Reference:</span>
                                            <strong className="text-danger">{bookingRef}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between text-muted mb-1">
                                            <span>Showtime:</span>
                                            <strong className="text-dark">{booking.showTime || '07:30 PM'}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between text-muted mb-1">
                                            <span>Seats:</span>
                                            <strong className="text-dark">
                                                {booking.seats ? booking.seats.join(', ') : 'N/A'}
                                            </strong>
                                        </div>
                                        <div className="d-flex justify-content-between text-muted">
                                            <span>Paid Amount:</span>
                                            <strong className="text-success">₹{booking.totalAmount}</strong>
                                        </div>
                                    </div>

                                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                        📷 Present this QR Code at the cinema entrance scanner for rapid entry.
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="modal-footer bg-white border-0 d-flex justify-content-between px-4 pb-3">
                                <button 
                                    className="btn btn-outline-dark btn-sm fw-semibold" 
                                    onClick={() => window.print()}
                                >
                                    🖨️ Print Pass
                                </button>
                                <button 
                                    className="btn btn-danger btn-sm px-4 fw-bold" 
                                    onClick={() => setShowModal(false)}
                                >
                                    Close Pass
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default QRCodeTicket;
