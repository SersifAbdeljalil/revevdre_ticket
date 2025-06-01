import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  FaTicketAlt,
  FaMoneyBillWave,
  FaUserAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCreditCard,
  FaLock,
  FaCalendar,
  FaKey,
} from "react-icons/fa";
import Sidebar from "../Sidebar";
import Header from "../Header";
import { getTicketDetails, buyTicket } from "../../../api/ticketAPI";
import "../../admin/AdminDashboard.css";

const ConfirmPurchase = () => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("carte");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cvv: "",
    expiryMonth: "",
    expiryYear: "",
    password: "",
  });
  const { ticketId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadTicket = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getTicketDetails(ticketId);
        if (!data || !data.ticket) {
          throw new Error("Ticket non trouvé");
        }
        setTicket(data.ticket);
      } catch (err) {
        console.error("Erreur lors du chargement du ticket:", err);
        setError(err.message || "Erreur lors du chargement du ticket");
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [ticketId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    try {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString("fr-FR", options);
    } catch (err) {
      return "Date invalide";
    }
  };

  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatage du numéro de carte (XXXX-XXXX-XXXX-XXXX)
    if (name === "cardNumber") {
      formattedValue = value.replace(/\D/g, "").slice(0, 16);
      formattedValue = formattedValue
        .match(/.{1,4}/g)
        ?.join("-") || formattedValue;
    }

    // Limiter CVV à 3 ou 4 chiffres
    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    // Limiter le mois d'expiration à 2 chiffres (01-12)
    if (name === "expiryMonth") {
      formattedValue = value.replace(/\D/g, "").slice(0, 2);
      if (formattedValue > 12) formattedValue = "12";
      if (formattedValue < 1 && formattedValue.length === 2) formattedValue = "01";
    }

    // Limiter l'année d'expiration à 2 chiffres
    if (name === "expiryYear") {
      formattedValue = value.replace(/\D/g, "").slice(0, 2);
    }

    setCardDetails((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

 const validateCardDetails = () => {
  const { cardNumber, cvv, expiryMonth, expiryYear, password } = cardDetails;

  if (!cardNumber || cardNumber.replace(/\D/g, "").length !== 16) {
    return "Le numéro de carte doit contenir 16 chiffres.";
  }
  if (!cvv || cvv.length < 3) {
    return "Le CVV doit contenir 3 ou 4 chiffres.";
  }
  if (!expiryMonth || !expiryYear) {
    return "La date d'expiration est requise.";
  }
  if (parseInt(expiryMonth) < 1 || parseInt(expiryMonth) > 12) {
    return "Le mois d'expiration doit être entre 01 et 12.";
  }
  const currentYear = new Date().getFullYear() % 100; // 25 en 2025
  const currentMonth = new Date().getMonth() + 1; // 6 en juin
  const expiryYearNum = parseInt(expiryYear);
  const expiryMonthNum = parseInt(expiryMonth);
  if (expiryYearNum < currentYear || (expiryYearNum === currentYear && expiryMonthNum < currentMonth)) {
    return "La carte est déjà expirée.";
  }
  if (!password || password.length < 6) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }
  return "";
};

  const handleConfirmPurchase = async () => {
    if (!paymentMethod) {
      setError("Veuillez sélectionner une méthode de paiement");
      return;
    }

    if (paymentMethod === "carte") {
      const validationError = validateCardDetails();
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const paymentData = {
        methode: paymentMethod,
        ...(paymentMethod === "carte" && {
          cardNumber: cardDetails.cardNumber.replace(/\D/g, ""),
          cvv: cardDetails.cvv,
          expiryMonth: cardDetails.expiryMonth,
          expiryYear: cardDetails.expiryYear,
          password: cardDetails.password,
        }),
      };
      await buyTicket(ticketId, paymentData);
      setSuccess("Achat effectué avec succès !");
      setTimeout(() => {
        navigate("/tickets/list");
      }, 3000);
    } catch (err) {
      console.error("Erreur lors de l'achat:", err);
      setError(err.message || "Erreur lors de l'achat du ticket");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !ticket) {
    return (
      <div className="admin-layout">
        <Sidebar />
        <div className="admin-main">
          <Header title="Confirmation d'Achat" />
          <div className="dashboard-content">
            <div className="loading">
              <div className="loading-spinner"></div>
              <div>Chargement...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="admin-layout">
        <Sidebar />
        <div className="admin-main">
          <Header title="Confirmation d'Achat" />
          <div className="dashboard-content">
            <div className="error-alert">
              <FaExclamationTriangle /> {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Header title="Confirmation d'Achat" />
        <div className="dashboard-content">
          {error && (
            <div className="error-alert">
              <FaExclamationTriangle /> {error}
            </div>
          )}
          {success && (
            <div className="success-alert">
              <FaCheckCircle /> {success}
            </div>
          )}
          {ticket && (
            <div
              className="ticket-card"
              style={{ maxWidth: "800px", margin: "0 auto" }}
            >
              <div
                className="ticket-header"
                style={{
                  background: "var(--accent-gradient)",
                  color: "white",
                  padding: "15px 20px",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <FaTicketAlt />
                <span>
                  {ticket.match.equipe1} vs {ticket.match.equipe2}
                </span>
              </div>
              <div className="ticket-body" style={{ padding: "20px" }}>
                <div
                  className="ticket-info-list"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    className="ticket-info-item"
                    style={{ display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    <FaCalendarAlt />
                    <div>
                      <div style={{ fontSize: "0.85rem", color: "#888" }}>
                        Date
                      </div>
                      <div>{formatDate(ticket.match.date)}</div>
                    </div>
                  </div>
                  <div
                    className="ticket-info-item"
                    style={{ display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    <FaMapMarkerAlt />
                    <div>
                      <div style={{ fontSize: "0.85rem", color: "#888" }}>
                        Lieu
                      </div>
                      <div>{ticket.match.lieu}</div>
                    </div>
                  </div>
                  <div
                    className="ticket-info-item"
                    style={{ display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    <FaMoneyBillWave />
                    <div>
                      <div style={{ fontSize: "0.85rem", color: "#888" }}>
                        Prix
                      </div>
                      <div>{formatCurrency(ticket.prix)}</div>
                    </div>
                  </div>
                  <div
                    className="ticket-info-item"
                    style={{ display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    <FaUserAlt />
                    <div>
                      <div style={{ fontSize: "0.85rem", color: "#888" }}>
                        Vendeur
                      </div>
                      <div>{ticket.vendeur?.nom || "Non spécifié"}</div>
                    </div>
                  </div>
                </div>

                {/* Formulaire de paiement */}
                <div className="form-group" style={{ marginTop: "20px" }}>
                  <label htmlFor="paymentMethod">Méthode de paiement</label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-control"
                    style={{ marginBottom: "20px" }}
                  >
                    <option value="carte">Carte bancaire</option>
                    <option value="mobile">Paiement mobile</option>
                  </select>

                  {paymentMethod === "carte" && (
                    <div
                      className="payment-form"
                      style={{
                        background: "#f9f9f9",
                        padding: "20px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    >
                      <div
                        className="form-group"
                        style={{ marginBottom: "15px" }}
                      >
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            marginBottom: "5px",
                          }}
                        >
                          <FaCreditCard /> Numéro de carte
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={cardDetails.cardNumber}
                          onChange={handleCardDetailsChange}
                          placeholder="XXXX-XXXX-XXXX-XXXX"
                          className="form-control"
                          maxLength={19} // 16 chiffres + 3 tirets
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "15px",
                          marginBottom: "15px",
                        }}
                      >
                        <div className="form-group" style={{ flex: 1 }}>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              marginBottom: "5px",
                            }}
                          >
                            <FaKey /> CVV
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardDetailsChange}
                            placeholder="CVV"
                            className="form-control"
                            maxLength={4}
                          />
                        </div>
                        <div style={{ display: "flex", gap: "10px", flex: 2 }}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                marginBottom: "5px",
                              }}
                            >
                              <FaCalendar /> Date d'expiration
                            </label>
                            <div style={{ display: "flex", gap: "5px" }}>
                              <input
                                type="text"
                                name="expiryMonth"
                                value={cardDetails.expiryMonth}
                                onChange={handleCardDetailsChange}
                                placeholder="MM"
                                className="form-control"
                                maxLength={2}
                              />
                              <span style={{ alignSelf: "center" }}>/</span>
                              <input
                                type="text"
                                name="expiryYear"
                                value={cardDetails.expiryYear}
                                onChange={handleCardDetailsChange}
                                placeholder="AA"
                                className="form-control"
                                maxLength={2}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            marginBottom: "5px",
                          }}
                        >
                          <FaLock /> Mot de passe
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={cardDetails.password}
                          onChange={handleCardDetailsChange}
                          placeholder="Mot de passe"
                          className="form-control"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "mobile" && (
                    <div
                      className="payment-form"
                      style={{
                        background: "#f9f9f9",
                        padding: "20px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    >
                      <div className="form-group">
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            marginBottom: "5px",
                          }}
                        >
                          <FaCreditCard /> Numéro de téléphone
                        </label>
                        <input
                          type="text"
                          name="phoneNumber"
                          value={cardDetails.phoneNumber || ""}
                          onChange={handleCardDetailsChange}
                          placeholder="Numéro de téléphone"
                          className="form-control"
                          maxLength={10}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="ticket-actions"
                  style={{ display: "flex", gap: "10px", marginTop: "20px" }}
                >
                  <button
                    className="btn btn-success"
                    onClick={handleConfirmPurchase}
                    disabled={loading}
                    style={{ flex: "1" }}
                  >
                    {loading ? "Confirmation..." : "Payer maintenant"}
                  </button>
                  <Link
                    to="/tickets/list"
                    className="btn btn-secondary"
                    style={{ flex: "1" }}
                  >
                    Annuler
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmPurchase;