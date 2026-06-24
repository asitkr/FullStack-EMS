import { Loader2Icon, LockIcon, SaveIcon, X } from "lucide-react";
import { useState } from "react";

const ChangePasswordModal = ({ open, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
    }

    if(!open) return null;

    return (
        <div onClick={onClose} className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 pb-0">
                    <h2 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                        <LockIcon className="w-5 h-5 text-slate-400" /> Change Password
                    </h2>
                    <button
                        onClick={onClose}
                        className='p-2 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600'
                    >
                        <X className='w-5 h-5' />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {message?.text && (
                        <div className={`p-3 rounded-xl text-sm flex items-start gap-3 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${message?.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`}>
                                {message?.text}
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mmb-2">Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            required
                            className="bg-slate-50 text-slate-400 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mmb-2">New Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            required
                            className="bg-slate-50 text-slate-400 cursor-not-allowed"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1 items-center gap-2 justify-center w-full sm:w-auto cursor-pointer">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 justify-center w-full sm:w-auto cursor-pointer">
                            {loading ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ChangePasswordModal;