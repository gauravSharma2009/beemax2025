import React, { useEffect, useState } from "react"
import { ScrollView, Text, TextInput, TouchableOpacity, View, FlatList, } from "react-native"
import Header from "../components/Header";
import { buttonBgColor, categorySaperator, screenBgColor, textColor, textInputColor, whiteTxtColor } from "../common/colours";
import { getData } from "../common/asyncStore";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { changeLoadingState } from "../actions/loadingAction";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ValidationView from "../common/ValidationView";
import { server } from "../common/apiConstant";
import CustomModal from "../common/CustomModal"
import { setPopup } from "../actions/message";

function AddressScreen(props) {
    const { navigation, route, changeLoadingState, setPopup } = props
    const { editItemFromPrevious = undefined, cart = false } = route?.params

    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [pinCode, setPin] = useState("")
    const [locality, setLocality] = useState("")
    const [address, setAddress] = useState("")
    const [landmark, setLandmark] = useState("")
    const [altPhone, setAltPhone] = useState("")
    const [city, setCity] = useState("")
    const [edit, setEdit] = useState(false)

    const [state, setState] = useState({
        "id": "-1",
        "state_name": "State*",
        "created_date": "2020-03-13 13:03:35",
        "modified_date": "2020-03-13 13:03:35",
        "position_order": "3",
        "is_deleted": "n",
        "status": "1"
    })
    const [addresses, setAddresses] = useState([])
    const [stateList, setStateList] = useState([])
    const [statePopup, setStatePopup] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [type, setType] = useState("Home")
    const [error, setError] = useState({})

    useEffect(() => {
        if (editItemFromPrevious && addresses && addresses.length > 0) {
            setEditItem(editItemFromPrevious)
            setEdit(true)
            //console.log("editItemFromPrevious :  ", JSON.stringify(editItemFromPrevious))
        }
    }, [editItemFromPrevious, addresses])
    useEffect(() => {
        console.log("editItem : ", JSON.stringify(editItem))
        // return
        if (edit && editItem) {
            setName(editItem?.Name)
            setPhone(editItem?.Mobile)
            setPin(editItem?.Pincode)
            setLocality(editItem?.Locality)
            setAddress(editItem?.Address)
            setLandmark(editItem?.Landmark)
            setAltPhone(editItem?.Alternate_Phone)
            setCity(editItem?.City)

            const found = stateList.find(item => item.state_name == editItem?.State)
            setState(found)
        } else {
            setName("")
            setPhone("")
            setPin("")
            setLocality("")
            setAddress("")
            setLandmark("")
            setAltPhone("")
            setCity("")
            setState({
                "id": "-1",
                "state_name": "State*",
                "created_date": "2020-03-13 13:03:35",
                "modified_date": "2020-03-13 13:03:35",
                "position_order": "3",
                "is_deleted": "n",
                "status": "1"
            })
            setEditItem(null)
        }
    }, [edit, editItem])

    useEffect(() => {
        getAddresses()
        getStateList()

    }, [])

    const getStateList = () => {
        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=54ac283f67023a1223304d9a60dc66e30c907c8c");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        changeLoadingState(true)
        fetch(`${server}statelist`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)

                //console.log("result : ", result)
                if (result && result.status) {
                    setStateList(result.data)
                }
            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)

            });
    }
    const deleteAddress = (id) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "address_id": id
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        changeLoadingState(true)

        fetch(`${server}removeuseraddress`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)

                console.log(result)
                if (result && result.status) {
                    getAddresses()
                }
            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)
            });
    }

    const saveAddress = async (id) => {
        const loginData = await getData("loginData")
        const userData = JSON.parse(loginData)

        // "name": name,
        // "address": address,
        // "locality": locality,
        // "mobile_number": phone,
        // "city": city,
        // "state": state.id,
        // "pincode": pinCode,
        // "landmark": landmark,
        // "alternate_phone": altPhone,
        // "address_type": type

        let errorObject = {}

        let valid = true

        if (!name) {
            errorObject = { ...errorObject, "name": "Mandatory" }
            valid = false
        }
        if (!phone) {
            errorObject = { ...errorObject, "phone": "Mandatory" }
            valid = false
        }
        if (!address) {
            errorObject = { ...errorObject, "address": "Mandatory" }
            valid = false
        }
        if (!pinCode) {
            errorObject = { ...errorObject, "pinCode": "Mandatory" }
            valid = false
        }
        // if (!locality) {
        //     errorObject = { ...errorObject, "locality": "Please enter Password." }
        //     valid = false
        // }
        if (!city) {
            errorObject = { ...errorObject, "city": "Mandatory" }
            valid = false
        }
        if (!state || !state.id || state.id === '-1') {
            errorObject = { ...errorObject, "state": "Mandatory" }
            valid = false
        }
        if (!valid) {
            setError(errorObject)
            return;
        } else {
            setError({})
        }

        if (edit) {
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            var raw = JSON.stringify({
                "id": editItem.ID,
                "user_id": userData?.USER_ID,
                "name": name,
                "address": address,
                "locality": locality,
                "mobile_number": phone,
                "city": city,
                "state": state.id,
                "pincode": pinCode,
                "landmark": landmark,
                "alternate_phone": altPhone,
                "address_type": type
            });
            // {
            //     "id":"7",
            //     "name":"Vikash Kumar11",  
            //     "address":"C5, 41,42 Ground Floor, Rohini Sector 6",  
            //     "locality":"Rohini Sector 6",
            //     "mobile_number":"9555789820",
            //     "city":"New Delhi",
            //     "state":"5",
            //     "pincode":"110085",
            //     "landmark":"Rohini",
            //     "alternate_phone":"9555789820",
            //     "address_type":"Home"
            //   }
            console.log("raw : ", raw)
            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };
            changeLoadingState(true)

            fetch(`${server}updateuseraddress`, requestOptions)
                .then(response => response.json())
                .then(result => {
                    changeLoadingState(false)

                    console.log(result)
                    if (result && result.status) {
                        cleanData()
                        setEdit(false)
                        setEditItem(null)
                        if (cart) {
                            navigation.goBack();
                            return;
                        }
                        editItemFromPrevious && navigation.navigate("Tabs")
                    }
                    if (result?.status) {
                        setPopup({ message: result.message, status: "success", open: true })
                    } else {
                        setPopup({ message: result.message, status: "faliure", open: true })
                    }

                })
                .catch(error => {
                    console.log('error', error)
                    changeLoadingState(false)

                });
            return;
        }
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        if (!name) {
            setApiStatus("faliure")
            setMessageVisible(true)
            setmessage("please ener your name")
            return
        }
        var raw = JSON.stringify({
            "user_id": userData?.USER_ID,
            "name": name,
            "address": address,
            "locality": locality,
            "mobile_number": phone,
            "city": city,
            "state": state.id,
            "pincode": pinCode,
            "landmark": landmark,
            "alternate_phone": altPhone,
            "address_type": type
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        changeLoadingState(true)

        fetch(`${server}adduseraddress`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)

                console.log(result)
                if (result && result.status) {
                    cleanData()
                    if (cart) {
                        navigation.goBack();
                        return;
                    }
                }
                if (result?.status) {
                    setPopup({ message: result.message, status: "success", open: true })
                } else {
                    setPopup({ message: result.message, status: "faliure", open: true })
                }

            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)

            });
    }

    const cleanData = () => {
        setName("")
        setPhone("")
        setPin("")
        setLandmark("")
        setAddress("")
        setAltPhone("")
        setLocality("")
        setCity("")
        setState("")
        getAddresses()
    }

    const getAddresses = async () => {

        const loginData = await getData("loginData")
        const userData = JSON.parse(loginData)

        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=6a0a9c04ccef105dc07e8490df744de2c144964c");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        changeLoadingState(true)

        fetch(`${server}useraddresslist/${userData?.USER_ID}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)

                if (result && result.status) {
                    setAddresses(result.data)
                } else {
                    result.statusCode === 200 && setAddress([])
                }
                console.log(JSON.stringify(result))
            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)

            });
    }

    const renderItem = ({ item }) => (
        <View style={{ width: '100%', borderWidth: 1, borderRadius: 10, borderColor: categorySaperator, marginTop: 20, padding: 20 }}>
            <Text style={{ fontFamily: 'Poppins-Regular', color: textColor }}>{item.Name}</Text>
            <Text style={{ marginTop: 3, fontFamily: 'Poppins-Regular', color: textInputColor }}>{item.Address + ", " + item.City + ", " + item.State + ", " + item.Pincode}</Text>
            <View style={{ position: 'absolute', right: 0, flexDirection: 'row', marginRight: 10, marginTop: 5 }}>
                <TouchableOpacity
                    style={{ borderRadius: 5, padding: 3, backgroundColor: buttonBgColor, marginRight: 10, }}
                    onPress={() => {
                        deleteAddress(item.ID)
                    }}
                ><Text
                    style={{ color: whiteTxtColor, fontFamily: 'Poppins-SemiBold' }}
                >DELETE</Text></TouchableOpacity>
                <TouchableOpacity
                    style={{ borderRadius: 5, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: buttonBgColor, marginRight: 10, }}

                    onPress={() => {
                        setEditItem(item)
                        setEdit(true)
                    }}
                ><Text
                    style={{ color: whiteTxtColor, fontFamily: 'Poppins-SemiBold' }}


                >EDIT</Text></TouchableOpacity>

            </View>
            <Text style={{ borderRadius: 5, fontFamily: 'Poppins-Regular', color: textColor, backgroundColor: categorySaperator, width: '20%', textAlign: 'center', padding: 5, marginTop: 5 }}>{item.Address_Type}</Text>

        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            <Header
                navigation={navigation}
                name={"My Addresses"}
            />
            <KeyboardAwareScrollView style={{ width: '100%', paddingHorizontal: 20, backgroundColor: 'white', height: '93%' }}>
                <Text style={{ color: buttonBgColor, marginTop: 20, fontFamily: "Poppins-SemiBold", fontSize: 16 }}>+ ADD NEW ADDRESS</Text>
                <View style={{ flexDirection: 'row', }}>

                    <View style={{ flex: .5 }}>
                        <ValidationView
                            name="name"
                            value={name}
                            error={error}
                            inputComponent={

                                <TextInput
                                    placeholderTextColor={textColor}
                                    value={name}
                                    style={{ paddingHorizontal: 10, marginRight: 5, fontSize: 15, fontFamily: 'Poppins-Regular', paddingVertical: 10, borderBottomColor: screenBgColor, borderBottomWidth: 1, marginTop: 10 }}
                                    placeholder="Full Name*"
                                    onChangeText={(text) => setName(text)}

                                />
                            }
                        />

                    </View>
                    <View style={{ flex: .5 }}>
                        <ValidationView
                            name="phone"
                            value={phone}
                            error={error}
                            inputComponent={

                                <TextInput
                                    placeholderTextColor={textColor}
                                    value={phone}
                                    keyboardType={'number-pad'}
                                    style={{ paddingHorizontal: 10, marginLeft: 5, fontSize: 15, fontFamily: 'Poppins-Regular', paddingVertical: 10, borderBottomColor: screenBgColor, borderBottomWidth: 1, marginTop: 10 }}
                                    placeholder="Phone*"
                                    onChangeText={(text) => setPhone(text)}
                                />
                            }
                        />

                    </View>



                </View>
                <View style={{ flexDirection: 'row', }}>

                    <View style={{ flex: .5 }}>
                        <ValidationView
                            name="pinCode"
                            value={pinCode}
                            error={error}
                            inputComponent={

                                <TextInput
                                    placeholderTextColor={textColor}
                                    value={pinCode}
                                    maxLength={6}
                                    keyboardType="number-pad"
                                    style={{ paddingHorizontal: 10, marginRight: 5, fontSize: 15, fontFamily: 'Poppins-Regular', paddingVertical: 10, borderBottomColor: screenBgColor, borderBottomWidth: 1, marginTop: 10 }}
                                    placeholder="Pin code*"
                                    onChangeText={(text) => setPin(text)}

                                />
                            }
                        />

                    </View>
                    <View style={{ flex: .5 }}>
                        <ValidationView
                            name="locality"
                            value={locality}
                            error={error}
                            inputComponent={
                                <TextInput
                                    placeholderTextColor={textColor}
                                    value={locality}
                                    style={{ paddingHorizontal: 10, marginLeft: 5, fontSize: 15, fontFamily: 'Poppins-Regular', paddingVertical: 10, borderBottomColor: screenBgColor, borderBottomWidth: 1, marginTop: 10 }}
                                    placeholder="Locality*"
                                    onChangeText={(text) => setLocality(text)}
                                />
                            }
                        />

                    </View>


                </View>
                <ValidationView
                    name="address"
                    value={address}
                    error={error}
                    inputComponent={
                        <TextInput
                            placeholderTextColor={textColor}

                            value={address}
                            style={{ paddingHorizontal: 10, fontSize: 15, fontFamily: 'Poppins-Regular', paddingVertical: 10, borderBottomColor: screenBgColor, borderBottomWidth: 1, marginTop: 10 }}
                            placeholder="Address*"
                            onChangeText={(text) => setAddress(text)}
                        />
                    }
                />

                <View style={{ flexDirection: 'row', }}>
                    <View style={{ flex: .5 }}>

                        <TextInput
                            placeholderTextColor={textColor}

                            value={landmark}
                            style={{ paddingHorizontal: 10, marginRight: 5, fontSize: 15, fontFamily: 'Poppins-Regular', paddingVertical: 10, borderBottomColor: screenBgColor, borderBottomWidth: 1, marginTop: 10 }}
                            placeholder="Landmark(Optional)"
                            onChangeText={(text) => setLandmark(text)}

                        />
                    </View>
                    <View style={{ flex: .5 }}>

                        <TextInput
                            placeholderTextColor={textColor}

                            value={altPhone}
                            keyboardType={'name-phone-pad'}
                            style={{ paddingHorizontal: 10, marginLeft: 5, fontSize: 15, fontFamily: 'Poppins-Regular', paddingVertical: 10, borderBottomColor: screenBgColor, borderBottomWidth: 1, marginTop: 10 }}
                            placeholder="Alternate Phone(Optional)"
                            onChangeText={(text) => setAltPhone(text)}
                        />
                    </View>

                </View>
                <View style={{ flexDirection: 'row', }}>
                    <View style={{ flex: .5 }}>
                        <ValidationView
                            name="city"
                            value={city}
                            error={error}
                            inputComponent={

                                <TextInput
                                    placeholderTextColor={textColor}

                                    value={city}
                                    style={{ paddingHorizontal: 10, marginRight: 5, fontSize: 15, fontFamily: 'Poppins-Regular', paddingVertical: 10, borderBottomColor: screenBgColor, borderBottomWidth: 1, marginTop: 10 }}
                                    placeholder="City*"
                                    onChangeText={(text) => setCity(text)}

                                />
                            }
                        />

                    </View>
                    <View style={{ flex: .5 }}>
                        <ValidationView
                            name="state_name"
                            value={state?.state_name}
                            error={error}
                            inputComponent={
                                <Text
                                    onPress={() => setStatePopup(true)}
                                    style={{ color: textColor, paddingHorizontal: 10, width: '100%', marginLeft: 5, fontSize: 15, fontFamily: 'Poppins-Regular', paddingVertical: 10, borderBottomColor: screenBgColor, borderBottomWidth: 1, marginTop: 20 }}
                                >{state?.state_name}</Text>
                            }
                        />

                    </View>


                </View>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flexDirection: 'row', paddingHorizontal: 0, marginTop: 20 }}>
                        <TouchableOpacity
                            onPress={() => setType("Home")}
                            style={{ alignSelf: 'center', justifyContent: 'center', alignItems: 'center', borderColor: buttonBgColor, height: 25, width: 25, borderRadius: 15, borderWidth: 5, }}>
                            {type === "Home" && <View style={{ width: 10, height: 10, backgroundColor: buttonBgColor, borderRadius: 5 }}></View>}
                        </TouchableOpacity>
                        <Text style={{ color: textColor, fontSize: 8, fontFamily: 'Poppins-Regular', alignSelf: 'center', marginLeft: 10 }}>Home (All Day Delivery)</Text>
                    </View>
                    <View style={{ flexDirection: 'row', paddingHorizontal: 5, marginTop: 20 }}>
                        <TouchableOpacity
                            onPress={() => setType("Office")}
                            style={{ alignSelf: 'center', justifyContent: 'center', alignItems: 'center', borderColor: buttonBgColor, height: 25, width: 25, borderRadius: 15, borderWidth: 5, }}>
                            {type === "Office" && <View style={{ width: 10, height: 10, backgroundColor: buttonBgColor, borderRadius: 5 }}></View>}
                        </TouchableOpacity>
                        <Text style={{ color: textColor, fontSize: 8, fontFamily: 'Poppins-Regular', alignSelf: 'center', marginLeft: 5 }}>Office (Delivery between 9 AM-6PM)</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={saveAddress}
                    style={{ backgroundColor: buttonBgColor, padding: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginTop: 30 }}><Text style={{ color: whiteTxtColor, fontFamily: 'Poppins-SemiBold', fontSize: 18 }}>{edit ? "Save" : "Add"}</Text></TouchableOpacity>

                <FlatList
                    showsVerticalScrollIndicator={false}
                    style={{ width: '100%' }}
                    data={addresses}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => '' + index}
                />
            </KeyboardAwareScrollView>

            {statePopup && <View style={{ position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ width: '80%', height: '80%', backgroundColor: 'white' }}>
                    {stateList && stateList.map((item) => <TouchableOpacity
                        onPress={() => {
                            setStatePopup(false)
                            setState(item)
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
        ...bindActionCreators({ changeLoadingState, setPopup }, dispatch),
    }

}

const Address = connect(mapStateToProps, mapDispatchToProps)(AddressScreen);
export default Address;

