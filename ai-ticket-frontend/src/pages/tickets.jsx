import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../components/ToastContext.jsx";

export default function Tickets() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState("user");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTickets: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  });

  const token = localStorage.getItem("token");
  const { showSuccess, showError, showInfo } = useToast();

  // Get user role from token
  useEffect(() => {
    const getUserRole = () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUserRole(payload.role || "user");
        }
      } catch (error) {
        console.error("Error parsing token:", error);
        setUserRole("user");
      }
    };
    getUserRole();
  }, []);

  const fetchTickets = async (page = 1) => {
    try {
      setRefreshing(true);
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/tickets?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      });
      const data = await res.json();

      if (data.tickets && data.pagination) {
        setTickets(data.tickets);
        setPagination(data.pagination);
        setCurrentPage(data.pagination.currentPage);
      } else {
        // Fallback for old API format
        setTickets(data || []);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalTickets: data?.length || 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 10
        });
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchTickets(newPage);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({ title: "", description: "" });

        // Show success message
        showSuccess("Ticket created successfully! AI analysis is being processed...");

        // Wait a bit for AI processing, then refresh current page
        setTimeout(() => {
          fetchTickets(currentPage);
        }, 3000); // Wait 3 seconds for AI processing

        // Also refresh immediately to show the ticket
        fetchTickets(currentPage);
      } else {
        showError(data.message || data.error || "Ticket creation failed");
      }
    } catch (err) {
      showError("Error creating ticket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/tickets/${ticketId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Refresh the current page to show updated status
        fetchTickets(currentPage);
        showInfo(`Ticket status updated to ${newStatus}`);
      } else {
        const errorData = await res.json();
        showError(errorData.message || "Failed to update ticket status");
      }
    } catch (err) {
      console.error("Error updating ticket status:", err);
      showError("Error updating ticket status");
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Ticket</h2>

      <form onSubmit={handleSubmit} className="space-y-3 mb-8">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Ticket Title"
          className="input input-bordered w-full"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Ticket Description"
          className="textarea textarea-bordered w-full"
          required
        ></textarea>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
        {userRole === "user" ? "My Assigned Tickets" : "All Tickets"}
        <button
          onClick={() => fetchTickets(currentPage)}
          disabled={refreshing}
          className="btn btn-sm btn-outline"
        >
          {refreshing ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </h2>

      {userRole === "user" && (
        <div className="alert alert-info mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>You are viewing tickets assigned to you. Only admins can see all tickets.</span>
        </div>
      )}
      <div className="space-y-3">
        {tickets.map((ticket) => (
          <Link
            key={ticket._id}
            className="card shadow-md p-4 bg-base-100 hover:shadow-lg transition-shadow"
            to={`/tickets/${ticket._id}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{ticket.title}</h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <span className={`badge badge-sm ${ticket.status === 'TODO' ? 'badge-warning' :
                    ticket.status === 'IN_PROGRESS' ? 'badge-info' :
                      ticket.status === 'DONE' ? 'badge-success' : 'badge-neutral'
                    }`}>
                    {ticket.status}
                  </span>

                  {/* Quick Status Update */}
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-xs btn-ghost">
                      ⚙️
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                      <li>
                        <button
                          onClick={() => handleStatusUpdate(ticket._id, "TODO")}
                          disabled={ticket.status === "TODO"}
                          className={ticket.status === "TODO" ? "text-gray-400" : ""}
                        >
                          📋 TODO
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleStatusUpdate(ticket._id, "IN_PROGRESS")}
                          disabled={ticket.status === "IN_PROGRESS"}
                          className={ticket.status === "IN_PROGRESS" ? "text-gray-400" : ""}
                        >
                          🔄 IN_PROGRESS
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleStatusUpdate(ticket._id, "DONE")}
                          disabled={ticket.status === "DONE"}
                          className={ticket.status === "DONE" ? "text-gray-400" : ""}
                        >
                          ✅ DONE
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                {ticket.priority && (
                  <span className={`badge badge-sm ${ticket.priority === 'high' ? 'badge-error' :
                    ticket.priority === 'medium' ? 'badge-warning' :
                      'badge-success'
                    }`}>
                    {ticket.priority}
                  </span>
                )}
                {ticket.level && (
                  <span className={`badge badge-sm ${ticket.level === 'L1' ? 'badge-primary' :
                    ticket.level === 'L2' ? 'badge-secondary' :
                      'badge-accent'
                    }`}>
                    {ticket.level}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
              <div className="flex flex-col items-end gap-1">
                {ticket.assignedTo && (
                  <span className="text-blue-600">
                    📋 Assigned to: {ticket.assignedTo.email}
                  </span>
                )}
                {userRole !== "user" && ticket.createdBy && (
                  <span className="text-green-600">
                    👤 Created by: {ticket.createdBy.email}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
        {tickets.length === 0 && <p>No tickets submitted yet.</p>}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 p-4 bg-base-200 rounded-lg">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.totalTickets)} of {pagination.totalTickets} tickets
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="btn btn-sm btn-outline"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="btn btn-sm btn-outline"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
