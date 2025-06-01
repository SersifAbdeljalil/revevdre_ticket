// src/components/client/TicketManagement/TicketsList.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTicketAlt,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaMoneyBillWave,
  FaEye,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserAlt,
  FaExclamationTriangle,
  FaSync,
  FaShoppingCart,
  FaCheckCircle,
} from "react-icons/fa";
import Sidebar from "../Sidebar";
import Header from "../Header";
import { getAllTickets } from "../../../api/ticketAPI"; // Supprimé buyTicket ici
import { getCurrentUserAPI } from "../../../api/authAPI";
import "../../admin/AdminDashboard.css";

const TicketsList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("available");
  const [sortBy, setSortBy] = useState("date_desc");
  const [currentUserId, setCurrentUserId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError("");

        // Récupérer l'utilisateur connecté
        const user = getCurrentUserAPI();
        console.log("TicketsList - Utilisateur:", user);
        if (!user || !user.token || !user.user || !user.user.id) {
          console.log("Utilisateur non connecté, redirection vers /login");
          navigate("/login");
          return;
        }
        setCurrentUserId(user.user.id);
        console.log("CurrentUserId défini:", user.user.id);

        // Charger les tickets
        await loadTickets(true);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(err.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [navigate]);

  const loadTickets = async (forceReload = false) => {
    if (!forceReload && loading) return;

    try {
      setLoading(true);
      setError("");

      const data = await getAllTickets({ status: "available" });
      console.log("Réponse getAllTickets:", data);
      if (!data || !data.tickets) {
        throw new Error("Le format de la réponse API est invalide");
      }

      // Filtrer les tickets pour exclure ceux du client connecté
      const filteredTickets = data.tickets.filter(
        (ticket) => ticket.vendeur?.id !== currentUserId
      );
      setTickets(filteredTickets);
    } catch (err) {
      console.error("Erreur lors du chargement des tickets:", err);
      setError(err.message || "Erreur lors de la connexion à l'API");
    } finally {
      setLoading(false);
    }
  };

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

  const filteredTickets = tickets.filter((ticket) => {
    if (!ticket || !ticket.match) return false;

    const matchesSearch =
      (ticket.match?.equipe1?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (ticket.match?.equipe2?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (ticket.match?.lieu?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (ticket.vendeur?.nom?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );

    let matchesStatus = true;
    if (filterStatus === "available") {
      matchesStatus = !ticket.estVendu;
    } else if (filterStatus === "sold") {
      matchesStatus = ticket.estVendu;
    }

    return matchesSearch && matchesStatus;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    try {
      switch (sortBy) {
        case "date_asc":
          return new Date(a.match.date) - new Date(b.match.date);
        case "date_desc":
          return new Date(b.match.date) - new Date(a.match.date);
        case "price_asc":
          return a.prix - b.prix;
        case "price_desc":
          return b.prix - a.prix;
        default:
          return 0;
      }
    } catch (err) {
      return 0;
    }
  });

  const handleViewTicket = (ticketId) => {
    console.log("Navigation vers ticket:", ticketId);
    navigate(`/tickets/${ticketId}`);
  };

  const handlePurchaseTicket = (ticketId) => {
    console.log("Redirection vers confirmation d'achat pour ticket:", ticketId);
    navigate(`/tickets/${ticketId}/purchase`);
  };

  const handleRefresh = () => {
    console.log("Rafraîchissement des tickets");
    loadTickets(true);
  };

  const LoadingSpinner = () => (
    <div className="loading">
      <div className="loading-spinner"></div>
      <div>Chargement des tickets...</div>
      <div className="dot-loader">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </div>
  );

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Header title="Tickets Disponibles" />

        <div className="dashboard-content">
          {error && (
            <div
              className="error-alert"
              style={{
                padding: "15px",
                borderRadius: "var(--border-radius)",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "15px",
                background: "rgba(220, 38, 38, 0.1)",
                color: "var(--error)",
                border: "1px solid var(--error)",
              }}
            >
              <FaExclamationTriangle style={{ fontSize: "1.2rem" }} />
              <div>
                <div style={{ fontWeight: "600", marginBottom: "5px" }}>
                  Attention
                </div>
                <div>{error}</div>
              </div>
            </div>
          )}

          {success && (
            <div
              className="success-alert"
              style={{
                backgroundColor: "rgba(0, 202, 114, 0.1)",
                color: "var(--success)",
                padding: "15px",
                borderRadius: "var(--border-radius)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FaCheckCircle />
              {success}
            </div>
          )}

          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <FaTicketAlt style={{ color: "var(--primary)" }} />
                Tickets disponibles à la vente
              </h2>
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Rechercher un ticket..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="search-icon" />
              </div>
            </div>

            <div
              className="filter-sort-container"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "15px",
              }}
            >
              <div
                className="filter-options"
                style={{ display: "flex", gap: "15px" }}
              >
                <div
                  className="filter-group"
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <FaFilter style={{ color: "var(--primary)" }} />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="form-control"
                    style={{ width: "auto", minWidth: "150px" }}
                  >
                    <option value="all">Tous les tickets</option>
                    <option value="available">Disponibles</option>
                    <option value="sold">Vendus</option>
                  </select>
                </div>
              </div>

              <div
                className="sort-options"
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <FaSortAmountDown style={{ color: "var(--primary)" }} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-control"
                  style={{ width: "auto", minWidth: "180px" }}
                >
                  <option value="date_desc">Date (plus récent)</option>
                  <option value="date_asc">Date (plus ancien)</option>
                  <option value="price_asc">Prix (croissant)</option>
                  <option value="price_desc">Prix (décroissant)</option>
                </select>
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <button
                className="btn btn-primary"
                onClick={handleRefresh}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 25px",
                  fontSize: "1rem",
                }}
              >
                <FaSync /> Afficher les tickets
              </button>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : sortedTickets.length > 0 ? (
              <div
                className="tickets-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "25px",
                }}
              >
                {sortedTickets.map((ticket, index) => (
                  <div
                    key={ticket.id}
                    className="ticket-card"
                    style={{
                      backgroundColor: "white",
                      borderRadius: "var(--border-radius-lg)",
                      overflow: "hidden",
                      boxShadow: "var(--shadow-md)",
                      transition: "all var(--transition-normal)",
                      animation: `fadeInUp ${0.3 + index * 0.05}s ease-out`,
                      border: ticket.estVendu
                        ? "2px solid var(--error)"
                        : "2px solid var(--success)",
                    }}
                  >
                    <div
                      className="ticket-header"
                      style={{
                        background: ticket.estVendu
                          ? "linear-gradient(135deg, #ff3d57 0%, #ff5f7e 100%)"
                          : "var(--accent-gradient)",
                        color: "white",
                        padding: "15px 20px",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          backgroundColor: ticket.estVendu
                            ? "var(--error)"
                            : "var(--success)",
                          color: "white",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          padding: "4px 8px",
                          borderRadius: "12px",
                        }}
                      >
                        {ticket.estVendu ? "Vendu" : "Disponible"}
                      </div>

                      <div
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: "700",
                          marginBottom: "5px",
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

                      <div
                        style={{
                          fontSize: "1.1rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          opacity: "0.9",
                        }}
                      >
                        <FaCalendarAlt style={{ fontSize: "0.9rem" }} />
                        {formatDate(ticket.match.date)}
                      </div>
                    </div>

                    <div className="ticket-body" style={{ padding: "20px" }}>
                      <div
                        className="ticket-info-list"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "15px",
                        }}
                      >
                        <div
                          className="ticket-info-item"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              backgroundColor: "rgba(255, 107, 1, 0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--primary)",
                            }}
                          >
                            <FaMapMarkerAlt />
                          </div>
                          <div>
                            <div style={{ fontSize: "0.85rem", color: "#888" }}>
                              Lieu
                            </div>
                            <div style={{ fontWeight: "500" }}>
                              {ticket.match.lieu}
                            </div>
                          </div>
                        </div>

                        <div
                          className="ticket-info-item"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              backgroundColor: "rgba(255, 192, 0, 0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--secondary)",
                            }}
                          >
                            <FaMoneyBillWave />
                          </div>
                          <div>
                            <div style={{ fontSize: "0.85rem", color: "#888" }}>
                              Prix
                            </div>
                            <div
                              style={{
                                fontWeight: "700",
                                fontSize: "1.1rem",
                                color: "var(--primary)",
                              }}
                            >
                              {formatCurrency(ticket.prix)}
                            </div>
                          </div>
                        </div>

                        <div
                          className="ticket-info-item"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              backgroundColor: "rgba(107, 72, 255, 0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--purple)",
                            }}
                          >
                            <FaUserAlt />
                          </div>
                          <div>
                            <div style={{ fontSize: "0.85rem", color: "#888" }}>
                              Vendeur
                            </div>
                            <div style={{ fontWeight: "500" }}>
                              {ticket.vendeur?.nom || "Non spécifié"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="ticket-actions"
                        style={{ display: "flex", gap: "10px", marginTop: "20px" }}
                      >
                        <button
                          className="btn btn-accent"
                          onClick={() => handleViewTicket(ticket.id)}
                          style={{ flex: "1" }}
                        >
                          <FaEye /> Voir les détails
                        </button>

                        {!ticket.estVendu && (
                          <button
                            className="btn btn-success"
                            onClick={() => handlePurchaseTicket(ticket.id)}
                            style={{ flex: "1" }}
                          >
                            <FaShoppingCart /> Acheter
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <div className="no-data-icon">
                  <FaTicketAlt />
                </div>
                <p>
                  Aucun ticket disponible. Cliquez sur le bouton "Afficher les
                  tickets" pour charger les données.
                </p>
              </div>
            )}

            {!loading && sortedTickets.length > 0 && (
              <div className="data-table-pagination" style={{ marginTop: "30px" }}>
                <div className="pagination-info">
                  Affichage de <strong>{sortedTickets.length}</strong> tickets
                </div>
                <div className="pagination-controls">
                  <button className="page-btn">1</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketsList;