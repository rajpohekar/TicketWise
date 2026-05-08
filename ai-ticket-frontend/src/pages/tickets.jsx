import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Filter, LayoutDashboard, Clock, CheckCircle2, Ticket } from "lucide-react";

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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Tickets() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const token = localStorage.getItem("token");

  const fetchTickets = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setTickets(data.tickets || []);
      } else {
        setFetchError(data.error || `Unable to load tickets (status ${res.status})`);
        setTickets([]);
      }
    } catch (error) {
      setFetchError("Unable to connect to the server. Please check your connection.");
      setTickets([]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTickets();
    }
  }, [token]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setSubmitError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSubmitError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (response.ok) {
        setTickets([data.ticket, ...tickets]);
        setForm({ title: "", description: "" });
        setIsFormExpanded(false);
      } else {
        setSubmitError(data.error || "Unable to create ticket.");
      }
    } catch (error) {
      setSubmitError("Unable to reach the server. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch = [ticket.title, ticket.description]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchQuery, statusFilter]);

  const counts = useMemo(() => {
    return tickets.reduce(
      (acc, ticket) => {
        if (ticket.status === "TODO") acc.todo += 1;
        if (ticket.status === "IN_PROGRESS") acc.inProgress += 1;
        if (ticket.status === "DONE") acc.done += 1;
        return acc;
      },
      { todo: 0, inProgress: 0, done: 0 }
    );
  }, [tickets]);

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Dashboard Header */}
        <motion.section 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-6 lg:grid-cols-[2fr_1fr] mb-10"
        >
          <div className="glass-panel modern-card p-10 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 w-fit mb-6">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
                AI Powered Workspace
              </p>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-white mb-4">
              Streamline your <span className="text-gradient">support</span> workflow.
            </h1>
            <p className="max-w-2xl text-slate-300 text-lg leading-relaxed">
              Create, track, and resolve tickets faster with our intelligent dashboard designed for modern teams.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10">
                <div className="flex items-center gap-3 text-slate-400 mb-2">
                  <LayoutDashboard className="w-5 h-5" />
                  <p className="text-sm font-medium uppercase tracking-wider">Total</p>
                </div>
                <p className="text-4xl font-bold text-white">{tickets.length}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10">
                <div className="flex items-center gap-3 text-sky-400 mb-2">
                  <Clock className="w-5 h-5" />
                  <p className="text-sm font-medium uppercase tracking-wider">Active</p>
                </div>
                <p className="text-4xl font-bold text-white">{counts.inProgress}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10">
                <div className="flex items-center gap-3 text-emerald-400 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <p className="text-sm font-medium uppercase tracking-wider">Resolved</p>
                </div>
                <p className="text-4xl font-bold text-white">{counts.done}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel modern-card p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <Filter className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">Filters</h2>
            </div>
            
            <div className="space-y-6 flex-grow">
              <div className="relative">
                <label className="block text-sm font-medium text-slate-300 mb-2">Search Tickets</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Keywords..."
                    className="modern-input w-full rounded-2xl pl-12 pr-4 py-4 text-slate-200 placeholder:text-slate-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="modern-input w-full rounded-2xl px-4 py-4 text-slate-200 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center]"
                >
                  <option value="all" className="bg-slate-900">All Statuses</option>
                  <option value="TODO" className="bg-slate-900">TODO</option>
                  <option value="IN_PROGRESS" className="bg-slate-900">In Progress</option>
                  <option value="DONE" className="bg-slate-900">Done</option>
                </select>
              </div>
            </div>

            <button
              onClick={fetchTickets}
              className="modern-btn mt-6 w-full rounded-2xl px-4 py-4 text-sm font-bold tracking-wide uppercase flex justify-center items-center gap-2"
            >
              Refresh Board
            </button>
          </div>
        </motion.section>

        {/* Create Ticket Form */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="glass-panel modern-card p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-500/20 p-3 rounded-2xl">
                  <Ticket className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Create New Ticket</h2>
                  <p className="text-slate-400 mt-1">Describe the issue clearly for faster resolution.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormExpanded((c) => !c)}
                className={`flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-semibold transition-all ${
                  isFormExpanded 
                    ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20" 
                    : "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                }`}
              >
                {isFormExpanded ? "Cancel" : <><Plus className="w-4 h-4" /> Open Form</>}
              </button>
            </div>

            <AnimatePresence>
              {isFormExpanded && (
                <motion.form 
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: "2rem" }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden space-y-5"
                  onSubmit={handleSubmit}
                >
                  <div className="grid gap-5 lg:grid-cols-2">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                      <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="E.g., Cannot login via Google SSO"
                        className="modern-input w-full rounded-2xl px-5 py-4 text-slate-200 placeholder:text-slate-600 focus:bg-indigo-500/5"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Provide steps to reproduce and expected behavior..."
                        rows={4}
                        className="modern-input w-full rounded-2xl px-5 py-4 text-slate-200 placeholder:text-slate-600 focus:bg-indigo-500/5"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {submitError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      {submitError}
                    </motion.div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="modern-btn rounded-2xl px-8 py-4 text-base font-bold shadow-xl shadow-indigo-500/20 flex items-center gap-2"
                      disabled={loading}
                    >
                      {loading ? "Creating..." : <><Plus className="w-5 h-5" /> Submit Ticket</>}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Tickets Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              Ticket Board
              <span className="text-sm font-medium px-3 py-1 bg-white/10 rounded-full text-slate-300">
                {filteredTickets.length}
              </span>
            </h2>
          </div>

          {fetchError && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200 mb-6">
              {fetchError}
            </div>
          )}

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2"
          >
            <AnimatePresence>
              {filteredTickets.map((ticket) => (
                <motion.div key={ticket._id} variants={itemVariants} layoutId={`ticket-${ticket._id}`}>
                  <Link
                    to={`/tickets/${ticket._id}`}
                    className="modern-card block h-full p-6 group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${PRIORITY_CLASSES[ticket.priority] || "border-slate-700 text-slate-400 bg-slate-800"}`}>
                        {ticket.priority || "Normal"}
                      </span>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold bg-gradient-to-r shadow-lg ${STATUS_COLORS[ticket.status] || "from-slate-600 to-slate-700 text-white"}`}>
                        {ticket.status?.replace("_", " ") || "Unknown"}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                      {ticket.title}
                    </h3>
                    
                    <p className="text-slate-400 text-sm line-clamp-2 mb-6">
                      {ticket.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 group-hover:text-indigo-400 transition-colors">
                        View Details →
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>

            {!loading && filteredTickets.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full glass-panel rounded-3xl border border-white/5 p-16 text-center"
              >
                <div className="inline-flex bg-slate-800/50 p-4 rounded-full mb-4">
                  <Search className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No tickets found</h3>
                <p className="text-slate-400 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="modern-btn rounded-2xl px-6 py-3 text-sm font-bold"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </motion.div>
        </section>
      </div>
    </div>
  );
}
