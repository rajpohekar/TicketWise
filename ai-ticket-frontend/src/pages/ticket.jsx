import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, Shield, Clock, BrainCircuit, Activity, Tag, Sparkles } from "lucide-react";

const STATUS_COLORS = {
  TODO: "from-yellow-400 to-orange-500 text-yellow-950",
  IN_PROGRESS: "from-sky-400 to-indigo-500 text-white",
  DONE: "from-emerald-400 to-teal-500 text-white",
};

const PRIORITY_CLASSES = {
  high: "text-red-400 bg-red-500/10 border-red-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (res.ok) {
          setTicket(data.ticket);
        } else {
          setError(data.error || `Ticket not found or access denied (Status: ${res.status})`);
        }
      } catch (err) {
        setError("Could not connect to the server to fetch ticket details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchTicket();
    } else if (!token) {
      setError("You must be logged in to view tickets.");
      setLoading(false);
    } else {
      setError("Invalid ticket ID.");
      setLoading(false);
    }
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500"
        />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel modern-card p-12 max-w-md text-center"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Activity className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{error ? "Error Loading Ticket" : "Ticket Not Found"}</h2>
          <p className="text-slate-400 mb-8">{error || "The ticket you're looking for doesn't exist or you don't have access."}</p>
          <Link to="/" className="modern-btn inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-white">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 relative z-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all mb-8 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to tickets
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel modern-card p-8 lg:p-12 mb-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  Ticket #{ticket._id.slice(-6).toUpperCase()}
                </span>
                <span className={`inline-flex rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider bg-gradient-to-r shadow-lg ${STATUS_COLORS[ticket.status] || "from-slate-600 to-slate-700 text-white"}`}>
                  {ticket.status?.replace("_", " ")}
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">{ticket.title}</h1>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-3xl border border-white/5 bg-slate-900/50 p-8 shadow-inner">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  Description
                </h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg">{ticket.description}</p>
              </div>

              {ticket.helpfulNotes && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-3xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/5 p-8 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-[80px] rounded-full pointer-events-none" />
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-fuchsia-500/20 rounded-xl">
                      <BrainCircuit className="w-6 h-6 text-fuchsia-400" />
                    </div>
                    AI Insights & Suggestions
                  </h2>
                  <div className="prose prose-invert max-w-none text-slate-300">
                    <p className="whitespace-pre-wrap leading-relaxed text-lg">{ticket.helpfulNotes}</p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-white/5 bg-slate-900/50 p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Attributes
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" /> Priority
                    </p>
                    <span className={`inline-flex rounded-xl px-4 py-2 text-sm font-bold uppercase tracking-wide border ${PRIORITY_CLASSES[ticket.priority] || "border-slate-700 text-slate-400 bg-slate-800/50"}`}>
                      {ticket.priority || "Unassigned"}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Created
                    </p>
                    <p className="text-slate-300 font-medium">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      }) : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/5 bg-slate-900/50 p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                  <User className="w-4 h-4" /> People
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-3">Reporter</p>
                    <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-2xl border border-white/5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white font-bold shadow-lg">
                        {ticket.createdBy?.email?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <p className="text-slate-200 font-medium truncate">{ticket.createdBy?.email || "System User"}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-3">Assignee</p>
                    <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-2xl border border-white/5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold shadow-lg">
                        {ticket.assignedTo?.email?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <p className="text-slate-200 font-medium truncate">{ticket.assignedTo?.email || "Unassigned"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
