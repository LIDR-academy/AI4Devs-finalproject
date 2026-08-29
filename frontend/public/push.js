/* eslint-disable no-restricted-globals */

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    console.warn("[push.js] Malformed push payload");
    return;
  }

  const title = payload.notification?.title ?? "Coacher";
  const body = payload.notification?.body ?? "";
  const data = payload.data ?? {};

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      tag: data.notificationId,
      data,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const link = event.notification.data?.link ?? "/";
  const url = new URL(link, self.registration.scope).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          if ("navigate" in client) {
            try {
              client.navigate(url);
            } catch {
              // navigate unsupported — fall through to focus + postMessage
            }
          }
          try {
            client.postMessage({ type: "NOTIFICATION_CLICK", ...event.notification.data });
          } catch {
            // no message channel — ignore
          }
          return client.focus();
        }
      }
      return clients.openWindow(url);
    }),
  );
});
