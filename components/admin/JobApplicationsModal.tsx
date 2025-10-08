import React, { useState, useEffect } from 'react';
import { JobApplication } from '../../types';
import * as navigationService from '../../services/navigationService';
import { API_URL } from '../../services/apiService';
import Modal from '../Modal';
import LoadingSpinner from '../LoadingSpinner';
import { DownloadIcon } from '../icons/DownloadIcon';

interface JobApplicationsModalProps {
    jobId: number;
    jobTitle: string;
    onClose: () => void;
}

const JobApplicationsModal: React.FC<JobApplicationsModalProps> = ({ jobId, jobTitle, onClose }) => {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const data = await navigationService.getApplicationsForJob(jobId);
                setApplications(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchApps();
    }, [jobId]);

    return (
        <Modal isOpen={true} onClose={onClose} title={`Applicants for ${jobTitle}`}>
            <div className="p-6 max-h-[600px] overflow-y-auto">
                {isLoading ? <LoadingSpinner /> : (
                    applications.length > 0 ? (
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-secondary">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase">Applicant</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase">Applied At</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase">Resume</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {applications.map(app => (
                                        <tr key={app.id}>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold">{app.name}</p>
                                                <p className="text-xs text-muted-foreground">{app.email}</p>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{new Date(app.applied_at).toLocaleDateString()}</td>
                                            <td className="px-4 py-3">
                                                <a href={`${API_URL}${app.resume_path}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-accent hover:underline">
                                                    <DownloadIcon className="w-4 h-4" /> Download
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No applications for this position yet.</p>
                    )
                )}
            </div>
        </Modal>
    );
};

export default JobApplicationsModal;