import React, { useState } from "react"
import { Text, TextInput, TouchableOpacity, View } from "react-native"
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setPopup } from "../actions/message";
import { server } from "../common/apiConstant";
import { buttonBgColor, categorySaperator, screenBgColor, textColor, textInputColor, whiteTxtColor } from "../common/colours";
import ValidationView from "../common/ValidationView";
import Header from "../components/Header";

function OTPLoginScreen(props) {
    const { navigation } = props
    const [mobileNo, setMobile] = useState("")
    const [error, setError] = useState({})
    const [messages, setMesseges] = useState({})

    const generateOtp = async () => {
        if (!mobileNo || mobileNo.length < 10) {
            //alert("Please enter valid mobile no.")
            //setMesseges({ ...messages, "Email ID": "Please enter valid mobile number." })
            setError({ ...error, "Email ID": "Please enter valid mobile number." })

            return;
        }
        // setError({})
        // return;
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "mobile_number": mobileNo
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${server}generateloginotp`, requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log(result)
                if (result && result.status) {
                    setPopup({ message: result.message, status: "success", open: true })

                    navigation.navigate("OTPVerify", { from: "login", mobileNo: mobileNo })
                } else {
                    setPopup({ message: result.message, status: "faliure", open: true })

                }
            })
            .catch(error => console.log('error', error));
    }
    return (
        <View style={{ flex: 1 }}><Header
            navigation={navigation}
            name={""}
        />
            <View style={{ width: '100%', height: '93%', backgroundColor: whiteTxtColor, paddingHorizontal: 15, paddingVertical: 10 }}>
                <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 18, marginTop: 40, color: textColor }}>Mobile*</Text>

                <ValidationView
                    name="Email ID"
                    value={mobileNo}
                    error={error}
                    messages={messages}
                    inputComponent={<TextInput
                        value={mobileNo}
                        onChangeText={(text) => setMobile(text)}
                        placeholder={"912345XXXXX"}
                        placeholderTextColor={categorySaperator}
                        style={{ fontFamily: "Poppins-Regular", fontSize: 12, width: '100%', paddingVertical: 15, borderBottomColor: screenBgColor, borderBottomWidth: 1, color: textInputColor }}
                    />}
                />
                {/* <TextInput
                    value={registerEmail}
                    style={{ fontSize: 12, fontFamily: 'Poppins-SemiBold', flex: .95, paddingVertical: 10, borderBottomColor: screenBgColor, borderBottomWidth: 1, marginTop: 20 }}
                    placeholder="Email ID"
                    onChangeText={(text) => setRegisterEmail(text)}
                /> */}
                <TouchableOpacity
                    onPress={generateOtp}
                    style={{ backgroundColor: buttonBgColor, padding: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}><Text style={{ color: whiteTxtColor, fontFamily: 'Poppins-SemiBold', fontSize: 18 }}>Login</Text></TouchableOpacity>
                <Text
                    onPress={() => navigation.goBack()}
                    style={{ fontFamily: "Poppins-Regular", fontSize: 18, marginTop: 15, color: textInputColor, alignSelf: 'center' }}>Don't have an account? <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 20, color: buttonBgColor }}>Register</Text></Text>

            </View>
        </View>
    )
}
const mapStateToProps = (state) => {
    // console.log("redux state : ", state)
    return {

    }
};
const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        ...bindActionCreators({ setPopup }, dispatch),
    }

}


const OTPLogin = connect(mapStateToProps, mapDispatchToProps)(OTPLoginScreen);
export default OTPLogin;

