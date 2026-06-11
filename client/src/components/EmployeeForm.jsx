import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEPARTMENTS } from '../assets/assets';
import { Loader2Icon } from 'lucide-react';

const EmployeeForm = ({ initialData, onSuccess, onCancel }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const isEditMode = !!initialData;

    const handleSubmit = async (e) => {
        e.preventDefault();
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-6 max-w-3xl animate-fade-in'>
            <div className='card p-5 sm:p-6'>
                <h3 className='font-medium mb-6 pb-4 border-b border-slate-100'>Personal Information</h3>
                <div className='grid grid-col-1 sm:grid-cols-2 gap-5 text-sm text-slate-500'>
                    <div>
                        <label className='block mb-2'>First Name</label>
                        <input type="text" name='firstName' required defaultValue={initialData?.firstName} />
                    </div>
                    <div>
                        <label className='block mb-2'>Last Name</label>
                        <input type="text" name='lastName' required defaultValue={initialData?.lastName} />
                    </div>
                    <div>
                        <label className='block mb-2'>Phone Number</label>
                        <input type="text" name='phone' required defaultValue={initialData?.phone} />
                    </div>
                    <div>
                        <label className='block mb-2'>Join Date</label>
                        <input type="date" name='joinDate' required defaultValue={initialData?.joinDate ? new Date(initialData?.joinDate).toISOString().split('T')[0] : ''} />
                    </div>
                    <div className='sm:col-span-2'>
                        <label className='block mb-2'>Bio (Optional)</label>
                        <textarea type="text" name='bio' required defaultValue={initialData?.bio} rows={3} className='resize-none' placeholder='Brief description...' />
                    </div>
                </div>
            </div>

            {/* Employee Details */}
            <div className='card p-5 sm:p-6'>
                <h3 className='text-base font-medium text-slate-900 mb-6 pb-4 border-b border-slate-100'>Employee Details</h3>
                <div className='grid grid-col-1 sm:grid-cols-2 gap-5 text-sm text-slate-700'>
                    <div>
                        <label className='block mb-2'>Department</label>
                        <select name='department' required defaultValue={initialData?.department || ''}>
                            {DEPARTMENTS?.map((deptName) => (
                                <option key={deptName} value={deptName}>
                                    {deptName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className='block mb-2'>Position</label>
                        <input type="text" name='position' required defaultValue={initialData?.position} />
                    </div>
                    <div>
                        <label className='block mb-2'>Basic Salary</label>
                        <input type="number" name='basicSalary' required min='0' step='0.01' defaultValue={initialData?.basicSalary || 0} />
                    </div>
                    <div>
                        <label className='block mb-2'>Position</label>
                        <input type="text" name='position' required defaultValue={initialData?.position} />
                    </div>
                    <div>
                        <label className='block mb-2'>Allowances</label>
                        <input type="text" name='allowances' required min='0' step='0.01' defaultValue={initialData?.allowances || 0} />
                    </div>
                    <div>
                        <label className='block mb-2'>Deductions</label>
                        <input type="text" name='deductions' required min='0' step='0.01' defaultValue={initialData?.deductions || 0} />
                    </div>
                    {isEditMode && (
                        <div>
                            <label className='block mb-2'>Status</label>
                            <select name='employmentStatus' defaultValue={initialData?.employmentStatus}>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Account Setup */}
            <div className='card p-5 sm:p-6'>
                <h3 className='text-base font-medium text-slate-900 mb-6 pb-4 border-b border-slate-100'>Account Setup</h3>
                <div className='grid grid-col-1 sm:grid-cols-2 gap-5 text-sm text-slate-500'>
                    <div className='sm:col-span-2'>
                        <label className='block mb-2'>Work Email</label>
                        <input type="email" name='email' required defaultValue={initialData?.email} />
                    </div>
                    {!isEditMode && (
                        <div className='sm:col-span-2'>
                            <label className='block mb-2'>Temporary Password</label>
                            <input type="password" name='password' required />
                        </div>
                    )}
                    {isEditMode && (
                        <div>
                            <label className='block mb-2'>Change Password (Optional)</label>
                            <input type="password" name='password' required placeholder='Leave blank to keep current' />
                        </div>
                    )}
                    <div>
                            <label className='block mb-2'>System Role</label>
                            <select name='role' defaultValue={initialData?.user?.role || 'EMPLOYEE'}>
                                <option value='EMPLOYEE'>Employee</option>
                                <option value='ADMIN'>Admin</option>
                            </select>
                        </div>
                </div>
            </div>

            {/* buttons */}
            <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2'>
                <button type='button' className='btn-secondary' onClick={() => (onCancel ? onCancel() : navigate(-1))}>
                    Cancel
                </button>
                <button type='submit' disabled={loading} className='btn-primary flex items-center justify-center'>
                    {loading && <Loader2Icon className='w-4 h-4 mr-2 animate-spin' />}
                    {isEditMode ? 'Update Employee' : 'Create Employee'}
                </button>
            </div>
        </form>
    )
}

export default EmployeeForm;