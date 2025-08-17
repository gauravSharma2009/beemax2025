import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, PermissionsAndroid, Platform, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Geolocation from 'react-native-geolocation-service';
import { allCategoryPink, textColor } from '../common/colours';
import { changeAddressState, changePinCodeState } from '../actions/pincodeAction';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Header from '../components/Header';
import { storeData } from '../common/asyncStore';

const Pincode = (props) => {
  const { navigation, changePinCodeState, changeAddressState } = props
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [count, setCount] = useState(0)
  const [previousCount, setPreviousCount] = useState(0)

  const [currentLocation, setCurrentLocation] = useState(null);
  const API_KEY = 'AIzaSyDHhmAsz97YrEw-8xqToaNzgs72yeL-i6k';

  useEffect(() => {
    setPreviousCount(count)
    setCount(pincode.length)
  }, [pincode])
  useEffect(() => {
    if (previousCount == 5 && count !== 5) {
      //call api to get address from pincode
      getAddressFromPinCode()
    }
  }, [count])
  const getAddressFromPinCode = async () => {
    // Construct the URL for the Geocoding API request
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:${pincode}&key=${API_KEY}`;

    // Make the API request using the fetch function
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
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
          setPincode('' + (postalCode?.short_name || ""))
          setAddress(addressCreated)
          return
        } else {
          console.error(`Geocoding API request failed with status: ${data.status}`);
        }
      })
      .catch((error) => {
        console.error(`Error fetching data: ${error.message}`);
      });
  }


  async function fetchAddressFromLocation(latitude, longitude) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Geocoding API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("data  :  ", JSON.stringify(data.results[0]))

      if (data.status === 'OK') {
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

        setPincode('' + (postalCode?.short_name || ""))
        setAddress(addressCreated)
        return
      } else {
        console.error('Geocoding API Error:', data.error_message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching address:', error.message);
      return null;
    }
  }

  useEffect(() => {
    if (currentLocation) {
      console.log(" calling address ")
      fetchAddressFromLocation(currentLocation?.coords?.latitude, currentLocation?.coords?.longitude)
    }
  }, [currentLocation])

  const handleGetCurrentLocation = async () => {
    setPreviousCount(0)
    setCount(0)
    setPincode("")
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
          setCurrentLocation(position);
        },
        (error) => {
          // See error code charts below.
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    })
  };

  // return (<View style={{width:'100%', height:"100%", backgroundColor:'red'}}></View>)
  return (
    <View style={{
      flex: 1,
    }}>
      <Header
        navigation={navigation}
        name={"Your Location"}
      />
      <View style={styles.container}>

        <TextInput
          style={styles.input}
          placeholder="Enter your pincode"
          keyboardType="numeric"
          placeholderTextColor={textColor}
          maxLength={6}
          value={pincode}
          onChangeText={text => {
            setPincode(text)
          }}
        />
        {address ? <Text>{address || ""}</Text> : null}
        <View style={styles.locationContainer}>
          {/* <Ionicons name="location" size={32} color={allCategoryPink} /> */}
               <Image
                    source={require('../../assets/icons/location.png')}
                    style={{ width: 32, height: 32, resizeMode: 'contain' }}
                />
          <View>
            <TouchableOpacity onPress={handleGetCurrentLocation}>
              <Text style={styles.locationText}>Current Location</Text>
              <Text style={styles.locationText2}>Using GPS</Text>

            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (pincode && pincode !== 'undefined' && address) {
              storeData("pincode", pincode)
              changePinCodeState(pincode)
              storeData("address", address)
              changeAddressState(address)
              navigation.goBack()
            } else {

            }
          }}
          style={styles.button}>
          <Text style={styles.buttonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    marginTop: 20,
    backgroundColor: '#e1e1e1',
    color:textColor
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20
  },
  locationText: {
    color: allCategoryPink,
    marginLeft: 10,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18

  },
  locationText2: {
    color: allCategoryPink,
    marginLeft: 10,
    fontFamily: 'Poppins-Regular',
    fontSize: 20
  },
  button: {
    width: '20%',
    backgroundColor: allCategoryPink,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: 20
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    alignSelf: 'center'
  },
});


const mapStateToProps = (state) => {
  return {

  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
    ...bindActionCreators({ changePinCodeState, changeAddressState }, dispatch),
  }

}

const PincodePage = connect(mapStateToProps, mapDispatchToProps)(Pincode);
export default PincodePage;

