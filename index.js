/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Import and configure Firebase
import messaging from '@react-native-firebase/messaging';
import { storeData } from './src/common/asyncStore';

// Register background handler for messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  console.log("notification data bg :  ", remoteMessage.data);
  storeData('notification', JSON.stringify(remoteMessage.data));
});

AppRegistry.registerComponent(appName, () => App);
