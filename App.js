import React, { useState, useEffect } from "react";
import { Provider } from 'react-redux';
import store from './src/store/configureStore';
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Navigator from "./src/navigation";
import { Linking, Platform, Text, TouchableOpacity, PermissionsAndroid, Dimensions, Image } from "react-native";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { getData, storeData } from "./src/common/asyncStore";
import Geolocation from 'react-native-geolocation-service';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { changePinCodeState, changeAddressState } from "./src/actions/pincodeAction";
import { server } from "./src/common/apiConstant";
import { changeAppHeaderColorState } from "./src/actions/appHeaderColorAction";
import FastImage from 'react-native-fast-image';
import messaging from '@react-native-firebase/messaging';
import { requestUserPermission, getFirebaseToken, subscribeToTopic, handleForegroundMessages } from './src/utils/firebaseNotifications';

const config = {
  useSystemColorMode: false,
  initialColorMode: "dark",
};

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [iosVersion, setIosVersion] = useState("1.0.22");
  const [androidVersion, setAndroidVersion] = useState("1.0.22");
  const [showSplash, setShowSplash] = useState(true);
  const [splashImageUrl, setSplashImageUrl] = useState(null);
  const [appInfo, setAppInfo] = useState({});
  const [redirectUrl, setRedirectUrl] = useState("");
  const [showUpdate, setShowUpdate] = useState(false);
  
  // Permission states
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [permissionsInitialized, setPermissionsInitialized] = useState(false);

  // Initialize unique ID
  useEffect(() => {
    const getUniqueId = async () => {
      const uniqueId = await getData("uniqueId");
      if (!uniqueId) {
        storeData("uniqueId", uuidv4());
      }
    };
    getUniqueId();
  }, []);

  // STEP 1: Request Location Permission First
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        let permissionStatus = 'denied';
        
        if (Platform.OS === 'ios') {
          const auth = await Geolocation.requestAuthorization("whenInUse");
          console.log('iOS Location Permission:', auth);
          permissionStatus = auth === "granted" ? 'granted' : 'denied';
        }

        if (Platform.OS === 'android') {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          console.log('Android Location Permission:', result);
          permissionStatus = result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
        }

        // Set location permission status (whether granted or denied)
        setLocationPermissionGranted(permissionStatus === 'granted');
        
        // Try to get location if permission granted
        if (permissionStatus === 'granted') {
          Geolocation.getCurrentPosition(
            (position) => {
              console.log('Location obtained:', position);
              setLocation(position);
            },
            (error) => {
              console.log('Location error:', error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        } else {
          console.log('Location permission denied by user');
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
      } finally {
        // Mark that location permission flow is complete (granted or denied)
        setPermissionsInitialized(true);
      }
    };

    requestLocationPermission();
  }, []);

  // STEP 2: Request Notification Permission AFTER Location Permission Flow Completes
  useEffect(() => {
    // Only proceed if location permission flow is complete
    if (!permissionsInitialized) {
      return;
    }

    const setupFirebaseNotifications = async () => {
      try {
        console.log('Starting notification permission setup...');
        
        // Check current notification permission status
        const currentPermission = await messaging().hasPermission();
        let permissionStatus;

        if (currentPermission === messaging.AuthorizationStatus.AUTHORIZED ||
            currentPermission === messaging.AuthorizationStatus.PROVISIONAL) {
          permissionStatus = 'granted';
          console.log('Notification permission already granted');
        } else {
          // Request notification permissions
          const requestedPermission = await requestUserPermission();
          const enabled =
            requestedPermission === messaging.AuthorizationStatus.AUTHORIZED ||
            requestedPermission === messaging.AuthorizationStatus.PROVISIONAL;

          permissionStatus = enabled ? 'granted' : 'denied';
          console.log('Notification permission status after request:', permissionStatus);
        }

        if (permissionStatus === 'granted') {
          // Get the Firebase token
          const token = await getFirebaseToken();
          if (token) {
            console.log('FCM Token:', token);

            // Subscribe to topics
            await subscribeToTopic('All');
            console.log('Subscribed to All topic');
          }

          // Handle foreground messages
          const unsubscribe = handleForegroundMessages();

          // Handle notification interactions
          const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('Notification caused app to open from background state:', remoteMessage);
            if (remoteMessage?.data?.category_id) {
              storeData("notification", JSON.stringify(remoteMessage.data));
            }
          });

          const unsubscribeMessage = messaging().onMessage(async remoteMessage => {
            console.log('Notification received in foreground:', remoteMessage);
          });

          // Handle app opened from terminated state
          const initialNotification = await messaging().getInitialNotification();
          if (initialNotification) {
            console.log('Notification caused app to open from quit state:', initialNotification);
            if (initialNotification?.data?.category_id) {
              storeData("notification", JSON.stringify(initialNotification.data));
            }
          }

          // Cleanup
          return () => {
            unsubscribe();
            unsubscribeNotificationOpened();
            unsubscribeMessage();
          };
        } else {
          console.log('Notification permission denied - app will work but user won\'t receive notifications');
        }
      } catch (error) {
        console.error('Error setting up Firebase notifications:', error);
      }
    };

    setupFirebaseNotifications();

    // Listen for token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
      console.log('Firebase token refreshed:', token);
    });

    return () => {
      unsubscribeTokenRefresh();
    };
  }, [permissionsInitialized]); // Depends on location permission flow completion

  // Fetch app information
  useEffect(() => {
    getAppInformation();
    getAppHeaderColor();
    getSplashBanner();
  }, []);

  // Process location data for geocoding
  useEffect(() => {
    if (location) {
      fetchGeocodeData(location);
    }
  }, [location]);

  // Check for app updates
  useEffect(() => {
    if (!appInfo || !appInfo?.android_version || !appInfo?.ios_version) {
      return;
    }

    if (Platform.OS === 'android') {
      const numberFromAPi = convertStringToNumber(appInfo?.android_version);
      const numberFromApplication = convertStringToNumber(androidVersion);
      if (numberFromApplication < numberFromAPi) {
        setShowUpdate(true);
        setRedirectUrl("https://play.google.com/store/apps/details?id=com.webinfosys.ecommerce");
      }
    }
    if (Platform.OS === 'ios') {
      const numberFromAPi = convertStringToNumber(appInfo?.ios_version);
      const numberFromApplication = convertStringToNumber(iosVersion);
      if (numberFromApplication < numberFromAPi) {
        setShowUpdate(true);
        setRedirectUrl('itms-apps://apps.apple.com/id/app/beemax-grocery-in-minutes/id6499224187id');
      }
    }
  }, [appInfo]);

  // Helper functions
  function convertStringToNumber(inputString) {
    const cleanedString = inputString.replace(/^0+/, '');
    const parts = cleanedString.split('.');
    const integers = parts.map(part => parseInt(part, 10));
    let result = 0;
    for (let i = 0; i < integers.length; i++) {
      result += integers[i] * Math.pow(10, (integers.length - 1 - i) * 3);
    }
    return result;
  }

  const fetchGeocodeData = async (location) => {
    const apiKey = 'AIzaSyDHhmAsz97YrEw-8xqToaNzgs72yeL-i6k';
    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.status === 'OK') {
        console.log("Address data:", JSON.stringify(data.results[0]));

        const postalCode = data.results[0].address_components.find(
          (component) => component.types.includes('postal_code')
        );
        const subLocality1 = data.results[0].address_components.find(
          (component) => component.types.includes('sublocality') && component.types.includes('sublocality_level_1')
        );
        const subLocality2 = data.results[0].address_components.find(
          (component) => component.types.includes('sublocality') && component.types.includes('sublocality_level_2')
        );
        const subLocality3 = data.results[0].address_components.find(
          (component) => component.types.includes('sublocality') && component.types.includes('sublocality_level_3')
        );
        const cityComponent = data.results[0].address_components.find(
          (component) => component.types.includes('locality')
        );
        const stateComponent = data.results[0].address_components.find(
          (component) => component.types.includes('administrative_area_level_1')
        );
        
        const addressCreated = (subLocality3?.short_name || "") + " " + 
                               (subLocality2?.short_name || "") + " " + 
                               (subLocality1?.short_name || "") + " " + 
                               (cityComponent?.short_name || "") + " " + 
                               (stateComponent?.long_name || "");

        store.dispatch(changePinCodeState('' + (postalCode?.short_name || "")));
        store.dispatch(changeAddressState(addressCreated));
      } else {
        console.error('Geocoding error:', data.status);
      }
    } catch (error) {
      console.error('Error fetching geocoding data:', error);
    }
  };

  const getAppInformation = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Cookie", "ci_session=b85c4e741fb5381ba7db99de1c8cb392db4b2d09");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    fetch(`${server}app_udate_information`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log("App update result:", result);
        if (result && result?.data && result?.data?.appInformation) {
          setAppInfo(result?.data?.appInformation);
        }
      })
      .catch((error) => console.error(error));
  };

  const getAppHeaderColor = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Cookie", "ci_session=b85c4e741fb5381ba7db99de1c8cb392db4b2d09");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };
    
    fetch(`${server}app_header_background`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result && result?.data && result?.data?.appHeaderBackground) {
          store.dispatch(changeAppHeaderColorState(result?.data?.appHeaderBackground?.color));
        }
      })
      .catch((error) => console.error(error));
  };

  const getSplashBanner = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Cookie", "ci_session=b85c4e741fb5381ba7db99de1c8cb392db4b2d09");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    fetch(`${server}app_splash_banner`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log("Splash banner result:", result);
        if (result && result?.status && result?.data && result?.data?.appSplashBanner) {
          setSplashImageUrl(result?.data?.appSplashBanner?.file_url);
          setTimeout(() => {
            setShowSplash(false);
          }, 5000);
        } else {
          setTimeout(() => {
            setShowSplash(false);
          }, 2000);
        }
      })
      .catch((error) => {
        console.error("Splash banner error:", error);
        setTimeout(() => {
          setShowSplash(false);
        }, 2000);
      });
  };

  // Show splash screen
  if (showSplash) {
    return (
      <View style={{
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        backgroundColor: '#ffffff'
      }}>
        <Image
          source={{ uri: splashImageUrl }}
          style={{
            width: '100%',
            height: '100%'
          }}
          resizeMode='cover'
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <NavigationContainer>
          <GestureHandlerRootView style={{ flex: 1 }}>
              <Navigator />
          </GestureHandlerRootView>
        </NavigationContainer>
        {showUpdate && (
          <View style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: '#000000aa', 
            position: 'absolute', 
            justifyContent: 'center', 
            alignItems: "center" 
          }}>
            <View style={{ 
              width: '80%', 
              backgroundColor: '#ffffff', 
              borderRadius: 10, 
              paddingVertical: 15, 
              paddingHorizontal: 10 
            }}>
              <Text style={{ 
                width: '100%', 
                textAlign: 'center', 
                fontFamily: "Poppins-Medium", 
                fontSize: 16 
              }}>
                New version available
              </Text>
              <Text style={{ 
                width: '100%', 
                textAlign: 'center', 
                fontFamily: "Poppins-Regular", 
                fontSize: 14, 
                marginTop: 10 
              }}>
                {"There are new features available,\nPlease update your app."}
              </Text>
              <View style={{ 
                width: '100%', 
                height: 1, 
                backgroundColor: '#d0d0d0', 
                marginTop: 20 
              }}></View>
              <View style={{ 
                width: '100%', 
                justifyContent: 'space-evenly', 
                flexDirection: 'row', 
                marginTop: 10 
              }}>
                <TouchableOpacity
                  onPress={() => {
                    const link = redirectUrl;
                    Linking.canOpenURL(link).then(supported => {
                      supported && Linking.openURL(link);
                    }, (err) => console.log(err));
                  }}
                >
                  <Text style={{ 
                    width: '100%', 
                    textAlign: 'center', 
                    fontFamily: "Poppins-Medium", 
                    fontSize: 15, 
                    color: '#007AFF' 
                  }}>
                    Update
                  </Text>
                </TouchableOpacity>
                {appInfo?.force_update === "0" && (
                  <TouchableOpacity onPress={() => { setShowUpdate(false) }}>
                    <Text style={{ 
                      width: '100%', 
                      textAlign: 'center', 
                      fontFamily: "Poppins-Medium", 
                      fontSize: 15, 
                      color: '#007AFF' 
                    }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </Provider>
    </SafeAreaProvider>
  );
}