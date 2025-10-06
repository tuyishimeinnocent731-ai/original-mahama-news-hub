
import React from 'react';

interface ImageGalleryProps {
    images: { src: string; alt: string }[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8">
            {images.map((image, index) => (
                <div key={index} className="overflow-hidden rounded-lg">
                    <img 
                        src={image.src} 
                        alt={image.alt} 
                        className="w-full h-full object-cover aspect-square hover:scale-105 transition-transform duration-300" 
                    />
                </div>
            ))}
        </div>
    );
};

export default ImageGallery;
