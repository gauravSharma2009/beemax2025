import messaging from '@react-native-firebase/messaging';
import { Alert, Platform, PermissionsAndroid } from 'react-native';

// Request notification permissions
export const requestUserPermission = async () => {
  if (Platform.OS === 'android') {
    // For Android API 33+, we need to request POST_NOTIFICATIONS permission
    if (Platform.Version >= 33) {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return permission === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
    } else {
      // For Android API 32 and below, notifications are enabled by default
      return messaging.AuthorizationStatus.AUTHORIZED;
    }
  } else {
    // For iOS, we need to request permission
    const authStatus = await messaging().requestPermission();
    return authStatus;
  }
};

// Get Firebase token
export const getFirebaseToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('Firebase token:', token);
    return token;
  } catch (error) {
    console.error('Error getting Firebase token:', error);
    return null;
  }
};

// Subscribe to topic
export const subscribeToTopic = async (topic) => {
  try {
    await messaging().subscribeToTopic(topic);
    console.log(`Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error(`Error subscribing to topic ${topic}:`, error);
  }
};

// Unsubscribe from topic
export const unsubscribeFromTopic = async (topic) => {
  try {
    await messaging().unsubscribeFromTopic(topic);
    console.log(`Unsubscribed from topic: ${topic}`);
  } catch (error) {
    console.error(`Error unsubscribing from topic ${topic}:`, error);
  }
};

// Handle foreground messages
export const handleForegroundMessages = () => {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('Received foreground message:', remoteMessage);
    
    // Show an alert when a notification is received in foreground
    Alert.alert(
      remoteMessage.notification?.title || 'Notification',
      remoteMessage.notification?.body || 'You have a new message',
      [{ text: 'OK' }]
    );
  });

  return unsubscribe;
};

// Handle background messages
export const handleBackgroundMessages = () => {
  // Background messages are handled in index.js with setBackgroundMessageHandler
  console.log('Background message handler is set in index.js');
};