import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";

import LoginLeftSide from "./LoginLeftSide";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const LoginForm = ({ role, title, subtitle }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await login(email, password, role);
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || error.message || 'Login Failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <LoginLeftSide />
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-white">
                <div className="w-full max-w-md animate-fade-in">
                    <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm mb-10 transition-colors">
                        <ArrowLeftIcon size={16} /> Back to  portals
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-medium text-zinc-800">{title}</h1>
                        <p className="text-slate-500 text-sm sm:text-base mt-2">{subtitle}</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200text-rose-700 text-sm rounded-xl flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        {error}
                    </div>
                )}

                <form className="w-full space-y-5 ml-52 pr-60" onSubmit={handleSubmit}>
                    <div className="">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="pr-11"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full cursor-pointer py-3 bg-linear-to-r from-indigo-600 to-indigo-500 text-white rounded-md text-sm font-semibold hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-indigo-500/25 active:scale-[0.98] flex items-center justify-center"
                    >
                        {loading && <Loader2Icon className="animate-spin h-4 w-4 mr-2" />}
                        Sign in
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginForm;