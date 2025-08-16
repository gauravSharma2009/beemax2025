import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, TouchableOpacity } from 'react-native';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import { server } from '../common/apiConstant';
import { getData, storeData } from '../common/asyncStore';
import { changeAuthState } from '../actions/authAction';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { allCategoryPink } from '../common/colours';
import { setPopup } from '../actions/message';
//import axios from 'axios';

const BACKGROUND_IMAGE = require('../../assets/background.png');

const OTPVerificationScreen = (props) => {
  const { navigation, route, changeAuthState, setPopup } = props
  const { mobileNo, from } = route?.params
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [messageVisible, setMessageVisible] = useState(false);
  const [apiStatus, setApiStatus] = useState("success");
  const [message, setmessage] = useState('');

  useEffect(() => {
    let intervalId;

    if (countdown > 0) {
      intervalId = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [countdown]);

  const handleVerify = async () => {
    var raw = JSON.stringify({
      "mobile": mobileNo,
      "otp": otp
    });
    console.log("raw  :  ", raw)
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Cookie", "ci_session=08eb53ea54d4e003cdb873f4ad50e98625f98a94");
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch(`${server}otpverification`, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result)
  

          if (result && result.status) {
            storeData("loginData", JSON.stringify(result.data))
            storeData("isLogin", "true")

            cartmerge(result.data)
            setPopup({ message: result.message, status: "success", open: true })

            //changeAuthState(true)
          } else {
            setPopup({ message: result.message, status: "faliure", open: true })

          }
        
      })
      .catch(error => console.log('error', error));
  };
  const cartmerge = async (user) => {
    const uniqueId = await getData("uniqueId")
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Cookie", "ci_session=08eb53ea54d4e003cdb873f4ad50e98625f98a94");

    var raw = JSON.stringify({
      "user_id": user?.USER_ID,
      "device_id": uniqueId
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch(`${server}cartmerge`, requestOptions)
      .then(response => response.json())
      .then(result => {
        changeAuthState(true)
        navigation.navigate("Tabs")
        console.log(result)
      })
      .catch(error => {
        //changeAuthState(true)
        console.log('error', error)
      });
  }
  const handleResend = async () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      "mobile": mobileNo
    });
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch(`${server}login`, requestOptions)
      .then(response => response.json())
      .then(result => {
        if (result.status) {
          setPopup({ message: result.message, status: "success", open: true })
        } else {
          setPopup({ message: result.message, status: "faliure", open: true })
        }

      })
      .catch(error => console.log('error', error));
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={BACKGROUND_IMAGE} style={{ flex: 1 }}>
        <View style={{ marginTop: 100 }}>
          <Text style={{ textAlign: 'center', fontSize: 20, color: 'white' }}>
            Enter Verification Code
          </Text>
          <OTPInputView
            style={{ width: '80%', height: 100, alignSelf: 'center' }}
            pinCount={6}
            onCodeChanged={(code) => setOtp(code)}
            autoFocusOnLoad
            codeInputFieldStyle={{
              borderRadius: 10,
              backgroundColor: '#ffffff',
              color: '#000000',
              borderWidth: 2,
            }}
            codeInputHighlightStyle={{
              borderColor: '#007AFF',
              backgroundColor: '#ffffff',
            }}
          />
          <TouchableOpacity
            onPress={handleVerify}
            style={{
              borderRadius: 10,
              backgroundColor: allCategoryPink,
              paddingVertical: 10,
              paddingHorizontal: 20,
              marginTop: 20,
              width: "80%", alignSelf: 'center'
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 20, alignSelf: 'center' }}>Continue</Text>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 20,
            }}
          >
            <Text style={{ textAlign: 'center', color: "white" }}>Didn't receive code? </Text>
            <TouchableOpacity onPress={handleResend}>
              {countdown === 0 ? (
                <Text style={{ color: allCategoryPink }}>Resend code</Text>
              ) : (
                <Text style={{ color: '#007AFF' }}>
                  Resend code in {countdown} seconds
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

    </View>
  );
};
const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
    ...bindActionCreators({ changeAuthState, setPopup }, dispatch),
  }

}
const mapStateToProps = (state) => {
  //console.log("redux state : ", state.languageDat)
  return {

  }
}

const OTPVerify = connect(mapStateToProps, mapDispatchToProps)(OTPVerificationScreen);
export default OTPVerify;
