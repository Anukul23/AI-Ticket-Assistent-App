import { useState, useEffect } from "react";
import { useToast } from "../components/ToastContext.jsx";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const token = localStorage.getItem("token");
  const { showError } = useToast();

  const fetchDashboardStats = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        showError("Failed to fetch dashboard stats");
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      showError("Error fetching dashboard stats");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Dashboard Unavailable</h2>
          <button onClick={fetchDashboardStats} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={fetchDashboardStats}
          disabled={refreshing}
          className="btn btn-primary"
        >
          {refreshing ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card bg-blue-500 text-white">
          <div className="card-body">
            <h3 className="card-title text-white">Total Tickets</h3>
            <p className="text-3xl font-bold">{stats.overview.totalTickets}</p>
          </div>
        </div>

        <div className="card bg-green-500 text-white">
          <div className="card-body">
            <h3 className="card-title text-white">Today</h3>
            <p className="text-3xl font-bold">{stats.overview.todayTickets}</p>
          </div>
        </div>

        <div className="card bg-yellow-500 text-white">
          <div className="card-body">
            <h3 className="card-title text-white">This Week</h3>
            <p className="text-3xl font-bold">{stats.overview.weekTickets}</p>
          </div>
        </div>

        <div className="card bg-purple-500 text-white">
          <div className="card-body">
            <h3 className="card-title text-white">This Month</h3>
            <p className="text-3xl font-bold">{stats.overview.monthTickets}</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Resolution Rate</h3>
            <div className="flex items-center gap-2">
              <div className="radial-progress text-primary" style={{ "--value": stats.overview.resolutionRate }}>
                {stats.overview.resolutionRate}%
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.overview.resolvedTickets}</p>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Avg Resolution Time</h3>
            <p className="text-3xl font-bold text-primary">{stats.overview.avgResolutionDays}</p>
            <p className="text-sm text-gray-600">Days</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Pending Tickets</h3>
            <p className="text-3xl font-bold text-warning">
              {(stats.statusBreakdown.TODO || 0) + (stats.statusBreakdown.IN_PROGRESS || 0)}
            </p>
            <p className="text-sm text-gray-600">TODO + In Progress</p>
          </div>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Status Breakdown */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Status Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="badge badge-warning">TODO</span>
                <span className="font-bold">{stats.statusBreakdown.TODO || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="badge badge-info">IN_PROGRESS</span>
                <span className="font-bold">{stats.statusBreakdown.IN_PROGRESS || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="badge badge-success">DONE</span>
                <span className="font-bold">{stats.statusBreakdown.DONE || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Priority Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="badge badge-error">High</span>
                <span className="font-bold">{stats.priorityBreakdown.high || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="badge badge-warning">Medium</span>
                <span className="font-bold">{stats.priorityBreakdown.medium || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="badge badge-success">Low</span>
                <span className="font-bold">{stats.priorityBreakdown.low || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Level Breakdown */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Level Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="badge badge-primary">L1</span>
                <span className="font-bold">{stats.levelBreakdown.L1 || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="badge badge-secondary">L2</span>
                <span className="font-bold">{stats.levelBreakdown.L2 || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="badge badge-accent">L3</span>
                <span className="font-bold">{stats.levelBreakdown.L3 || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h3 className="card-title">Team Performance</h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Total Assigned</th>
                  <th>TODO</th>
                  <th>In Progress</th>
                  <th>Done</th>
                  <th>Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.teamAssignments.map((member, index) => (
                  <tr key={index}>
                    <td className="font-medium">{member._id}</td>
                    <td>{member.totalAssigned}</td>
                    <td>
                      <span className="badge badge-warning">{member.todo}</span>
                    </td>
                    <td>
                      <span className="badge badge-info">{member.inProgress}</span>
                    </td>
                    <td>
                      <span className="badge badge-success">{member.done}</span>
                    </td>
                    <td>
                      <span className="font-bold">
                        {member.totalAssigned > 0
                          ? Math.round((member.done / member.totalAssigned) * 100)
                          : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Recent Tickets</h3>
          <div className="space-y-3">
            {stats.recentTickets.map((ticket) => (
              <div key={ticket._id} className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{ticket.title}</h4>
                  <p className="text-sm text-gray-600">
                    Created by: {ticket.createdBy?.email || 'Unknown'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge badge-sm ${ticket.status === 'TODO' ? 'badge-warning' :
                      ticket.status === 'IN_PROGRESS' ? 'badge-info' :
                        'badge-success'
                    }`}>
                    {ticket.status}
                  </span>
                  <span className={`badge badge-sm ${ticket.priority === 'high' ? 'badge-error' :
                      ticket.priority === 'medium' ? 'badge-warning' :
                        'badge-success'
                    }`}>
                    {ticket.priority}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
