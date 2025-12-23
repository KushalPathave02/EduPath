import * as Notifications from 'expo-notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Function to schedule a notification
export async function schedulePushNotification(title: string, body: string, trigger: Notifications.NotificationTriggerInput) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger,
  });
}

// Example: Schedule a notification 5 seconds from now
export async function scheduleTestNotification() {
  console.log('Scheduling test notification');
  await schedulePushNotification('Test Title', 'This is a test notification!', { seconds: 5 });
}
