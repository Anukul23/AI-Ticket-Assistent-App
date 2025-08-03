import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useToast } from "../components/ToastContext.jsx";

export default function TicketDetailsPage() {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { showSuccess, showError } = useToast();

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

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          method: "GET",
        });

        if (res.ok) {
          const data = await res.json();
          setTicket(data.ticket);
        } else {
          showError("Failed to fetch ticket details");
          navigate("/");
        }
      } catch (err) {
        console.error("Error fetching ticket:", err);
        showError("Error fetching ticket details");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, token, navigate]);

  const handleStatusUpdate = async (newStatus) => {
    if (!ticket || updating) return;

    setUpdating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setTicket(data.ticket);
        showSuccess(`Ticket status updated to ${newStatus}`);
      } else {
        const errorData = await res.json();
        showError(errorData.message || "Failed to update ticket status");
      }
    } catch (err) {
      console.error("Error updating ticket status:", err);
      showError("Error updating ticket status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ticket Not Found</h2>
          <Link to="/" className="btn btn-primary">
            Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link to="/" className="btn btn-sm btn-outline">
          ← Back to Tickets
        </Link>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">{ticket.title}</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Description</h3>
              <p className="text-gray-500">{ticket.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold">Status</h3>
                <div className="flex items-center gap-2">
                  <span className={`badge ${ticket.status === 'TODO' ? 'badge-warning' :
                    ticket.status === 'IN_PROGRESS' ? 'badge-info' :
                      ticket.status === 'DONE' ? 'badge-success' : 'badge-neutral'
                    }`}>
                    {ticket.status}
                  </span>

                  {/* Status Update Dropdown */}
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-xs btn-outline">
                      {updating ? "Updating..." : "Change"}
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li>
                        <button
                          onClick={() => handleStatusUpdate("TODO")}
                          disabled={ticket.status === "TODO" || updating}
                          className={ticket.status === "TODO" ? "text-gray-400" : ""}
                        >
                          📋 TODO
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleStatusUpdate("IN_PROGRESS")}
                          disabled={ticket.status === "IN_PROGRESS" || updating}
                          className={ticket.status === "IN_PROGRESS" ? "text-gray-400" : ""}
                        >
                          🔄 IN_PROGRESS
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleStatusUpdate("DONE")}
                          disabled={ticket.status === "DONE" || updating}
                          className={ticket.status === "DONE" ? "text-gray-400" : ""}
                        >
                          ✅ DONE
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {ticket.priority && (
                <div>
                  <h3 className="font-semibold">Priority</h3>
                  <span className={`badge ${ticket.priority === 'high' ? 'badge-error' :
                    ticket.priority === 'medium' ? 'badge-warning' :
                      'badge-success'
                    }`}>
                    {ticket.priority}
                  </span>
                </div>
              )}

              {ticket.level && (
                <div>
                  <h3 className="font-semibold">Level</h3>
                  <span className={`badge ${ticket.level === 'L1' ? 'badge-primary' :
                    ticket.level === 'L2' ? 'badge-secondary' :
                      'badge-accent'
                    }`}>
                    {ticket.level}
                  </span>
                </div>
              )}
            </div>

            {ticket.assignedTo && (
              <div>
                <h3 className="font-semibold">Assigned To</h3>
                <p className="text-gray-500">{ticket.assignedTo.email}</p>
              </div>
            )}

            {ticket.createdBy && (
              <div>
                <h3 className="font-semibold">Created By</h3>
                <p className="text-gray-500">{ticket.createdBy.email}</p>
              </div>
            )}

            {userRole === "user" && ticket.assignedTo && (
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>This ticket has been assigned to you. You can update its status and work on resolving the issue.</span>
              </div>
            )}

            {ticket.helpfulNotes && (
              <div>
                <h3 className="font-semibold text-lg">AI Analysis & Notes</h3>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <p className="text-gray-900 whitespace-pre-wrap">{ticket.helpfulNotes}</p>
                </div>
              </div>
            )}

            {ticket.relatedSkills && ticket.relatedSkills.length > 0 && (
              <div>
                <h3 className="font-semibold">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {ticket.relatedSkills.map((skill, index) => (
                    <span key={index} className="badge badge-primary">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              Created: {new Date(ticket.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
