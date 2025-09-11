import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Categories from "../screens/Categories";
import Offers from "../screens/Offers";
import Cart from "../screens/Cart";
import Account from "../screens/Account";

import HomeStack from "./HomeNavigator";
import CategoriesStack from "./CategoriesNavigator";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductListing from "../screens/ProductListing";
import ProductDetails from "../screens/ProductDetails";
import UserNavigator from "./UserNavigator";
import LoginWithOTPNew from "../screens/LoginWithOTPNew";
import CartLogin from "../screens/CartLogin";
import Address from "../screens/MyAddresses";
import CustomTab from "../common/CustomTab";
import { ActivityIndicator, Platform, View } from "react-native";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { textColor } from "../common/colours";
import OTPVerify from "../screens/OTPVerifyNew";
import { SafeAreaView } from "react-native";
import { StatusBar } from "react-native"
import CustomModal from "../common/CustomModal";
import { setPopup } from "../actions/message";
import ProductSearchPage from "../screens/Search";
import Cms from "../screens/CmsPage";
import AutoSuggestSearchPage from "../screens/AutoSuggestSearchPage";
import { SafeAreaProvider } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

function NavigatorScreen(props) {
    const { isLoading, message, status, open, setPopup, appHeaderColor } = props
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{
                width: '100%', height: '100%', backgroundColor: appHeaderColor,
                // paddingBottom: Platform.OS === 'ios' ? 0 : 25, paddingTop: Platform.OS === 'ios' ? 0 : 42

            }}>
                <StatusBar style="light"
                    backgroundColor={appHeaderColor}
                />
                <View style={{ width: '100%', height: '100%' }}>
                    <Stack.Navigator
                        screenOptions={{
                            headerShown: false
                        }}
                    >
                        <Stack.Screen name="Tabs" component={MyTabs} />
                        <Stack.Screen name="ProductListing" component={ProductListing} />
                        <Stack.Screen name="ProductDetails" component={ProductDetails} />
                        <Stack.Screen name="CmsPage" component={Cms} />
                        <Stack.Screen name="Cart" component={Cart} />
                        <Stack.Screen name="LoginScreen" component={CartLogin} />
                        <Stack.Screen name="MyAddress" component={Address} />
                        <Stack.Screen name="LoginFlow" component={LoginWithOTPNew} />
                        <Stack.Screen name="OtpVerifyFlow" component={OTPVerify} />
                        <Stack.Screen name="UserScreen" component={UserNavigator} />
                        <Stack.Screen name="ProductSearchPage" component={ProductSearchPage} />
                        <Stack.Screen name="AutoSuggestSearchPage" component={AutoSuggestSearchPage} />


                    </Stack.Navigator>
                    {isLoading && <View style={{ position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator
                            size={50}
                            color="green"
                        />

                    </View>}
                    <CustomModal
                        visible={open}
                        status={status}
                        message={message}
                        closeModal={() => setPopup({ message: "", status: "", open: false })} />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

// function NavigatorScreen(props) {
//     const { isLoading, message, status, open, setPopup } = props
//     return (
//        <View> <Text>Hello this is the project</Text></View>
//     );
// }




function MyTabs() {
    return (
        <Tab.Navigator
            initialRouteName="HomeStack"
            screenOptions={{
                // tabBarActiveTintColor: '#e91e63',
                headerShown: false
            }}
            tabBar={(props) => <CustomTab {...props}
            />
            }
        >
            <Tab.Screen
                name="HomeStack"
                component={HomeStack}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home" color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name="CategoriesStack"
                component={CategoriesStack}
                options={{
                    tabBarLabel: 'Categories',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Offers"
                component={Offers}
                options={{
                    tabBarLabel: 'Offers',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="bell" color={color} size={size} />
                    ),
                    tabBarBadge: 3,
                }}
            />
            <Tab.Screen
                name="Cart"
                component={Cart}
                options={{
                    tabBarLabel: 'Cart',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account" color={color} size={size} />
                    ),
                    tabBarBadge: 2,

                }}
            />
            <Tab.Screen
                name="User"
                component={UserNavigator}
                options={{
                    tabBarLabel: 'User',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account" color={color} size={size} />
                    ),

                }}
            />
        </Tab.Navigator>
    );
}


const mapStateToProps = (state) => {
    // console.log("redux state : ", state)
    const message = state.message.message;
    const status = state.message.status;
    const open = state.message.open;
    console.log("message  :  ", message, "  status : ", status, "  open  : ", open)
    return {
        isLoading: state.loader.isLoading,
        message: message,
        status: status,
        open: open,
        appHeaderColor: state.appHeaderColor.appHeaderColor,
        //isLoading: true

    }
};
const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        ...bindActionCreators({ setPopup }, dispatch),
    }

}

const Navigator = connect(mapStateToProps, mapDispatchToProps)(NavigatorScreen);
export default Navigator;