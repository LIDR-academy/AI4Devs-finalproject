import React from 'react';

interface PotentialMatchProps {
    similarity: number;
    petImage: string;
    location: string;
    reportDate: string;
    onChatClick: () => void;
}

const PotentialMatch: React.FC<PotentialMatchProps> = ({
    similarity,
    petImage,
    location,
    reportDate,
    onChatClick,
}) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden m-4 max-w-sm">
            <div className="relative h-48">
                <img
                    src={petImage}
                    alt="Mascota encontrada"
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-4">
                <div className="flex items-center mb-4">
                    <svg
                        className="w-6 h-6 text-blue-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-800">
                        ¡Podría ser tu mascota!
                    </h3>
                </div>
                <div className="space-y-2 text-gray-600">
                    <p className="text-sm">
                        Coincidencia: {similarity.toFixed(2)}%
                    </p>
                    <p className="text-sm">
                        Ubicación: {location}
                    </p>
                    <p className="text-sm">
                        Fecha de reporte: {new Date(reportDate).toLocaleDateString()}
                    </p>
                </div>
                <button
                    onClick={onChatClick}
                    className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                    Chatear con quien reportó esta mascota
                </button>
            </div>
        </div>
    );
};

export default PotentialMatch; 