'use client';

import React from 'react';
import { FaStar } from 'react-icons/fa';

interface ListingCardProps {
  image: string;
  name: string;
  type: string;
  status: string;
  rating: number;
  description?: string;
  images?: string[];
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={star <= rating ? 'star-filled' : 'star-empty'}
        />
      ))}
    </div>
  );
};

const ListingCard: React.FC<ListingCardProps> = ({
  image,
  name,
  type,
  status,
  rating,
  description,
  images
}) => {
  return (
    <div className="listing-card">
      <div className="flex items-start gap-4">
        <img
          src={image}
          alt={name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <StarRating rating={rating} />
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
            <span className="font-medium">{name}</span>
            <span>•</span>
            <span>{status}</span>
            <span>•</span>
            <span>{type}</span>
          </div>
          {description && (
            <p className="mt-2 text-sm text-gray-300">{description}</p>
          )}
          {images && images.length > 0 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Imagen adicional ${index + 1}`}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RecentListings: React.FC = () => {
  const listings = [
    {
      image: '/images/max.jpg',
      name: 'Max',
      type: 'Gato Perdido',
      status: 'listado',
      rating: 4
    },
    {
      image: '/images/sarah.jpg',
      name: 'Sarah',
      type: 'GuardianPaws',
      status: 'voluntaria',
      rating: 5,
      description: 'Ayudando a los peludos a encontrar hogar.',
      images: [
        '/images/pet1.jpg',
        '/images/pet2.jpg',
        '/images/pet3.jpg'
      ]
    }
  ];

  return (
    <section className="w-full px-4 py-8 bg-[#121212]">
      <h2 className="text-2xl font-semibold text-white mb-6">Listados Recientes</h2>
      <div className="space-y-4">
        {listings.map((listing, index) => (
          <ListingCard key={index} {...listing} />
        ))}
      </div>
      <button className="w-full mt-6 py-3 text-center text-gray-400 hover:text-white transition-colors bg-[#1e1e1e] rounded-lg">
        Ver más listados
      </button>
    </section>
  );
};

export default RecentListings; 