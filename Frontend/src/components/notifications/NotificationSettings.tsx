import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent } from '../ui';
import { NotificationService } from '../../services/NotificationService';
import { env } from '../../env';

/**
 * Component for managing push notification settings.
 * Follows Single Responsibility Principle: only handles notification settings UI.
 * Follows Dependency Inversion Principle: depends on NotificationService abstraction.
 */
export const NotificationSettings: React.FC = () => {
  const { t } = useTranslation('notifications');
  const [notificationService] = useState(() => new NotificationService(env.vapidPublicKey));
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endpoint, setEndpoint] = useState<string | null>(null);

  useEffect(() => {
    const initializeSettings = async () => {
      const supported = notificationService.isSupported();
      setIsSupported(supported);

      if (supported) {
        try {
          const status = await notificationService.getSubscriptionStatus();
          setIsSubscribed(status.isSubscribed);
          setEndpoint(status.endpoint);
        } catch (err) {
          console.error('Error getting subscription status:', err);
        }
      }
    };

    initializeSettings();
  }, [notificationService]);

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await notificationService.subscribe();
      if (success) {
        const status = await notificationService.getSubscriptionStatus();
        setIsSubscribed(status.isSubscribed);
        setEndpoint(status.endpoint);
      } else {
        setError(t('notifications.error'));
      }
    } catch (err) {
      console.error('Error subscribing to notifications:', err);
      setError(t('notifications.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await notificationService.unsubscribe();
      if (success) {
        setIsSubscribed(false);
        setEndpoint(null);
      } else {
        setError(t('notifications.error'));
      }
    } catch (err) {
      console.error('Error unsubscribing from notifications:', err);
      setError(t('notifications.error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 1 1 15 0v5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('notifications.notSupported')}
            </h3>
            <p className="text-gray-600">
              {t('notifications.notSupportedDescription')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('notifications.title')}
            </h3>
            <p className="text-gray-600">
              {t('notifications.description')}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isSubscribed ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">
                      {t('notifications.subscribed')}
                    </p>
                  </div>
                </div>
              </div>

              {endpoint && (
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{t('notifications.endpoint')}:</p>
                  <p className="font-mono text-xs break-all">{endpoint}</p>
                </div>
              )}

              <Button
                variant="secondary"
                onClick={handleUnsubscribe}
                disabled={isLoading}
                loading={isLoading}
                className="w-full"
              >
                {isLoading ? t('notifications.unsubscribing') : t('notifications.disable')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                variant="primary"
                onClick={handleSubscribe}
                disabled={isLoading}
                loading={isLoading}
                className="w-full"
              >
                {isLoading ? t('notifications.subscribing') : t('notifications.enable')}
              </Button>

              <div className="text-sm text-gray-600">
                <p>{t('notifications.privacyNote')}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
