import React, { useEffect, useState } from "react"
import { Text, TextInput, TouchableOpacity, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { server } from "../common/apiConstant";
import { getData } from "../common/asyncStore";
import { buttonBgColor, screenBgColor, textColor, whiteTxtColor } from "../common/colours";
import Header from "../components/Header";
import { setPopup } from "../actions/message";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

function PasswordChangeScreen(props) {
    const { navigation, setPopup } = props
    const [loginEmail, setLoginEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")
 
    const changepassword = async () => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const loginData = await getData("loginData")
        const userData = JSON.parse(loginData)
        var raw = JSON.stringify({
            "user_id": userData?.USER_ID,
            "password": userData?.USER_ID
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${server}changepassword`, requestOptions)
            .then(response => response.json())
            .then(result => {
                if (result && result.status) {
                    setLoginEmail("")
                    setLoginPassword("")
                    setPopup({ message: result.message, status: "success", open: true })

                } else
                    setPopup({ message: result.message, status: "faliure", open: true })


                console.log(result)
            })
            .catch(error => console.log('error', error));
    }
    return (
        <View style={{ flex: 1 }}><Header
            navigation={navigation}
            name={"Change Password"}
        />
            <KeyboardAwareScrollView style={{ width: '100%', paddingHorizontal: 20, backgroundColor: 'white', }}>
                <View style={{ flexDirection: 'row', }}>
                    <View style={{ flex: .5 }}>

                        <TextInput
                            value={loginEmail}
                            style={{ marginRight: 5, fontSize: 12, fontFamily: 'Poppins-Regular', paddingVertical: 10, borderBottomColor: screenBgColor, borderBottomWidth: 1, marginTop: 20, paddingHorizontal: 10 }}
                            placeholder="Password"
                            onChangeText={(text) => setLoginEmail(text)}

                        />
                    </View>
                    <View style={{ flex: .5 }}>

                        <TextInput
                            value={loginPassword}
                            style={{ marginLeft: 5, fontSize: 12, fontFamily: 'Poppins-Regular', paddingVertical: 10, borderBottomColor: screenBgColor, borderBottomWidth: 1, marginTop: 20, paddingHorizontal: 10 }}
                            placeholder="Confirm Password"
                            onChangeText={(text) => setLoginPassword(text)}
                        />
                    </View>

                </View>


                <TouchableOpacity
                    onPress={changepassword}
                    style={{ backgroundColor: buttonBgColor, padding: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginTop: 30 }}><Text style={{ color: whiteTxtColor, fontFamily: 'Poppins-SemiBold', fontSize: 18 }}>Save</Text></TouchableOpacity>
            </KeyboardAwareScrollView>
           
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
        ...bindActionCreators({ changeLoadingState, setPopup }, dispatch),
    }

}

const PasswordChange = connect(mapStateToProps, mapDispatchToProps)(PasswordChangeScreen);
export default PasswordChange;