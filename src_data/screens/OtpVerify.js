import React, { useState } from "react"
import { Text, TouchableOpacity, View, StyleSheet } from "react-native"
import { buttonBgColor, categorySaperator, textColor, textInputColor, whiteTxtColor } from "../common/colours";
import Header from "../components/Header";
import OTPInputView from '@twotalltotems/react-native-otp-input'
import { getData, storeData } from "../common/asyncStore";
import { changeAuthState } from '../actions/authAction';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { server } from "../common/apiConstant";

function OTPVerifyScreen(props) {
    const { navigation, changeAuthState, route } = props
    const { mobileNo, from } = route?.params
    const [otp, setOtp] = useState("")
    const verifyOtp = async () => {
        if (!otp || otp.length < 6) {
            alert("Invalid Otp")
            return;
        }
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "ci_session=08eb53ea54d4e003cdb873f4ad50e98625f98a94");

        var raw = JSON.stringify({
            "mobile_number": mobileNo,
            "otp_number": otp
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${server}otplogin`, requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log(JSON.stringify(result))
                if (result && result.status) {
                    storeData("loginData", JSON.stringify(result.data))
                    storeData("isLogin", "true")
                    cartmerge(result.data)
                    //changeAuthState(true)
                } else {
                    alert(result.message)
                }
            })
            .catch(error => console.log('error', error));
    }
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
                console.log(result)
            })
            .catch(error => {
                changeAuthState(true)
                console.log('error', error)
            });
    }

    return (
        <View style={{ flex: 1 }}><Header
            navigation={navigation}
            name={""}
        />
            <View style={{ width: '100%', height: '93%', backgroundColor: whiteTxtColor, paddingHorizontal: 15, paddingVertical: 10 }}>
                <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 18, marginTop: 40, color: textColor }}>Verify Mobile Number*</Text>
                {/* <TextInput
                    value={mobileNo}
                    onChangeText={(text) => setMobile(text)}
                    placeholder={"912345XXXXX"}
                    placeholderTextColor={categorySaperator}
                    style={{ fontFamily: "Poppins-Regular", fontSize: 18, width: '100%', paddingVertical: 15, borderBottomColor: categorySaperator, borderBottomWidth: 1, color: textInputColor }}
                /> */}
                <OTPInputView
                    style={{ width: '80%', height: 120, alignSelf: 'center' }}
                    pinCount={6}
                    code={otp} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
                    onCodeChanged={code => setOtp(code)}
                    autoFocusOnLoad
                    codeInputFieldStyle={styles.underlineStyleBase}
                    codeInputHighlightStyle={styles.underlineStyleHighLighted}
                    onCodeFilled={(code => {
                        console.log(`Code is ${code}, you are good to go!`)
                    })}
                />

                <TouchableOpacity
                    onPress={verifyOtp}
                    style={{ backgroundColor: buttonBgColor, padding: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}><Text style={{ color: whiteTxtColor, fontFamily: 'Poppins-SemiBold', fontSize: 18 }}>Continue</Text></TouchableOpacity>
                <Text
                    onPress={() => navigation.goBack()}
                    style={{ fontFamily: "Poppins-Regular", fontSize: 18, marginTop: 15, color: buttonBgColor, alignSelf: 'center' }}>Resend Confirmation Code <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 18, color: textInputColor }}>{"00:59"}</Text></Text>

            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    borderStyleBase: {
        width: 30,
        height: 45
    },

    borderStyleHighLighted: {
        borderColor: categorySaperator,
    },

    underlineStyleBase: {
        width: 30,
        height: 45,
        borderWidth: 0,
        borderBottomWidth: 1,
        borderColor: categorySaperator
    },

    underlineStyleHighLighted: {
        borderColor: categorySaperator,
    },
});

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        ...bindActionCreators({ changeAuthState }, dispatch),
    }

}
const mapStateToProps = (state) => {
    //console.log("redux state : ", state.languageDat)
    return {

    }
}
const OTPVerify = connect(mapStateToProps, mapDispatchToProps)(OTPVerifyScreen);
export default OTPVerify;

// const OTPVerify = OTPVerifyScreen;
// export default OTPVerify;