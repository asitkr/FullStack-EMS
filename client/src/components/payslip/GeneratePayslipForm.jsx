import { Calendar1Icon, CalendarFoldIcon, DollarSignIcon, HandCoinsIcon, Loader2, Plus, User, X } from "lucide-react";
import { useState } from "react";

const GeneratePayslipForm = ({ employees, onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return (
        <button onClick={() => setIsOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Generate Payslip
        </button>
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
    }

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm'
        >
            <div className="card max-w-lg w-full p-6 animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Generate Monthly Payslip</h3>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                        <X size={20} className="cursor-pointer" />
                    </button>
                </div>
                <form className="space-y-4" onClick={handleSubmit}>
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                            <User className="w-4 h-4 text-slate-400" />
                            Employee
                        </label>
                        <select name="employeeId" required>
                            <option value="">Select Employee</option>
                            {employees?.map((e) => (
                                <option key={e?.id} value={e?.id}>
                                    {e?.firstName} {e?.lastName} ({e?.position})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                <Calendar1Icon className="w-4 h-4 text-slate-400" />
                                Month
                            </label>
                            <select name="month" required>
                                <option value="">Select Month</option>
                                {Array?.from({ length: 12 }, (_, i) => i + 1)?.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                <CalendarFoldIcon className="w-4 h-4 text-slate-400" />
                                Year
                            </label>
                            <input type="number" name="year" defaultValue={new Date().getFullYear()} />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                            <DollarSignIcon className="w-4 h-4 text-slate-400" />
                            Basic Salary
                        </label>
                        <input type="number" name="basicSalary" required placeholder='50000' />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                <HandCoinsIcon className="w-4 h-4 text-slate-400" />
                                Allowances
                            </label>
                            <input type="number" name="allowances" required defaultValue='0' />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                <HandCoinsIcon className="w-4 h-4 text-slate-400" />
                                Deductions
                            </label>
                            <input type="number" name="deductions" required defaultValue='0' />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setIsOpen(false)} type="button" className="btn-secondary">
                            Cancel
                        </button>
                        <button disabled={loading} type="submit" className="btn-primary flex items-center">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Generate
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default GeneratePayslipForm;