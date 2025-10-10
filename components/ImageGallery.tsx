import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface ImageGalleryProps {
    images?: { src: string; alt: string }[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const openLightbox = (index: number) => {
        setSelectedImageIndex(index);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeLightbox = () => {
        setSelectedImageIndex(null);
        document.body.style.overflow = ''; // Restore background scrolling
    };

    const goToNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedImageIndex === null || !images) return;
        setSelectedImageIndex((selectedImageIndex + 1) % images.length);
    };

    const goToPrevious = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedImageIndex === null || !images) return;
        setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedImageIndex === null) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'ArrowLeft') goToPrevious();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = ''; // Ensure scroll is restored on component unmount
        };
    }, [selectedImageIndex]);

    if (!images || images.length === 0) {
        return null;
    }

    const isLightboxOpen = selectedImageIndex !== null;

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-8 not-prose">
                {images.map((image, index) => (
                    <div key={index} className="overflow-hidden rounded-lg shadow-md cursor-pointer group" onClick={() => openLightbox(index)}>
                        <img 
                            src={image.src} 
                            alt={image.alt} 
                            className="w-full h-full object-cover aspect-square group-hover:scale-105 transition-transform duration-300" 
                        />
                    </div>
                ))}
            </div>

            {isLightboxOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in-item"
                    onClick={closeLightbox}
                    role="dialog"
                    aria-modal="true"
                >
                    <button 
                        className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors z-10"
                        onClick={closeLightbox}
                        aria-label="Close image viewer"
                    >
                        <CloseIcon />
                    </button>

                    <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <button 
                            className="absolute left-4 text-white p-3 rounded-full bg-black/50 hover:bg-black/80 transition-colors hidden sm:block"
                            onClick={goToPrevious}
                            aria-label="Previous image"
                        >
                            <ChevronLeftIcon className="w-8 h-8"/>
                        </button>
                        
                        <div className="flex flex-col items-center max-w-4xl max-h-full">
                            <img 
                                src={images[selectedImageIndex].src} 
                                alt={images[selectedImageIndex].alt}
                                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                            />
                            {images[selectedImageIndex].alt && (
                                <p className="text-white/80 mt-4 text-center text-sm">{images[selectedImageIndex].alt}</p>
                            )}
                        </div>
                        
                        <button 
                            className="absolute right-4 text-white p-3 rounded-full bg-black/50 hover:bg-black/80 transition-colors hidden sm:block"
                            onClick={goToNext}
                            aria-label="Next image"
                        >
                            <ChevronRightIcon className="w-8 h-8"/>
                        </button>

                        {/* Mobile Navigation */}
                        <div className="sm:hidden absolute bottom-4 w-full flex justify-between px-4">
                             <button 
                                className="text-white p-3 rounded-full bg-black/50 hover:bg-black/80 transition-colors"
                                onClick={goToPrevious}
                                aria-label="Previous image"
                            >
                                <ChevronLeftIcon className="w-8 h-8"/>
                            </button>
                             <button 
                                className="text-white p-3 rounded-full bg-black/50 hover:bg-black/80 transition-colors"
                                onClick={goToNext}
                                aria-label="Next image"
                            >
                                <ChevronRightIcon className="w-8 h-8"/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ImageGallery;