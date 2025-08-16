import React, { useState } from 'react';
import { View, useWindowDimensions, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeAuthState } from '../actions/authAction';
import { setPopup } from '../actions/message';
import { server } from '../common/apiConstant';
import { storeData } from '../common/asyncStore';
import { BackgroundGray, buttonBgColor, categorySaperator, productBorderColor, screenBgColor, textColor, whiteTxtColor } from '../common/colours';
import Header from '../components/Header';


function CartLoginScreen(props) {
    const { navigation, changeAuthState, route ,setPopup} = props
    const { from } = route?.params
    const [index, setIndex] = useState(0)
    const layout = useWindowDimensions();
    const [registername, setRegisterName] = useState("")
    const [registerEmail, setRegisterEmail] = useState("")
    const [registerMobile, setRegisterMobile] = useState("")
    const [registerPassword, setRegisterPassword] = useState("")
    const [loginEmail, setLoginEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")
    const [error, setError] = useState({})
    const [messages, setMesseges] = useState({})

    const loginComponent = () => (<View style={{ width: '100%', backgroundColor: whiteTxtColor, paddingHorizontal: 20, marginTop: 10 }}>
       <Text
            style={{ fontSize: 12, color: textColor, fontFamily: 'Poppins-SemiBold', marginTop: 10, }}>{"Username*"}</Text>
        <ValidationView
            name="Email Login"
            value={loginEmail}
            error={error}
            messages={messages}
            inputComponent={<TextInput
                value={loginEmail}
                style={{ fontSize: 12, fontFamily: 'Poppins-SemiBold', flex: .95, paddingVertical: 10, borderBottomColor: screenBgColor, borderBottomWidth: 1, marginTop: 20 }}
                placeholder="Email ID"
                onChangeText={(text) => setLoginEmail(text)}

            />}
        />

        <Text
            style={{ fontSize: 12, color: textColor, fontFamily: 'Poppins-SemiBold', marginTop: 10, }}>{"Password*"}</Text>
        <ValidationView
            name="Full Login Name"
            value={loginPassword}
            error={error}
            messages={messages}
            inputComponent={<TextInput
                secureTextEntry={true}
                value={loginPassword}
                style={{ fontSize: 12, fontFamily: 'Poppins-SemiBold', flex: .95, paddingVertical: 10, borderBottomColor: screenBgColor, borderBottomWidth: 1, marginTop: 20 }}
                placeholder="Password"
                onChangeText={(text) => setLoginPassword(text)}
            />}
        />


        <TouchableOpacity
            onPress={makeLogin}
            style={{ backgroundColor: buttonBgColor, padding: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}><Text style={{ color: whiteTxtColor, fontFamily: 'Poppins-SemiBold', fontSize: 18 }}>Login</Text></TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, }}>
            <View style={{ height: 1, width: '28%', backgroundColor: categorySaperator, alignSelf: 'center' }}></View>
            <Text
                style={{ fontSize: 18, color: categorySaperator, fontFamily: 'Poppins-Regular', alignSelf: 'center', marginHorizontal: 10 }}>{"or connect with"}</Text>
            <View style={{ height: 1, width: '28%', backgroundColor: categorySaperator, alignSelf: 'center' }}></View>

        </View>

    </View>)
    const registerComponent = () => (<View style={{ width: '100%', backgroundColor: whiteTxtColor, paddingHorizontal: 20, marginTop: 10 }}>
        <Text
            style={{ fontSize: 12, color: textColor, fontFamily: 'Poppins-SemiBold', marginTop: 10, }}>{"Name*"}</Text>
        <ValidationView
            name="Full Name"
            value={registername}
            error={error}
            messages={messages}
            inputComponent={<TextInput
                value={registername}
                style={{ fontSize: 12, fontFamily: 'Poppins-SemiBold', flex: .95, paddingVertical: 10, borderBottomColor: screenBgColor, borderBottomWidth: 1, marginTop: 20 }}
                placeholder="Full Name"
                onChangeText={(text) => setRegisterName(text)}
            />}
        />

        <Text
            style={{ fontSize: 12, color: textColor, fontFamily: 'Poppins-SemiBold', marginTop: 10, }}>{"Username*"}</Text>
        <ValidationView
            name="Email ID"
            value={registerEmail}
            error={error}
            messages={messages}
            inputComponent={<TextInput
                value={registerEmail}
                style={{ fontSize: 12, fontFamily: 'Poppins-SemiBold', flex: .95, paddingVertical: 10, borderBottomColor: screenBgColor, borderBottomWidth: 1, marginTop: 20 }}
                placeholder="Email ID"
                onChangeText={(text) => setRegisterEmail(text)}
            />}
        />

        <Text
            style={{ fontSize: 12, color: textColor, fontFamily: 'Poppins-SemiBold', marginTop: 10, }}>{"Mobile*"}</Text>
        <ValidationView
            name="Mobile Number"
            value={registerMobile}
            error={error}
            messages={messages}
            inputComponent={<TextInput
                value={registerMobile}
                onChangeText={(text) => setRegisterMobile(text)}
                style={{ fontSize: 12, fontFamily: 'Poppins-SemiBold', flex: .95, paddingVertical: 10, borderBottomColor: screenBgColor, borderBottomWidth: 1, marginTop: 20 }}
                placeholder="Mobile Number"
            />}
        />

        <Text
            style={{ fontSize: 12, color: textColor, fontFamily: 'Poppins-SemiBold', marginTop: 10, }}>{"Password*"}</Text>
        <ValidationView
            name="Password"
            value={registerPassword}
            error={error}
            messages={messages}
            inputComponent={<TextInput
                secureTextEntry={true}
                value={registerPassword}
                onChangeText={(text) => setRegisterPassword(text)}
                style={{ fontSize: 12, fontFamily: 'Poppins-SemiBold', flex: .95, paddingVertical: 10, borderBottomColor: screenBgColor, borderBottomWidth: 1, marginTop: 20 }}
                placeholder="Password"
            />}
        />

        <TouchableOpacity
            onPress={() => registerUser()}
            style={{ backgroundColor: buttonBgColor, padding: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}><Text style={{ color: whiteTxtColor, fontFamily: 'Poppins-SemiBold', fontSize: 18 }}>Register</Text></TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, }}>
            <View style={{ height: 1, width: '28%', backgroundColor: categorySaperator, alignSelf: 'center' }}></View>
            <Text
                style={{ fontSize: 18, color: categorySaperator, fontFamily: 'Poppins-Regular', alignSelf: 'center', marginHorizontal: 10 }}>{"or connect with"}</Text>
            <View style={{ height: 1, width: '28%', backgroundColor: categorySaperator, alignSelf: 'center' }}></View>

        </View>

    </View>)
    const makeLogin = async () => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "ci_session=ef406ed21e3bbac6c387904af825bbe78b1013d6");
        let errorObject = {}

        let valid = true
    
        if (!loginEmail) {
            errorObject={ ...errorObject, "Email Login": "Please enter Email ID." }
            valid = false
        }
        if (!loginPassword) {
            errorObject={ ...errorObject, "Full Login Name": "Please enter Password." }
            valid = false
        }
        if (!valid) {
            setError(errorObject)
            return;
        } else {
            setError({})
        }
        var raw = JSON.stringify({
            "email": loginEmail,
            "password": loginPassword
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
                if (result && result.status) {
                    storeData("loginData", JSON.stringify(result.data))
                    storeData("isLogin", "true")
                    changeAuthState(true)
                    if (from && from === 'cart')
                        navigation.goBack()
                } else {
                    setPopup({ message: result.message, status: "faliure", open: true })

                }
            })
            .catch(error => console.log('error', error));
    }

    const registerUser = async () => {
        let errorObject = {}

        let valid = true
        if (!registername) {
            valid = false
            errorObject = { ...errorObject, "Full Name": "Please enter your name." }
        }
        if (!registerEmail) {
            valid = false
            errorObject = { ...errorObject, "Email ID": "Please enter Email ID." }
        }
        if (!registerMobile || registerMobile.length < 10) {
            valid = false
            errorObject = { ...errorObject, "Mobile Number": "Please enter valid Mobile number." }
        }
        if (!registerPassword) {
            valid = false
            errorObject = { ...errorObject, "Password": "Please enter Password." }
        }
        if (!valid) {
            setError(errorObject)
            return;
        } else {
            setError({})
        }

        const data = {
            "name": registername,
            "email": registerEmail,
            "mobile": registerMobile,
            "password": registerPassword
        }
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "ci_session=b2b15f331491ee2c6cec7cdccc013fbab42723a9");

        var raw = JSON.stringify(data);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${server}register`, requestOptions)
            .then(response => response.json())
            .then(result => {
                if (result && result.status) {
                    setRegisterName("")
                    setRegisterEmail("")
                    setRegisterMobile("")
                    setRegisterPassword("")
                    setPopup({ message: result.message, status: "success", open: true })

                }else{
                    setPopup({ message: result.message, status: "faliure", open: true })

                }
                
                console.log(result)
            })
            .catch(error => console.log('error', error));
    }

    return (
        <View style={{ flex: 1 }}>
            <Header
                navigation={props.navigation}
                name={"Account"}
            />
            <View style={{ width: '100%', height: '7%', flexDirection: 'row', backgroundColor: whiteTxtColor }}>
                <TouchableOpacity
                    onPress={() => setIndex(0)}
                    style={{ paddingHorizontal: 20, paddingVertical: 5, borderBottomColor: index === 0 ? buttonBgColor : "transparent", borderBottomWidth: 3 }}
                >
                    <Text
                        style={{ fontSize: 18, color: textColor, fontFamily: 'Poppins-Regular', marginTop: 10, }}>{"Login"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setIndex(1)}
                    style={{ paddingHorizontal: 20, paddingVertical: 5, borderBottomColor: index === 1 ? buttonBgColor : "transparent", borderBottomWidth: 3 }}
                >
                    <Text
                        style={{ fontSize: 18, color: textColor, fontFamily: 'Poppins-Regular', marginTop: 10, }}>{"Register"}</Text>
                </TouchableOpacity>


            </View>
            <ScrollView style={{ width: "100%", height: '86%', }}>
                {index === 0 ? <View>{loginComponent()}</View> : <View>{registerComponent()}</View>}
            </ScrollView>
        </View>
    );
}

const mapStateToProps = (state) => {
    //console.log("redux state : ", state.languageDat)
    return {

    }
};
const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        ...bindActionCreators({ changeAuthState ,setPopup}, dispatch),
    }

}

const CartLogin = connect(mapStateToProps, mapDispatchToProps)(CartLoginScreen);
export default CartLogin;
