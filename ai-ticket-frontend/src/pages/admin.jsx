import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Shield, ShieldAlert, UserCog, Search, Edit2, Save, X, Activity } from "lucide-react";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ role: "", skills: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
        setFilteredUsers(data);
      } else {
        setMessage(data.error || "Unable to fetch users.");
      }
    } catch (err) {
      setMessage("Unable to reach the server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user.email);
    setFormData({ role: user.role, skills: user.skills?.join(", ") || "" });
    setMessage("");
  };

  const handleUpdate = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/update-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: editingUser,
          role: formData.role,
          skills: formData.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to update user.");
      } else {
        setEditingUser(null);
        setFormData({ role: "", skills: "" });
        fetchUsers();
        setMessage("User updated successfully.");
      }
    } catch (err) {
      setMessage("Update failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredUsers(users.filter((user) => user.email.toLowerCase().includes(query)));
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return {
          classes: "bg-red-500/10 border-red-500/30 text-red-400",
          icon: <ShieldAlert className="w-4 h-4" />
        };
      case "moderator":
        return {
          classes: "bg-purple-500/10 border-purple-500/30 text-purple-400",
          icon: <Shield className="w-4 h-4" />
        };
      case "user":
        return {
          classes: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          icon: <UserCog className="w-4 h-4" />
        };
      default:
        return {
          classes: "bg-slate-500/10 border-slate-500/30 text-slate-300",
          icon: <Users className="w-4 h-4" />
        };
    }
  };

  return (
    <div className="min-h-screen py-8 relative z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel modern-card p-10 mb-10 overflow-hidden relative"
        >
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-500/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 w-fit mb-6">
                <ShieldAlert className="w-4 h-4 text-violet-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-violet-300">
                  Command Center
                </p>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                User Management
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed">
                Control access levels, update roles, and maintain complete visibility over your workspace members.
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-3 w-full lg:w-auto">
              <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-sm shadow-inner text-center">
                <Users className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-3xl font-extrabold text-white">{users.length}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-2">Total</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-sm shadow-inner text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />
                <ShieldAlert className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-3xl font-extrabold text-white">{users.filter((user) => user.role === "admin").length}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-2">Admins</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-sm shadow-inner text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/50" />
                <Shield className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-3xl font-extrabold text-white">{users.filter((user) => user.role === "moderator").length}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-2">Mods</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel modern-card p-6 mb-8 flex flex-col sm:flex-row items-center gap-4"
        >
          <div className="w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search users by email..."
              className="modern-input w-full rounded-2xl pl-12 pr-4 py-4 text-slate-200 placeholder:text-slate-500 bg-slate-900/50"
            />
          </div>
        </motion.div>

        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm font-medium text-emerald-200 flex items-center gap-3">
                <Activity className="w-5 h-5 text-emerald-400" />
                {message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-6">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full" />
            </div>
          ) : (
            filteredUsers.length > 0 ? (
              <AnimatePresence>
                {filteredUsers.map((user, idx) => {
                  const roleBadge = getRoleBadge(user.role);
                  return (
                    <motion.div 
                      key={user._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass-panel modern-card p-6 lg:p-8 relative overflow-hidden group"
                    >
                      {editingUser === user.email ? (
                        <div className="space-y-6 relative z-10">
                          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                            <Edit2 className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-lg font-bold text-white">Editing User: {user.email}</h3>
                          </div>
                          
                          <div className="grid gap-6 lg:grid-cols-2">
                            <div>
                              <label className="block text-sm font-bold tracking-wide text-slate-300 uppercase mb-2">Role</label>
                              <select
                                className="modern-input w-full rounded-2xl px-4 py-4 text-slate-200 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center]"
                                value={formData.role}
                                onChange={(event) => setFormData({ ...formData, role: event.target.value })}
                              >
                                <option value="user" className="bg-slate-900">User</option>
                                <option value="moderator" className="bg-slate-900">Moderator</option>
                                <option value="admin" className="bg-slate-900">Admin</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-bold tracking-wide text-slate-300 uppercase mb-2">Skills (comma separated)</label>
                              <input
                                type="text"
                                value={formData.skills}
                                onChange={(event) => setFormData({ ...formData, skills: event.target.value })}
                                placeholder="JavaScript, React, Support..."
                                className="modern-input w-full rounded-2xl px-4 py-4 text-slate-200 placeholder:text-slate-600"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-4 mt-4 border-t border-white/5">
                            <button
                              type="button"
                              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                              onClick={() => setEditingUser(null)}
                            >
                              <X className="w-4 h-4" /> Cancel
                            </button>
                            <button
                              type="button"
                              className="modern-btn rounded-2xl px-8 py-3 text-sm font-bold text-white shadow-xl flex items-center justify-center gap-2"
                              onClick={handleUpdate}
                            >
                              <Save className="w-4 h-4" /> Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
                          <div className="flex items-center gap-5">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white text-xl font-bold shadow-lg shadow-indigo-500/20 flex-shrink-0">
                              {user.email?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="text-xl font-bold text-white mb-2">{user.email}</p>
                              <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${roleBadge.classes}`}>
                                  {roleBadge.icon}
                                  {user.role}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-8">
                            <div className="flex flex-wrap gap-2">
                              {user.skills && user.skills.length > 0 ? (
                                user.skills.slice(0, 3).map((skill) => (
                                  <span key={skill} className="rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur-sm">
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-500 text-sm italic">No skills listed</span>
                              )}
                              {user.skills?.length > 3 && (
                                <span className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-400">
                                  +{user.skills.length - 3} more
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              className="modern-btn rounded-xl px-6 py-3 text-sm font-bold shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                              onClick={() => handleEditClick(user)}
                            >
                              <Edit2 className="w-4 h-4" /> Edit User
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel modern-card p-16 text-center"
              >
                <div className="inline-flex bg-slate-800/50 p-4 rounded-full mb-4">
                  <Search className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No users found</h3>
                <p className="text-slate-400">Try adjusting your search terms.</p>
              </motion.div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
