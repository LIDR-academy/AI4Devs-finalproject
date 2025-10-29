import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Button, Card, CardContent } from '../components/ui';

export default function Home() {
  const { t } = useTranslation('common');
  const { authenticated, login } = useAuth();
  
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-20 w-auto"
          />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="text-primary-600">{t('home.title')}</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          {t('home.subtitle')}
        </p>
        
        {!authenticated ? (
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Button variant="primary" size="lg" onClick={login}>
              {t('home.getStarted')}
            </Button>
          </div>
        ) : (
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8 space-x-4">
            <Link to="/trips">
              <Button variant="primary" size="lg">
                {t('home.createTrip')}
              </Button>
            </Link>
            <Link to="/matches">
              <Button variant="secondary" size="lg">
                {t('home.searchTrips')}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100 mb-4">
                <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home.features.share.title')}</h3>
              <p className="text-gray-600">
                {t('home.features.share.description')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home.features.find.title')}</h3>
              <p className="text-gray-600">
                {t('home.features.find.description')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home.features.save.title')}</h3>
              <p className="text-gray-600">
                {t('home.features.save.description')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {t('home.howItWorks.title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t('home.howItWorks.subtitle')}
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white text-xl font-bold mx-auto">
                  1
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">{t('home.howItWorks.steps.create.title')}</h3>
                <p className="mt-2 text-base text-gray-500">
                  {t('home.howItWorks.steps.create.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white text-xl font-bold mx-auto">
                  2
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">{t('home.howItWorks.steps.search.title')}</h3>
                <p className="mt-2 text-base text-gray-500">
                  {t('home.howItWorks.steps.search.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white text-xl font-bold mx-auto">
                  3
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">{t('home.howItWorks.steps.book.title')}</h3>
                <p className="mt-2 text-base text-gray-500">
                  {t('home.howItWorks.steps.book.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

