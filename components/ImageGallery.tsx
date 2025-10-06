import React from 'react';

interface ImageGalleryProps {
    images?: { src: string; alt: string }[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-8 not-prose">
            {images.map((image, index) => (
                <div key={index} className="overflow-hidden rounded-lg shadow-md">
                    <img 
                        src={image.src} 
                        alt={image.alt} 
                        className="w-full h-full object-cover aspect-square hover:scale-105 transition-transform duration-300 cursor-pointer" 
                    />
                </div>
            ))}
        </div>
    );
};

export default ImageGallery;
