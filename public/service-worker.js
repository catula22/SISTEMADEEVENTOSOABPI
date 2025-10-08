self.addEventListener("push", (event) => {
  const data = event.data.json();
  const { title, body, icon, sound } = data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      sound,
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/")
  );
});
