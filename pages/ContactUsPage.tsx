import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import * as navigationService from '../services/navigationService';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { EnvelopeIcon } from '../components/icons/EnvelopeIcon';

const ContactUsPage: React.FC = () => {
    const [page, setPage] = useState<Page | null>(null);
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const { addToast } = useToast();

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const pageData = await navigationService.getPage('contact-us');
                setPage(pageData);
            } catch (error) {
                console.error("Failed to fetch contact us page", error);
            } finally {
                setIsLoadingPage(false);
            }
        };
        fetchPage();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await navigationService.submitContactForm(formData);
            addToast('Your message has been sent successfully!', 'success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error: any) {
            addToast(error.message || 'Failed to send message.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center">
                <EnvelopeIcon className="mx-auto h-12 w-12 text-accent" />
                <h1 className="text-4xl font-extrabold tracking-tight mt-4">Contact Us</h1>
                {isLoadingPage ? <div className="py-4"><LoadingSpinner/></div> : page && (
                    <div className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: page.content }} />
                )}
            </div>

            <div className="mt-12 bg-card p-8 rounded-lg shadow-xl border border-border">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded-md bg-card border-border focus:ring-accent focus:border-accent" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="w-full p-2 border rounded-md bg-card border-border focus:ring-accent focus:border-accent" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject (Optional)</label>
                        <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleChange} className="w-full p-2 border rounded-md bg-card border-border focus:ring-accent focus:border-accent" />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                        <textarea name="message" id="message" value={formData.message} onChange={handleChange} required rows={5} className="w-full p-2 border rounded-md bg-card border-border focus:ring-accent focus:border-accent" />
                    </div>
                    <div className="text-right">
                        <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-semibold disabled:bg-muted">
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactUsPage;