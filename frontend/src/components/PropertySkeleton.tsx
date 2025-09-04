import React, { memo } from 'react';
import { Card, CardContent, Skeleton } from '@mui/material';

const PropertySkeleton: React.FC = memo(() => {
  return (
    <Card>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="text" height={32} />
        <Skeleton variant="text" height={24} />
        <Skeleton variant="text" height={20} />
      </CardContent>
    </Card>
  );
});

PropertySkeleton.displayName = 'PropertySkeleton';

export default PropertySkeleton;
