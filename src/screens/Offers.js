import React, { useEffect, useState } from "react"
import { StatusBar } from "react-native"
import { Text, View } from "react-native"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { changeLoadingState } from "../actions/loadingAction"
import { server } from "../common/apiConstant"
import { getData } from "../common/asyncStore"
import { BackgroundGray, whiteTxtColor } from "../common/colours"
import CouponList from "../common/CouponList"
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Image } from "react-native"
import { TouchableOpacity } from "react-native"

function OffersScreen(props) {
    const { changeLoadingState, navigation } = props;
    const [offers, setOffers] = useState(null)

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // The screen is focused
            // Call any action
            //selectedAddress && addresses && getCartData()
            getOrderList()
        });

        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation]);

    const getOrderList = async () => {
        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=77cd74e58723f8c0f9e0e020ca688e8bf8abf296");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        changeLoadingState(true)
        fetch(`${server}couponofferlist`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)
                console.log(JSON.stringify(result))
                if (result && result.status) {
                    setOffers(result.data)
                } else {
                    setOffers([])
                }
            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(False)
            });
    }

    return (
        <View style={{ flex: 1, backgroundColor: BackgroundGray }}>
            {/* <StatusBar style="light"
                backgroundColor="#3b006a"
            /> */}

            <View style={{ flex: .06, width: "100%", backgroundColor: '#3b006a', justifyContent: 'space-between', flexDirection: 'row', paddingVertical: 15 }}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: 10, marginTop: 10 }}
                >
                    <Image
                        source={require('../../assets/icons/back.png')}
                        style={{ width: 32, height: 32, resizeMode: 'contain', tintColor: '#FFFFFF' }}
                    />
                </TouchableOpacity>

                {/* <View style={{ flexDirection: 'row', alignSelf: 'center', flex: .2, justifyContent: 'flex-end' }}>
                    <Image
                        style={{ width: 20, height: 20, alignSelf: 'center', marginRight: 5 }}
                        source={require('../../assets/search-white.png')}
                    />
                    <TouchableOpacity
                        style={{ alignItems: 'center' }}
                        onPress={() => navigation.navigate("UserScreen")}
                    >
                        <Image
                            style={{ width: 20, height: 20, alignSelf: 'center', marginHorizontal: 10 }}
                            source={require('../../assets/user.png')}
                        />
                    </TouchableOpacity>

                </View> */}
            </View>
            <CouponList
                offersList={offers}
                applyCoupan={null}
                setAppliedCoupan={null}

            />
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
        ...bindActionCreators({ changeLoadingState }, dispatch),
    }

}

const Offers = connect(mapStateToProps, mapDispatchToProps)(OffersScreen);
export default Offers;