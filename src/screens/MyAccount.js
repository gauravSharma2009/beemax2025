import React, { useEffect, useState } from 'react';
import { View, useWindowDimensions, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeAuthState } from '../actions/authAction';
import { getData, storeData } from '../common/asyncStore';
import { allCategoryPink, BackgroundGray, buttonBgColor, categorySaperator, offPurpleColor, productBorderColor, screenBgColor, textColor, whiteTxtColor } from '../common/colours';
import Header from '../components/Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';

import { Image } from 'react-native';

function AccountScreen(props) {
    const { navigation, changeAuthState } = props
    const [userData, setuserData] = useState(null)

    useEffect(() => {
        // alert("Hello 1")
        getUserData()
    }, [])
    const getUserData = async () => {
        const loginData = await getData("loginData")
        const user = JSON.parse(loginData)
        console.log("loginData :  ", loginData)
        setuserData(user)
    }
    return (
        <View style={{ flex: 1, backgroundColor: whiteTxtColor }}>
            {/* <Header
                navigation={props.navigation}
                name={"My Account"}
            /> */}
            <View style={{ flex: .06, width: "100%", backgroundColor: '#3b006a', flexDirection: 'row', paddingVertical: 15, }}>
                <TouchableOpacity
                style={{alignSelf:'center'}}
                    onPress={() => navigation.goBack()}
                >
                    <Image
                        source={require('../../assets/icons/back.png')}
                        style={{ width: 32, height: 32, resizeMode: 'contain', tintColor: '#FFFFFF', alignSelf: 'center', marginLeft: 10 }}
                    />
                </TouchableOpacity>

                <View style={{ alignSelf: 'center', justifyContent: 'center', marginLeft: 100 }}>
                    <Text style={{ fontFamily: 'Poppins-SemiBold', alignSelf: 'center', color: 'white', fontSize: 20 }}>Hello, {userData?.USER_NAME}</Text>
                </View>


            </View>
            <ScrollView style={{ width: '100%', flex: .94 }}>
                {/* <TouchableOpacity style={{ flexDirection: 'row', paddingVertical: 25, borderBottomWidth: 5, borderTopWidth: 0, borderTopColor: categorySaperator, borderBottomColor: categorySaperator, }}>
                    <Ionicons
                        //onPress={() => navigation.goBack()}
                        style={{ marginLeft: 10, alignSelf: 'center' }}
                        name="ios-chevron-back-outline" size={32} color={textColor} />
                    <Text style={{ fontSize: 18, marginLeft: 20, fontFamily: 'Poppins-SemiBold', color: textColor, alignSelf: 'center' }}>{"Hello, " + userData?.USER_NAME}</Text>
                </TouchableOpacity> */}



                {/* <TouchableOpacity
                    onPress={() => navigation.navigate("PasswordChange")}

                    style={{ flexDirection: 'row', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: categorySaperator, marginTop: 5, paddingHorizontal: 10 }}>
                    <Ionicons
                        //onPress={() => navigation.goBack()}
                        style={{ marginLeft: 10, alignSelf: 'center' }}
                        name="ios-chevron-back-outline" size={32} color={textColor} />
                    <Text style={{ fontSize: 18, marginLeft: 20, fontFamily: 'Poppins-Regular', color: textColor, alignSelf: 'center' }}>{"Password Change"}</Text>
                </TouchableOpacity> */}
                {/* <TouchableOpacity
                    onPress={() => {
                        //alert("Hello")
                        storeData("loginData", "")
                        storeData("isLogin", "false")
                        changeAuthState(false)
                        // navigation.navigate("Login")
                    }}
                    style={{ flexDirection: 'row', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: categorySaperator, marginTop: 5, paddingHorizontal: 10 }}>
                    <Ionicons

                        style={{ marginLeft: 10, alignSelf: 'center' }}
                        name="ios-chevron-back-outline" size={32} color={textColor} />
                    <Text style={{ fontSize: 18, marginLeft: 20, fontFamily: 'Poppins-Regular', color: textColor, alignSelf: 'center' }}>{"Logout"}</Text>
                </TouchableOpacity> */}

                <View style={{ padding: 10 }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("MyOrders")}
                        style={{ justifyContent: 'space-between', borderRadius: 10, borderWidth: 1, borderColor: "gray", flexDirection: 'row', paddingVertical: 15, marginTop: 0, paddingHorizontal: 10, }}>
                        <View style={{ alignSelf: 'center', flexDirection: 'row' }}>
                            <Image
                                style={{ width: 30, height: 30 }}
                                source={require('../../assets/my-order.png')}
                            />
                            <Text style={{ fontSize: 18, marginLeft: 20, fontFamily: 'Poppins-SemiBold', color: textColor, alignSelf: 'center' }}>{"Orders"}</Text>

                        </View>
                       <Image
                            style={{ marginLeft: 10, alignSelf: 'center', width: 18, height: 18 }}
                            source={require('../../assets/right-arrow.png')} />
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 10 }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("MyProfile")}
                        style={{ justifyContent: 'space-between', borderRadius: 10, borderWidth: 1, borderColor: "gray", flexDirection: 'row', paddingVertical: 15, marginTop: 0, paddingHorizontal: 10, }}>
                        <View style={{ alignSelf: 'center', flexDirection: 'row' }}>
                            <Image
                                style={{ width: 30, height: 30 }}
                                source={require('../../assets/profile-icon.png')}
                            />
                            <Text style={{ fontSize: 18, marginLeft: 20, fontFamily: 'Poppins-SemiBold', color: textColor, alignSelf: 'center' }}>{"Profile"}</Text>

                        </View>
                        <Image
                            style={{ marginLeft: 10, alignSelf: 'center', width: 18, height: 18 }}
                            source={require('../../assets/right-arrow.png')} />
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 10 }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("MyAddress", { editItemFromPrevious: null })}
                        style={{ justifyContent: 'space-between', borderRadius: 10, borderWidth: 1, borderColor: "gray", flexDirection: 'row', paddingVertical: 15, marginTop: 0, paddingHorizontal: 10, }}>
                        <View style={{ alignSelf: 'center', flexDirection: 'row' }}>
                            <Image
                                style={{ width: 30, height: 30 }}
                                source={require('../../assets/addresses-icon.png')}
                            />
                            <Text style={{ fontSize: 18, marginLeft: 20, fontFamily: 'Poppins-SemiBold', color: textColor, alignSelf: 'center' }}>{"Address"}</Text>

                        </View>
                         <Image
                            style={{ marginLeft: 10, alignSelf: 'center', width: 18, height: 18 }}
                            source={require('../../assets/right-arrow.png')} />
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 10 }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("AboutUs")}
                        style={{ justifyContent: 'space-between', borderRadius: 10, borderWidth: 1, borderColor: "gray", flexDirection: 'row', paddingVertical: 15, marginTop: 0, paddingHorizontal: 10, }}>
                        <View style={{ alignSelf: 'center', flexDirection: 'row' }}>
                            <Image
                                style={{ width: 30, height: 30 }}
                                source={require('../../assets/about-legal-policis-icon.png')}
                            />
                            <Text style={{ fontSize: 18, marginLeft: 20, fontFamily: 'Poppins-SemiBold', color: textColor, alignSelf: 'center' }}>{"About & Legal Policies"}</Text>

                        </View>
                        <Image
                            style={{ marginLeft: 10, alignSelf: 'center', width: 18, height: 18 }}
                            source={require('../../assets/right-arrow.png')} />
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 10 }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("NeedHelp")}
                        style={{ justifyContent: 'space-between', borderRadius: 10, borderWidth: 1, borderColor: "gray", flexDirection: 'row', paddingVertical: 15, marginTop: 0, paddingHorizontal: 10, }}>
                        <View style={{ alignSelf: 'center', flexDirection: 'row' }}>
                            <Image
                                style={{ width: 30, height: 30 }}
                                source={require('../../assets/contact-icon.png')}
                            />
                            <Text style={{ fontSize: 18, marginLeft: 20, fontFamily: 'Poppins-SemiBold', color: textColor, alignSelf: 'center' }}>{"Need Help?"}</Text>

                        </View>
                      <Image
                            style={{ marginLeft: 10, alignSelf: 'center', width: 18, height: 18 }}
                            source={require('../../assets/right-arrow.png')} />
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 10 }}>
                    <TouchableOpacity
                        onPress={() => {
                            storeData("loginData", "")
                            storeData("isLogin", "false")
                            changeAuthState(false)
                            navigation.navigate("HomeStack")
                        }
                        }
                        style={{ justifyContent: 'space-between', borderRadius: 10, borderWidth: 1, borderColor: "gray", flexDirection: 'row', paddingVertical: 15, marginTop: 0, paddingHorizontal: 10, }}>
                        <View style={{ alignSelf: 'center', flexDirection: 'row' }}>
                            <Image
                                style={{ width: 30, height: 30 }}
                                source={require('../../assets/contact-icon.png')}
                            />
                            <Text style={{ fontSize: 18, marginLeft: 20, fontFamily: 'Poppins-SemiBold', color: textColor, alignSelf: 'center' }}>{"Logout"}</Text>

                        </View>

                    </TouchableOpacity>
                </View>
            </ScrollView>

        </View >
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
        ...bindActionCreators({ changeAuthState }, dispatch),
    }

}

const Account = connect(mapStateToProps, mapDispatchToProps)(AccountScreen);
export default Account;
