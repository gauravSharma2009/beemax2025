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
// import SplashScreen from "react-native-splash-screen";

// Import Firebase modules
import messaging from '@react-native-firebase/messaging';
import { requestUserPermission, getFirebaseToken, subscribeToTopic, handleForegroundMessages } from './src/utils/firebaseNotifications';

// Define the config
const config = {
  useSystemColorMode: false,
  initialColorMode: "dark",
};

// extend the theme

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [iosVersion, setIosVersion] = useState("1.0.1");
  const [androidVersion, setAndroidVersion] = useState("1.0.1");
  const [showSplash, setShowSplash] = useState(true);
  const [splashImageUrl, setSplashImageUrl] = useState(null);

  useEffect(() => {
    const getUniqueId = async () => {
      const uniqueId = await getData("uniqueId")
      if (!uniqueId) {
        storeData("uniqueId", uuidv4())
      }
    }
    getUniqueId()
    // SplashScreen.hide();
  }, [])

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization("whenInUse");
        if (auth === "granted") {
          //do something if granted...
        }
      }

      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
      }
    };

    requestLocationPermission().then(() => {
      Geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
        },
        (error) => {
          // See error code charts below.
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    })
  }, []);

  useEffect(() => {
    getAppInformation()
    getAppHeaderColor()
    getSplashBanner()
    // alert("Hello")
  }, [])
  const [appInfo, setAppInfo] = useState({})
  const [redirectUrl, setRedirectUrl] = useState("")
  const [showUpdate, setShowUpdate] = useState(false)

  function convertStringToNumber(inputString) {
    // Remove any leading zeros
    const cleanedString = inputString.replace(/^0+/, '');

    // Split the string by periods
    const parts = cleanedString.split('.');

    // Convert each part to an integer
    const integers = parts.map(part => parseInt(part, 10));

    // Calculate the final number
    let result = 0;
    for (let i = 0; i < integers.length; i++) {
      result += integers[i] * Math.pow(10, (integers.length - 1 - i) * 3);
    }

    return result;
  }

  useEffect(() => {
    if (!appInfo || !appInfo?.android_version || !appInfo?.ios_version) {
      return
    }

    if (Platform.OS === 'android') {
      const numberFromAPi = convertStringToNumber(appInfo?.android_version)
      const numberFromApplication = convertStringToNumber(androidVersion)
      if (numberFromApplication < numberFromAPi) {
        setShowUpdate(true)
        setRedirectUrl("https://play.google.com/store/apps/details?id=com.webinfosys.ecommerce")
      }
    }
    if (Platform.OS === 'ios') {
      const numberFromAPi = convertStringToNumber(appInfo?.ios_version)
      const numberFromApplication = convertStringToNumber(iosVersion)
      if (numberFromApplication < numberFromAPi) {
        setShowUpdate(true)
        // setRedirectUrl('https://apps.apple.com/in/app/beemax-grocery-in-minutes/id6499224187')

        setRedirectUrl('itms-apps://apps.apple.com/id/app/beemax-grocery-in-minutes/id6499224187id')
        // https://apps.apple.com/in/app/beemax-grocery-in-minutes/id6499224187

      }
    }
  }, [appInfo])

  // Firebase notification setup
  useEffect(() => {
    const setupFirebase = async () => {
      try {
        // Request notification permissions
        const permissionStatus = await requestUserPermission();
        console.log('Notification permission status:', permissionStatus);

        if (permissionStatus === 'granted') {
          // Get the Firebase token
          const token = await getFirebaseToken();
          if (token) {
            console.log('FCM Token:', token);

            // Subscribe to all topics
            await subscribeToTopic('All');
            // await subscribeToTopic('Test');
            console.log('Subscribed to All topic');
          }

          // Handle foreground messages
          const unsubscribe = handleForegroundMessages();

          // Handle notification interactions
          const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('Notification caused app to open from background state:', remoteMessage);
            // Store notification data to handle redirect after navigation is ready
            if (remoteMessage?.data?.category_id) {
              storeData("notification", JSON.stringify(remoteMessage.data));
            }
          });

          const unsubscribeMessage = messaging().onMessage(async remoteMessage => {
            console.log('Notification caused Received message in foreground:', remoteMessage);
          });

          // Handle app opened from terminated state by notification
          const initialNotification = await messaging().getInitialNotification();
          if (initialNotification) {
            console.log('Notification caused app to open from quit state:', initialNotification);
            // Store notification data to handle redirect after navigation is ready
            if (initialNotification?.data?.category_id) {
              storeData("notification", JSON.stringify(initialNotification.data));
            }
          }

          // Cleanup function to unsubscribe when component unmounts
          return () => {
            unsubscribe();
            unsubscribeNotificationOpened();
            unsubscribeMessage();
          };
        }
      } catch (error) {
        console.error('Error setting up Firebase:', error);
      }
    };

    setupFirebase();

    // Listen for token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
      console.log('Firebase token refreshed:', token);
      // You might want to send this new token to your server here
    });

    // Cleanup token refresh listener when component unmounts
    return () => {
      unsubscribeTokenRefresh();
    };
  }, []);
  const getAppInformation = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Cookie", "ci_session=b85c4e741fb5381ba7db99de1c8cb392db4b2d09");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };
    // console.log(`${server}app_udate_information`)
    fetch(`${server}app_udate_information`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log("appupdate result  : ", result)
        if (result && result?.data && result?.data?.appInformation) {
          setAppInfo(result?.data?.appInformation)
        }
      })
      .catch((error) => console.error(error));
  }

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
          store.dispatch(changeAppHeaderColorState(result?.data?.appHeaderBackground?.color))
        }
      })
      .catch((error) => console.error(error));
  }

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
        console.log("splash banner result: ", result);
        if (result && result?.status && result?.data && result?.data?.appSplashBanner) {
          setSplashImageUrl(result?.data?.appSplashBanner?.file_url);
          // Hide splash after 5 seconds
          setTimeout(() => {
            setShowSplash(false);
          }, 5000);
        } else {
          // If API fails, hide splash after 2 seconds
          setTimeout(() => {
            setShowSplash(false);
          }, 2000);
        }
      })
      .catch((error) => {
        console.error("Splash banner error:", error);
        // If API fails, hide splash after 2 seconds
        setTimeout(() => {
          setShowSplash(false);
        }, 2000);
      });
  }

  const extractPincodeFromAddress = (address) => {
    // Split the address by commas
    console.log("address  :  ", address)
    const addressParts = address?.split(',');

    // Get the last part of the address
    const lastPart = addressParts && addressParts[addressParts.length - 1].trim();

    // Assuming the last part contains the pincode
    return lastPart;
  };
  useEffect(() => {
    (async () => {
      if (location) {
        const apiKey = 'AIzaSyDHhmAsz97YrEw-8xqToaNzgs72yeL-i6k';
        const latitude = location.coords.latitude; // Replace with your latitude
        const longitude = location.coords.longitude; // Replace with your longitude

        const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

        fetch(apiUrl)
          .then(response => response.json())
          .then(data => {
            if (data.status === 'OK') {

              console.log("address data  :  ", JSON.stringify(data.results[0]))

              const address = data.results[0].formatted_address;

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
              const addressCreated = (subLocality3?.short_name || "") + " " + (subLocality2?.short_name || "") + " " + (subLocality1?.short_name || "") + " " + (cityComponent?.short_name || "") + " " + (stateComponent?.long_name || "")

              // setPincode('' + (postalCode?.short_name || ""))
              // setAddress(addressCreated)
              store.dispatch(changePinCodeState('' + (postalCode?.short_name || "")))
              store.dispatch(changeAddressState(addressCreated))
              return


              // const formattedAddress = data.results[0].formatted_address;
              // console.log('Formatted Address:', formattedAddress);
              // fetchPostalCodeFromAddress(formattedAddress)
            } else {
              console.error('Geocoding error:', data.status);
            }
          })
          .catch(error => {
            console.error('Error fetching geocoding data:', error);
          });

        // if (geocodeResult.length > 0) {
        //   const address = geocodeResult[0].formattedAddress;

        //   // Extract pincode from address
        //   const pincode = extractPincodeFromAddress(address);
        //   console.log("pincode  :  ", pincode)
        //   // Store pincode in AsyncStorage
        //   await AsyncStorage.setItem('pincode', pincode);
        // }


      }


    })();
  }, [location])

  async function fetchPostalCodeFromAddress(address) {
    const apiKey = 'AIzaSyDHhmAsz97YrEw-8xqToaNzgs72yeL-i6k';

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Geocoding API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'OK') {
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
        const addressCreated = (subLocality3?.short_name || "") + " " + (subLocality2?.short_name || "") + " " + (subLocality1?.short_name || "") + " " + (cityComponent?.short_name || "") + " " + (stateComponent?.long_name || "")
        // return cityComponent ? cityComponent.long_name : null;
        const code = postalCode ? postalCode.long_name : null;
        storeData("pincode", code)
        store.dispatch(changePinCodeState(code))
        store.dispatch(changeAddressState(addressCreated))
        return
      } else {
        console.error('Geocoding API Error:', data.error_message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching postal code:', error.message);
      return null;
    }
  }

  // return(<View style={{backgroundColor:'red', width:'100%', height:'100%'}}></View>)

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
          cachePolicy="memory" // or "memory", "disk", "none"
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <NavigationContainer>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
              <Navigator />
            </SafeAreaView>
          </GestureHandlerRootView>
        </NavigationContainer>
        {showUpdate && <View style={{ width: '100%', height: '100%', backgroundColor: '#000000aa', position: 'absolute', justifyContent: 'center', alignItems: "center" }}>
          <View style={{ width: '80%', backgroundColor: '#ffffff', borderRadius: 10, paddingVertical: 15, paddingHorizontal: 10 }}>
            <Text style={{ width: '100%', textAlign: 'center', fontFamily: "Poppins-Medium", fontSize: 16 }}>New version available</Text>
            <Text style={{ width: '100%', textAlign: 'center', fontFamily: "Poppins-Regular", fontSize: 14, marginTop: 10 }}>{"There are new feature available,\nPlease update your app."}</Text>
            <View style={{ width: '100%', height: 1, backgroundColor: '#d0d0d0', marginTop: 20 }}></View>
            <View style={{ width: '100%', justifyContent: 'space-evenly', flexDirection: 'row', marginTop: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  // const link = 'itms-apps://apps.apple.com/id/app/halojasa/id1492671277?l=id';
                  const link = redirectUrl;

                  Linking.canOpenURL(link).then(supported => {
                    supported && Linking.openURL(link);
                  }, (err) => console.log(err));
                }}
              >
                <Text style={{ width: '100%', textAlign: 'center', fontFamily: "Poppins-Medium", fontSize: 15, color: '#007AFF' }}>Update</Text>
              </TouchableOpacity>
              {appInfo?.force_update === "0" && <TouchableOpacity
                onPress={() => { setShowUpdate(false) }}
              >
                <Text style={{ width: '100%', textAlign: 'center', fontFamily: "Poppins-Medium", fontSize: 15, color: '#007AFF' }}>Cancel</Text>
              </TouchableOpacity>}
            </View>
          </View>
        </View>}
      </Provider>

    </SafeAreaProvider>

  );
}
//https://expo.dev/accounts/gaurav.sharma

