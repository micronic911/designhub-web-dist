/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push messages when the app tab is not in focus.
 *
 * IMPORTANT: This file must be served from the root path (/firebase-messaging-sw.js)
 * and is placed in /public so Vite copies it there at build time.
 *
 * Fill in the firebaseConfig values to match your project
 * (same values as FCM_CONFIG in src/utils/constants.ts).
 */

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAieKA0vV8TpaMePJ_EFsWhf1kh2RoUNBc",
    authDomain: "vidyaaprint.firebaseapp.com",
    projectId: "vidyaaprint",
    storageBucket: "vidyaaprint.firebasestorage.app",
    messagingSenderId: "680791535067",
    appId: "1:680791535067:web:98270ed32e8ac49f1ecbfe",
});

const messaging = firebase.messaging();

/**
 * Background message handler.
 * The server sends data-only messages (no 'notification' block), so
 * we must show the notification ourselves here.
 */
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background FCM message:', payload);

    const data = payload.data ?? {};
    const title = data.title || 'VidyaaPrint';
    const body = data.message || '';
    const type = data.type;
    const orderId = data.orderId;

    // Sync messages: no popup needed
    if (type === 'sync') return;

    self.registration.showNotification(title, {
        body,
        icon: '/favicon.webp',
        tag: orderId ? `${type || 'fcm'}-${orderId}` : undefined,
        data: { orderId, type },
    });
});

/**
 * Notification click: open / focus the app and navigate to the order.
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const orderId = event.notification.data?.orderId;
    const url = orderId
        ? `/?page=orders&orderId=${orderId}`
        : '/?page=dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
