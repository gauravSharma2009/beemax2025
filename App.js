import React, { useState, useEffect } from "react";
import {
  Link,
  HStack,
  Center,
  Heading,
  Switch,
  useColorMode,
  NativeBaseProvider,
  extendTheme,
  VStack,
  Code,
} from "native-base";
import { Provider } from 'react-redux';
import store from './src/store/configureStore';

import { NavigationContainer } from "@react-navigation/native";
import AppLoading from "expo-app-loading";

import { SafeAreaView } from "react-native-safe-area-context";
import Navigator from "./src/navigation";
import * as Font from 'expo-font';
import { Linking, Platform, Text, TouchableOpacity } from "react-native";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { getData, storeData } from "./src/common/asyncStore";
import * as Location from 'expo-location';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { changePinCodeState, changeAddressState } from "./src/actions/pincodeAction";
import { server } from "./src/common/apiConstant";

// Define the config
const config = {
  useSystemColorMode: false,
  initialColorMode: "dark",
};

// extend the theme
export const theme = extendTheme({ config });

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [iosVersion, setIosVersion] = useState("1.0.1");
  const [androidVersion, setAndroidVersion] = useState("1.0.1");

  useEffect(() => {
    const getUniqueId = async () => {
      const uniqueId = await getData("uniqueId")
      if (!uniqueId) {
        storeData("uniqueId", uuidv4())
      }
    }
    getUniqueId()
  }, [])
  useEffect(() => {
    (async () => {

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      Location.setGoogleApiKey('AIzaSyDHhmAsz97YrEw-8xqToaNzgs72yeL-i6k')

      let location = await Location.getCurrentPositionAsync({});
      // alert(location)
      //console.log("location  :  ", location)
      setLocation(location);
    })();
  }, []);

  useEffect(() => {
    getAppInformation()
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
  const [fontsLoaded] = Font.useFonts({
    "Poppins-Black": require("./assets/fonts/Poppins-Black.ttf"),
    "Poppins-BlackItalic": require("./assets/fonts/Poppins-BlackItalic.ttf"),
    "Poppins-Bold": require("./assets/fonts/Poppins-Bold.ttf"),
    "Poppins-BoldItalic": require("./assets/fonts/Poppins-BoldItalic.ttf"),
    "Poppins-ExtraBold": require("./assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraBoldItalic": require("./assets/fonts/Poppins-ExtraBoldItalic.ttf"),
    "Poppins-ExtraLight": require("./assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-ExtraLightItalic": require("./assets/fonts/Poppins-ExtraLightItalic.ttf"),
    "Poppins-Italic": require("./assets/fonts/Poppins-Italic.ttf"),
    "Poppins-Light": require("./assets/fonts/Poppins-Light.ttf"),
    "Poppins-LightItalic": require("./assets/fonts/Poppins-LightItalic.ttf"),
    "Poppins-Medium": require("./assets/fonts/Poppins-Medium.ttf"),
    "Poppins-MediumItalic": require("./assets/fonts/Poppins-MediumItalic.ttf"),
    "Poppins-Regular": require("./assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("./assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-SemiBoldItalic": require("./assets/fonts/Poppins-SemiBoldItalic.ttf"),
    "Poppins-Thin": require("./assets/fonts/Poppins-Thin.ttf"),
    "Poppins-ThinItalic": require("./assets/fonts/Poppins-ThinItalic.ttf"),
  });
  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  console.log(location, " Location")
  if (!fontsLoaded) {
    return <AppLoading />;
  }
  return (
    <Provider store={store}>
        <NavigationContainer>{<GestureHandlerRootView style={{ width: '100%', height: '100%', }}>
          <Navigator />
        </GestureHandlerRootView>}</NavigationContainer>
        {showUpdate && <View style={{ width: '100%', height: '100%', backgroundColor: '#000000aa', position: 'absolute', justifyContent: 'center', alignItems: "center" }}>
          <View style={{ width: '80%',  backgroundColor: '#ffffff', borderRadius: 10, paddingVertical: 15, paddingHorizontal: 10 }}>
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
  );
}
//https://expo.dev/accounts/gaurav.sharma

