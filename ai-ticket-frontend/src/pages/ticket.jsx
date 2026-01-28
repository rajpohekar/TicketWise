import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // Import Link
// Consider using a dedicated markdown renderer if needed, ReactMarkdown is basic
// import ReactMarkdown from "react-markdown";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State for errors

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      setError(null); // Reset error
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();

        // Check status code correctly (backend sends 200 on success now)
        if (res.ok) {
          setTicket(data.ticket);
        } else {
          console.error("Failed to fetch ticket:", data.message || `HTTP error ${res.status}`);
          setError(data.message || `Ticket not found or access denied (Status: ${res.status})`);
        }
      } catch (err) {
        console.error("Network or other error fetching ticket:", err);
        setError("Could not connect to the server to fetch ticket details.");
      } finally {
        setLoading(false);
      }
    };

    if (token && id) { // Ensure token and id exist before fetching
      fetchTicket();
    } else if (!token) {
        setError("You must be logged in to view tickets.");
        setLoading(false);
    } else {
        setError("Invalid ticket ID.");
        setLoading(false);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]); // Depend on id and token

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
             <span className="loading loading-spinner loading-lg"></span>
        </div>
    );
  }

  if (error) {
     return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!ticket) {
      // This case might not be reached if error handles not found, but kept as safeguard
      return <div className="text-center mt-10">Ticket not found.</div>;
  }

  // Helper function to format status/priority
  const formatValue = (value) => value ? value.replace('_', ' ').toLowerCase() : 'N/A';

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
       {/* Back link */}
       <Link to="/" className="btn btn-ghost btn-sm mb-4">
            &larr; Back to Tickets
       </Link>

      <h2 className="text-3xl font-bold mb-4">Ticket Details</h2>

      <div className="card bg-base-100 border border-base-300 shadow p-6 space-y-4">
        <h3 className="text-2xl font-semibold mb-2">{ticket.title}</h3>
        <p className="text-base-content/80 whitespace-pre-wrap">{ticket.description}</p>

        {/* Separator */}
        <div className="divider my-4"></div>

        {/* Metadata Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
                 <strong className="text-base-content/70 block mb-1">Status:</strong>
                 <span className={`badge ${
                     ticket.status === 'TODO' ? 'badge-warning' :
                     ticket.status === 'IN_PROGRESS' ? 'badge-info' :
                     ticket.status === 'DONE' ? 'badge-success' : 'badge-ghost'
                 }`}>
                     {formatValue(ticket.status)}
                 </span>
            </div>
             <div>
                 <strong className="text-base-content/70 block mb-1">Priority:</strong>
                  <span className={`badge ${
                      ticket.priority === 'high' ? 'badge-error' :
                      ticket.priority === 'medium' ? 'badge-warning' :
                      ticket.priority === 'low' ? 'badge-success' : 'badge-ghost'
                  }`}>
                      {formatValue(ticket.priority)}
                  </span>
             </div>
             <div>
                 <strong className="text-base-content/70 block mb-1">Created By:</strong>
                 <span>{ticket.createdBy?.email || 'Unknown'}</span>
             </div>
             <div>
                 <strong className="text-base-content/70 block mb-1">Assigned To:</strong>
                 <span>{ticket.assignedTo?.email || 'Unassigned'}</span>
             </div>
             <div className="md:col-span-2">
                 <strong className="text-base-content/70 block mb-1">Related Skills:</strong>
                 {ticket.relatedSkills?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {ticket.relatedSkills.map(skill => (
                        <span key={skill} className="badge badge-outline badge-sm">{skill}</span>
                      ))}
                    </div>
                  ) : (
                    <span>N/A</span>
                  )}
             </div>
             <div className="md:col-span-2">
                 <strong className="text-base-content/70 block mb-1">Created At:</strong>
                 <span>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/A'}</span>
             </div>
        </div>


        {/* Helpful Notes Section (if available) */}
        {ticket.helpfulNotes && (
          <>
            <div className="divider my-4">AI Notes</div>
            <div>
              <strong className="text-base-content/70 block mb-2">Helpful Notes:</strong>
              {/* Use a div with prose for better markdown rendering if using ReactMarkdown */}
              {/* For basic display, pre-wrap preserves formatting */}
              <div className="prose prose-sm max-w-none bg-base-200 p-3 rounded whitespace-pre-wrap">
                  {/* If using ReactMarkdown: <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown> */}
                  {ticket.helpfulNotes}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}