import React from 'react';
import PageLoading from '@/components/ui/page-loading';

interface RouteLoaderProps {
  message?: string;
}

const RouteLoader: React.FC<RouteLoaderProps> = ({ message = "Betöltés..." }) => {
  return <PageLoading message={message} />;
};

export default RouteLoader;