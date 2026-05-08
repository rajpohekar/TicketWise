export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-slate-950/40 backdrop-blur-md py-10 mt-auto relative z-10">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                <div>
                    <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-[10px]">AI</span>
                        TicketWise
                    </h3>
                    <p className="text-slate-400 text-sm">Crafted for fast, intelligent support workflows.</p>
                </div>
                <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-500">
                    <a href="/" className="transition-colors hover:text-indigo-400">Dashboard</a>
                    <a href="/login" className="transition-colors hover:text-indigo-400">Login</a>
                    <a href="/signup" className="transition-colors hover:text-indigo-400">Signup</a>
                </div>
            </div>
        </footer>
    );
}
