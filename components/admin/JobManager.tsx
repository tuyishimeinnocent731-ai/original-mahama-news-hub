import React, { useState, useEffect } from 'react';
import { JobPosting } from '../../types';
import * as navigationService from '../../services/navigationService';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../LoadingSpinner';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { UserGroupIcon } from '../icons/UserGroupIcon';
import ToggleSwitch from '../ToggleSwitch';
import JobApplicationsModal from './JobApplicationsModal';

type JobFormData = Omit<JobPosting, 'id' | 'created_at'>;

const JobManager: React.FC = () => {
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
    const [formData, setFormData] = useState<JobFormData>({ title: '', location: '', type: 'Full-time', description: '', is_active: true });
    const [viewingApplicantsJob, setViewingApplicantsJob] = useState<JobPosting | null>(null);
    const { addToast } = useToast();

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const data = await navigationService.getJobPostings();
            setJobs(data);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleEditClick = (job: JobPosting) => {
        setEditingJob(job);
        setFormData({ title: job.title, location: job.location, type: job.type, description: job.description, is_active: job.is_active });
        setIsFormVisible(true);
    };

    const handleNewClick = () => {
        setEditingJob(null);
        setFormData({ title: '', location: '', type: 'Full-time', description: '', is_active: true });
        setIsFormVisible(true);
    };

    const handleDelete = async (jobId: number) => {
        if (window.confirm('Are you sure you want to delete this job posting?')) {
            try {
                await navigationService.deleteJob(jobId);
                addToast('Job posting deleted.', 'success');
                fetchJobs();
            } catch (error: any) {
                addToast(error.message, 'error');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingJob) {
                await navigationService.updateJob(editingJob.id, formData);
                addToast('Job posting updated!', 'success');
            } else {
                await navigationService.createJob(formData);
                addToast('Job posting created!', 'success');
            }
            setIsFormVisible(false);
            fetchJobs();
        } catch (error: any) {
            addToast(error.message, 'error');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Manage Jobs</h3>
                {!isFormVisible && (
                    <button onClick={handleNewClick} className="px-4 py-2 bg-accent text-accent-foreground rounded-md font-semibold">
                        Add New Job
                    </button>
                )}
            </div>

            {isFormVisible && (
                <form onSubmit={handleSubmit} className="p-4 border rounded-lg space-y-4 mb-8">
                    <h4 className="font-semibold">{editingJob ? 'Edit Job' : 'New Job'}</h4>
                    <input type="text" placeholder="Job Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full p-2 border rounded-md" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required className="w-full p-2 border rounded-md" />
                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full p-2 border rounded-md">
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Contract</option>
                        </select>
                    </div>
                    <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required rows={5} className="w-full p-2 border rounded-md" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ToggleSwitch id="is_active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                            <label htmlFor="is_active">Active</label>
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setIsFormVisible(false)} className="px-4 py-2 bg-secondary rounded-md">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-accent text-accent-foreground rounded-md">{editingJob ? 'Save Changes' : 'Create Job'}</button>
                        </div>
                    </div>
                </form>
            )}

            {isLoading ? <LoadingSpinner /> : (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-secondary">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Title</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {jobs.map(job => (
                                <tr key={job.id}>
                                    <td className="px-4 py-3">
                                        <p className="font-semibold">{job.title}</p>
                                        <p className="text-xs text-muted-foreground">{job.location} &bull; {job.type}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${job.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {job.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 space-x-2">
                                        <button onClick={() => setViewingApplicantsJob(job)} className="p-1 hover:bg-secondary rounded-md" title="View Applicants"><UserGroupIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleEditClick(job)} className="p-1 hover:bg-secondary rounded-md" title="Edit"><PencilIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDelete(job.id)} className="p-1 hover:bg-secondary rounded-md" title="Delete"><TrashIcon className="w-5 h-5 text-destructive"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {viewingApplicantsJob && (
                <JobApplicationsModal
                    jobId={viewingApplicantsJob.id}
                    jobTitle={viewingApplicantsJob.title}
                    onClose={() => setViewingApplicantsJob(null)}
                />
            )}
        </div>
    );
};

export default JobManager;