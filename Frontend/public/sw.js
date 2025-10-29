/**
 * Service Worker for handling push notifications.
 * Follows Single Responsibility Principle: only handles push notification events.
 * Follows Open/Closed Principle: extensible for different notification types.
 */

const CACHE_NAME = 'covoituraje-notifications-v1';
const NOTIFICATION_ICON = '/logo.png';

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'You have a new notification',
      icon: NOTIFICATION_ICON,
      badge: NOTIFICATION_ICON,
      tag: data.tag || 'covoituraje-notification',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Covoituraje', options)
    );
  } catch (error) {
    console.error('Error handling push event:', error);
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('Covoituraje', {
        body: 'You have a new notification',
        icon: NOTIFICATION_ICON,
      })
    );
  }
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }

      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync event - handle offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);

  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Handle any pending notification-related tasks
      handleNotificationSync()
    );
  }
});

// Message event - handle communication from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * Handle notification synchronization tasks.
 * This could include retrying failed notification deliveries,
 * updating notification preferences, etc.
 */
async function handleNotificationSync() {
  try {
    // Implement any background sync logic here
    console.log('Handling notification sync...');
  } catch (error) {
    console.error('Error in notification sync:', error);
  }
}

/**
 * Handle different types of notifications based on their data.
 * Follows Strategy Pattern for different notification behaviors.
 */
function handleNotificationByType(data) {
  switch (data.type) {
    case 'booking_confirmed':
      return {
        title: 'Reserva Confirmada',
        body: `Tu reserva de ${data.seats} asiento(s) ha sido confirmada`,
        icon: NOTIFICATION_ICON,
        tag: 'booking-confirmed',
        data: { url: '/bookings' },
      };

    case 'match_found':
      return {
        title: 'Nuevo Match Encontrado',
        body: `Se encontró un match con score ${Math.round(data.score * 100)}%`,
        icon: NOTIFICATION_ICON,
        tag: 'match-found',
        data: { url: '/matches' },
      };

    case 'trip_cancelled':
      return {
        title: 'Viaje Cancelado',
        body: `El viaje ${data.tripId} ha sido cancelado`,
        icon: NOTIFICATION_ICON,
        tag: 'trip-cancelled',
        data: { url: '/trips' },
      };

    default:
      return {
        title: data.title || 'Covoituraje',
        body: data.body || 'Tienes una nueva notificación',
        icon: NOTIFICATION_ICON,
        tag: 'general',
      };
  }
}