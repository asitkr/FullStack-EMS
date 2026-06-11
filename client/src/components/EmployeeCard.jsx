import { PencilIcon, Trash2Icon } from "lucide-react";

const EmployeeCard = ({employee, onDelete, onEdit }) => {
    const handleDelete = async () => {
        if(!confirm('Are you sure you want to delete this employee?'))
        return;
    }
    return (
        <div className="group relative card card-hover overflow-hidden">
            <div className="relative aspect-4/3 w-full overflow-hidden bg-linear-to-br from-slate-100 to-slate-50">
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-indigo-100 to-slate-100 flex items-center justify-center">
                        <span className="text-2xl font-medium text-indigo-400">{employee?.firstName[0]} {employee?.lastName[0]}</span>
                    </div>
                </div>
            </div>

            <div className="absolute top-3 left-3 flex gap-2">
                <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 text-sm font-semibold text-slate-600 rounded-lg shadow-sm">
                    {employee?.department || "Remote"}
                    {employee?.isDeleted && <span className="bg-red-500/60 font-medium text-white px-2.5 py-1 text-xs rounded">DELETED</span>}
                </span>
            </div>

            {!employee?.isDeleted && (
                <div className="absolute inset-0 bg-liner-to-r from-indigo-700/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6 gap-3">
                    <button onClick={() => onEdit(employee)} className="p-2.5 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-indigo-600 rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer">
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={handleDelete} className="p-2.5 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-rose-600 rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer">
                        <Trash2Icon className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="p-5">
                <h3 className="text-slate-900">{employee?.firstName} {employee?.lastName}</h3>
                <p className="text-xs text-slate-500">{employee?.position}</p>
            </div>
        </div>
    )
}

export default EmployeeCard;