// In App.js in a new project

import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { getData } from '../common/asyncStore';
import Login from '../screens/Login';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeAuthState } from '../actions/authAction';
import Account from '../screens/MyAccount';
import Profile from '../screens/Profile';
import Orders from '../screens/MyOrder';
import Address from '../screens/MyAddresses';
import PasswordChange from '../screens/PasswordChange';
import AboutUs from '../screens/AboutUs';
import NeedHelp from '../screens/NeedHelp';
import OrderDetails from '../screens/OrderDetails';
import OTPLogin from '../screens/LoginWithOTP';
import OTPVerify from '../screens/OtpVerify';
import LoginWithOtpNew from '../screens/LoginWithOTPNew'
import OTPVerificationScreen from '../screens/OTPVerifyNew';

const Stack = createNativeStackNavigator();

function UserNavigatorScreen(props) {
    const { isLoggedIn, changeAuthState } = props
    useEffect(() => {
        const getLogin = async () => {
            const isLogin = await getData("isLogin")
            //alert(isLoggedIn)
            if (isLogin && isLogin === 'true') {
                changeAuthState(true)
            }
        }
        getLogin()
    }, [isLoggedIn])
    return (
        !isLoggedIn ? <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}
        >
            {/* <Stack.Screen name="Login" component={Login} /> */}
            <Stack.Screen name="OTPLogin" component={LoginWithOtpNew} />
            <Stack.Screen name="OTPVerify" component={OTPVerificationScreen} />
        </Stack.Navigator> : <Stack.Navigator
            screenOptions={{
                headerShown: false
            }} >
            <Stack.Screen name="Account" component={Account} />
            <Stack.Screen name="MyProfile" component={Profile} />
            <Stack.Screen name="MyOrders" component={Orders} />
            <Stack.Screen name="MyAddress" component={Address} />
            <Stack.Screen name="PasswordChange" component={PasswordChange} />
            <Stack.Screen name="AboutUs" component={AboutUs} />
            <Stack.Screen name="NeedHelp" component={NeedHelp} />
            <Stack.Screen name="OrderDetails" component={OrderDetails} />


        </Stack.Navigator >
    );
}

const mapStateToProps = (state) => {
    //console.log("redux state : ", state.languageDat)
    return {
        isLoggedIn: state.auth.isLoggedIn,
    }
};
const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        ...bindActionCreators({ changeAuthState }, dispatch),
    }

}

const UserNavigator = connect(mapStateToProps, mapDispatchToProps)(UserNavigatorScreen);
export default UserNavigator;

