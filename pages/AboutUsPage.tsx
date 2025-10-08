import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import * as navigationService from '../services/navigationService';
import LoadingSpinner from '../components/LoadingSpinner';
import { BuildingOfficeIcon } from '../components/icons/BuildingOfficeIcon';

const AboutUsPage: React.FC = () => {
    const [page, setPage] = useState<Page | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const pageData = await navigationService.getPage('about-us');
                setPage(pageData);
            } catch (error) {
                console.error("Failed to fetch about us page", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPage();
    }, []);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {isLoading ? <div className="flex justify-center p-20"><LoadingSpinner/></div> :
             !page ? <p>Could not load page content.</p> :
             (
                 <>
                    <div className="text-center py-12 px-6 bg-secondary rounded-lg mb-12">
                         <BuildingOfficeIcon className="mx-auto h-16 w-16 text-accent mb-4" />
                         <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{page.title}</h1>
                         <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Learn more about our journey, our mission, and the team that makes it all happen.
                         </p>
                    </div>
                    <div 
                        className="prose dark:prose-invert max-w-none text-lg"
                        dangerouslySetInnerHTML={{ __html: page.content }} 
                    />
                 </>
             )}
        </div>
    );
};

export default AboutUsPage;