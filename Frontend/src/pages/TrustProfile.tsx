import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TrustProfile } from '../components/trust/TrustProfile';
import { RatingsList } from '../components/trust/RatingsList';
import { RatingForm } from '../components/trust/RatingForm';
import { Button } from '../components/ui/Button';

export function TrustProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [showRatingForm, setShowRatingForm] = useState(false);

  if (!userId) {
    return (
      <div className="text-center text-red-600 p-8">
        ID de usuario no válido
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Perfil de Confianza</h1>
        <Button
          onClick={() => setShowRatingForm(!showRatingForm)}
          variant={showRatingForm ? 'secondary' : 'primary'}
        >
          {showRatingForm ? 'Cancelar Valoración' : 'Valorar Usuario'}
        </Button>
      </div>

      {showRatingForm && (
        <RatingForm
          ratedUserId={userId}
          onSuccess={() => {
            setShowRatingForm(false);
            // Optionally refresh the page or update state
            window.location.reload();
          }}
          onCancel={() => setShowRatingForm(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrustProfile userId={userId} />
        <RatingsList userId={userId} />
      </div>
    </div>
  );
}


