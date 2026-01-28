import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Tickets() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null); // State for fetch errors
  const [submitError, setSubmitError] = useState(null); // State for submit errors

  const token = localStorage.getItem("token");

  const fetchTickets = async () => {
    setLoading(true); // Indicate loading starts
    setFetchError(null); // Reset error before fetching
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      });
      const data = await res.json();
      if (res.ok) {
        // Corrected: Expect data to be { tickets: [...] }
        setTickets(data.tickets || []);
      } else {
        // Handle API errors more gracefully
        console.error("Failed to fetch tickets:", data.message || `HTTP error ${res.status}`);
        setFetchError(data.message || `Failed to load tickets (Status: ${res.status})`);
        setTickets([]); // Clear tickets on error
      }
    } catch (err) {
      console.error("Network or other error fetching tickets:", err);
      setFetchError("Could not connect to the server to fetch tickets.");
      setTickets([]); // Clear tickets on error
    } finally {
      setLoading(false); // Indicate loading finished
    }
  };

  useEffect(() => {
    if (token) { // Only fetch if token exists
        fetchTickets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Re-fetch if token changes (e.g., after login)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null); // Reset submit error
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({ title: "", description: "" }); // Clear form
        // Add the new ticket immediately to the list for better UX
        // Assuming the backend returns the created ticket
        if (data.ticket) {
            setTickets([data.ticket, ...tickets]);
        } else {
            // Or refetch if the returned ticket isn't available/complete
            fetchTickets();
        }
      } else {
        console.error("Ticket creation failed:", data.message);
        setSubmitError(data.message || `Ticket creation failed (Status: ${res.status})`);
        // Don't use alert, show error message in UI
        // alert(data.message || "Ticket creation failed");
      }
    } catch (err) {
      console.error("Error creating ticket:", err);
      setSubmitError("Could not connect to the server to create ticket.");
      // alert("Error creating ticket");
    } finally {
      setLoading(false);
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
          disabled={loading} // Disable input while submitting
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Ticket Description"
          className="textarea textarea-bordered w-full"
          required
          disabled={loading} // Disable input while submitting
          rows={3} // Give textarea a bit more initial height
        ></textarea>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
        {/* Display submit error message */}
        {submitError && <p className="text-red-500 text-sm mt-2">{submitError}</p>}
      </form>

      <div className="divider"></div>

      <h2 className="text-xl font-semibold mb-4">Your Tickets</h2>

      {/* Display fetch error message */}
      {fetchError && <p className="text-red-500 text-sm mb-4">{fetchError}</p>}

      {/* Show loading indicator for fetching */}
      {loading && !tickets.length && <p>Loading tickets...</p>}

      <div className="space-y-3">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <Link
              key={ticket._id}
              // Use block for better click area, added hover effect
              className="card card-compact shadow hover:shadow-lg transition-shadow duration-200 p-4 bg-base-100 border border-base-300 block"
              to={`/tickets/${ticket._id}`}
            >
              <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg mb-1">{ticket.title}</h3>
                  {/* Show status badge if available */}
                  {ticket.status && (
                    <span className={`badge badge-sm ${
                        ticket.status === 'TODO' ? 'badge-warning' :
                        ticket.status === 'IN_PROGRESS' ? 'badge-info' :
                        ticket.status === 'DONE' ? 'badge-success' : 'badge-ghost'
                    }`}>
                        {ticket.status.replace('_', ' ')}
                    </span>
                   )}
              </div>
              {/* Truncate long descriptions */}
              <p className="text-sm text-base-content/70 line-clamp-2">{ticket.description}</p>
              <p className="text-xs text-base-content/50 mt-2">
                Created: {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </Link>
          ))
        ) : (
          // Only show "No tickets" if not loading and no error occurred
          !loading && !fetchError && <p>No tickets submitted yet.</p>
        )}
      </div>
    </div>
  );
}