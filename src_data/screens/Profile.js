import React, { useEffect, useState } from "react"
import { Text, View, TextInput, TouchableOpacity, ScrollView } from "react-native"
import Header from "../components/Header";
import { buttonBgColor, categorySaperator, screenBgColor, textColor, textInputColor, whiteTxtColor } from "../common/colours";
import { getData } from "../common/asyncStore";
import { server } from "../common/apiConstant";
import { setPopup } from "../actions/message";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

function ProfileScreen(props) {
    const { navigation, setPopup } = props
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [pinCode, setPin] = useState("")
    const [locality, setLocality] = useState("")
    const [address, setAddress] = useState("")
    const [landmark, setLandmark] = useState("")
    const [altPhone, setAltPhone] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [stateText, setStateText] = useState("State")
    const [statePopup, setStatePopup] = useState(false)

    const [userData, setUserData] = useState(null)

    const [stateList, setStateList] = useState([])

    useEffect(() => {
        getStateList()
        getProfileData()
    }, [])

    useEffect(() => {
        if (state && stateList) {
            console.log("State List : ", JSON.stringify(stateList))
            const found = stateList.find((item) => item.id === state)
            if (found) {
                setStateText(found.state_name)
            }
        }
    }, [stateList, state])

    useEffect(() => {
        if (userData) {

            setName(userData?.NAME)
            setPhone(userData?.MOBILE_NUMBER)
            setAddress(userData?.ADDRESS)
            setCity(userData?.CITY)
            setState(userData?.STATE)
            //setState("5")

            setLocality(userData?.EMAIL)
        }
    }, [userData])
    const saveAddress = async () => {

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "ci_session=8dbaa7059d94a0c87e32ca8d13971a015b8f3af7");

        const loginData = await getData("loginData")
        const user = JSON.parse(loginData)
        var raw = JSON.stringify({
            "user_id": user?.USER_ID,
            "name": name,
            "address": address,
            "state": state,
            "city": city,
            "pin_code": pinCode
        });
        console.log(" Update URL : ", `${server}updateuser`)
        console.log("raw  :  ", raw)
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${server}updateuser`, requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log(result)
                if (result.status) {
                    setPopup({ message: result.message, status: "success", open: true })
                } else {
                    setPopup({ message: result.message, status: "faliure", open: true })
                }
            })
            .catch(error => console.log('error', error));

    }

    const getStateList = () => {
        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=54ac283f67023a1223304d9a60dc66e30c907c8c");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        fetch(`${server}statelist`, requestOptions)
            .then(response => response.json())
            .then(result => {
                //console.log("result : ", result)
                if (result && result.status) {
                    setStateList(result.data)
                }
            })
            .catch(error => console.log('error', error));
    }
    const getProfileData = async () => {
        const loginData = await getData("loginData")
        const userData = JSON.parse(loginData)
        //console.log("userData  :  ", userData)
        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=ae7dde7629aa0e0290883bc0377f441118e36dab");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        console.log(" Fetching user data  : ", `${server}userdetails/${userData?.USER_ID}`)
        fetch(`${server}userdetails/${userData?.USER_ID}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log(result)
                if (result && result.status) {
                    setUserData(result.data[0])
                }
            })
            .catch(error => console.log('error', error));
    }
    return (
        <View style={{ flex: 1, backgroundColor: whiteTxtColor }}><Header
            navigation={navigation}
            name={"Profile"}
        />
            <View style={{ width: '100%', paddingHorizontal: 20, backgroundColor: 'white', height: '93%' }}>

                <View style={{ flexDirection: 'row', }}>
                    <View style={{ flex: .5 }}>

                        <TextInput
                            value={name}
                            placeholderTextColor={textColor}
                            style={{ color: textColor, paddingHorizontal: 10, marginRight: 5, fontSize: 15, fontFamily: 'Poppins-Regular', paddingVertical: 10, borderBottomColor: categorySaperator, borderBottomWidth: 1, marginTop: 20 }}
                            placeholder="Full Name*"
                            onChangeText={(text) => setName(text)}

                        />
                    </View>
                    <View style={{ flex: .5 }}>

                        <TextInput
                            editable={false}
                            placeholderTextColor={textColor}
                            value={phone}
                            keyboardType={'name-phone-pad'}
                            style={{ color: textColor, paddingHorizontal: 10, marginLeft: 5, fontSize: 15, fontFamily: 'Poppins-Regular', paddingVertical: 10, borderBottomColor: categorySaperator, borderBottomWidth: 1, marginTop: 20 }}
                            placeholder="Phone*"
                            onChangeText={(text) => setPhone(text)}
                        />
                    </View>

                </View>
                <View style={{ flexDirection: 'row', }}>
                    <View style={{ flex: .5 }}>

                        <TextInput
                            placeholderTextColor={textColor}
                            value={pinCode}
                            keyboardType={'name-phone-pad'}
                            style={{ color: textColor, paddingHorizontal: 10, marginRight: 5, fontSize: 15, fontFamily: 'Poppins-Regular', paddingVertical: 10, borderBottomColor: categorySaperator, borderBottomWidth: 1, marginTop: 20 }}
                            placeholder="Pin code*"
                            onChangeText={(text) => setPin(text)}

                        />
                    </View>
                    <View style={{ flex: .5 }}>

                        <TextInput
                            editable={false}
                            placeholderTextColor={textColor}
                            value={locality}
                            style={{ color: textColor, paddingHorizontal: 10, marginLeft: 5, fontSize: 15, fontFamily: 'Poppins-Regular', paddingVertical: 10, borderBottomColor: categorySaperator, borderBottomWidth: 1, marginTop: 20 }}
                            placeholder="Email ID*"
                            onChangeText={(text) => setLocality(text)}
                        />
                    </View>

                </View>
                <TextInput
                    placeholderTextColor={textColor}

                    value={address}
                    style={{ color: textColor, paddingHorizontal: 10, fontSize: 15, fontFamily: 'Poppins-Regular', paddingVertical: 10, borderBottomColor: categorySaperator, borderBottomWidth: 1, marginTop: 20 }}
                    placeholder="Address*"
                    onChangeText={(text) => setAddress(text)}
                />

                <View style={{ flexDirection: 'row', }}>
                    <View style={{ flex: .5, }}>

                        <TextInput
                            placeholderTextColor={textColor}

                            value={city}
                            style={{ color: textColor, paddingHorizontal: 10, marginRight: 5, fontSize: 15, fontFamily: 'Poppins-Regular', paddingVertical: 10, borderBottomColor: categorySaperator, borderBottomWidth: 1, marginTop: 20 }}
                            placeholder="City*"
                            onChangeText={(text) => setCity(text)}

                        />
                    </View>
                    <View style={{ borderBottomColor: categorySaperator, borderBottomWidth: 1, flex: .5, }}>

                        <Text
                            placeholderTextColor={textColor}
                            onPress={() => setStatePopup(true)}
                            style={{ color: textColor, paddingHorizontal: 10, width: '100%', marginLeft: 5, fontSize: 15, fontFamily: 'Poppins-Regular', paddingVertical: 10, marginTop: 25 }}
                        //onChangeText={(text) => setState(text)}
                        >{stateText}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={saveAddress}
                    style={{ backgroundColor: buttonBgColor, padding: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
                    <Text style={{ color: whiteTxtColor, fontFamily: 'Poppins-SemiBold', fontSize: 18 }}>{"Save"}</Text>
                </TouchableOpacity>
            </View>
            {statePopup && <View style={{ position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ width: '80%', height: '80%', backgroundColor: 'white' }}>
                    {stateList && stateList.map((item) => <TouchableOpacity
                        onPress={() => {
                            setStatePopup(false)
                            setState(item.id)
                        }}
                        style={{ width: '100%', borderBottomColor: screenBgColor, borderBottomWidth: 1, padding: 20 }}
                    >
                        <Text style={{ color: textColor }}>{item?.state_name}</Text>
                    </TouchableOpacity>)}
                </ScrollView>
            </View>}

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
const Profile = connect(mapStateToProps, mapDispatchToProps)(ProfileScreen);
export default Profile;