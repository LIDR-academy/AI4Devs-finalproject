/**
 * Service for managing push notifications.
 * Follows Single Responsibility Principle: only handles push notification operations.
 * Follows Dependency Inversion Principle: depends on browser APIs, not concrete implementations.
 */
export class NotificationService {
  private readonly vapidKey: string;
  private readonly apiBaseUrl: string;

  constructor(vapidKey: string, apiBaseUrl: string = '/api') {
    this.vapidKey = vapidKey;
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Checks if push notifications are supported in the current browser.
   * Follows Open/Closed Principle: extensible for different browser capabilities.
   */
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Requests notification permission from the user.
   * Handles errors gracefully to avoid breaking the main flow.
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    return await Notification.requestPermission();
  }

  /**
   * Subscribes to push notifications.
   * Handles errors gracefully to avoid breaking the main flow.
   */
  async subscribe(): Promise<boolean> {
    try {
      if (!this.isSupported()) {
        console.warn('Push notifications are not supported');
        return false;
      }

      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        console.log('Already subscribed to push notifications');
        return true;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.vapidKey,
      });

      // Send subscription to server
      const response = await fetch(`${this.apiBaseUrl}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
          },
        }),
      });

      if (!response.ok) {
        console.error('Failed to register subscription with server');
        return false;
      }

      console.log('Successfully subscribed to push notifications');
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }

  /**
   * Unsubscribes from push notifications.
   * Handles errors gracefully to avoid breaking the main flow.
   */
  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.isSupported()) {
        console.warn('Push notifications are not supported');
        return true;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        console.log('Not subscribed to push notifications');
        return true;
      }

      const success = await subscription.unsubscribe();
      if (!success) {
        console.error('Failed to unsubscribe from push notifications');
        return false;
      }

      // Notify server about unsubscription
      await fetch(`${this.apiBaseUrl}/notifications/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      console.log('Successfully unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  /**
   * Gets the current subscription status.
   * Returns subscription information for UI display.
   */
  async getSubscriptionStatus(): Promise<{
    isSubscribed: boolean;
    endpoint: string | null;
  }> {
    try {
      if (!this.isSupported()) {
        return { isSubscribed: false, endpoint: null };
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      return {
        isSubscribed: !!subscription,
        endpoint: subscription?.endpoint || null,
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return { isSubscribed: false, endpoint: null };
    }
  }

  /**
   * Converts ArrayBuffer to Base64 string.
   * Utility method for key conversion.
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
