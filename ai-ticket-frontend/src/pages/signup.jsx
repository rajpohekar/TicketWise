import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Mail, Lock, Rocket, Sparkles } from "lucide-react";

export default function SignupPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        setError(data.error || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center relative z-10">
      <div className="mx-auto flex max-w-6xl w-full flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:w-1/2"
        >
          <div className="glass-panel modern-card rounded-[3rem] p-12 relative overflow-hidden">
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-fuchsia-500/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl border border-white/10 mb-8 backdrop-blur-md">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
                Start your <br/>
                <span className="text-gradient-cyan">journey here.</span>
              </h1>
              <p className="text-lg text-slate-300 mb-12 max-w-md">
                Create your account to experience a fully modern, AI-powered support desk tailored for high-performing teams.
              </p>

              <div className="grid gap-6">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 flex items-start gap-5 backdrop-blur-sm"
                >
                  <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Boost Productivity</h3>
                    <p className="text-sm text-slate-400">Organize tickets, track progress, and close issues faster than ever.</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 flex items-start gap-5 backdrop-blur-sm"
                >
                  <div className="p-3 bg-fuchsia-500/10 rounded-2xl text-fuchsia-400">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Seamless Onboarding</h3>
                    <p className="text-sm text-slate-400">Get set up in seconds. An intuitive interface built for zero learning curve.</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="lg:w-5/12"
        >
          <div className="glass-panel modern-card rounded-[3rem] p-10 lg:p-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-white mb-3">Create Account</h2>
              <p className="text-slate-400 text-lg">Sign up to get started immediately</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold tracking-wide text-slate-300 uppercase ml-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className="modern-input w-full rounded-2xl pl-12 pr-4 py-4 text-slate-200 placeholder:text-slate-600 focus:bg-cyan-500/5 transition-colors"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold tracking-wide text-slate-300 uppercase ml-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Create a strong password"
                    className="modern-input w-full rounded-2xl pl-12 pr-4 py-4 text-slate-200 placeholder:text-slate-600 focus:bg-cyan-500/5 transition-colors"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-200 text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="modern-btn w-full rounded-2xl px-6 py-4 text-lg font-bold shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 mt-4"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    Creating Account...
                  </span>
                ) : (
                  <>
                    Sign Up <UserPlus className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-10 text-center text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
                Log in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
