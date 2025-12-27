import React, { useEffect, useState } from "react"
import { Image, Text, View, ScrollView } from "react-native"
import { getData } from "../common/asyncStore";
import { allCategoryPink, buttonBgColor, categorySaperator, textColor, whiteTxtColor } from "../common/colours";
import { currency } from "../common/strings";
import Header from "../components/Header";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { changeLoadingState } from "../actions/loadingAction";
import { server } from "../common/apiConstant";
import { TouchableOpacity } from "react-native";
import { setPopup } from "../actions/message";
import OrderStepper from "../common/OrderStepper";
function OrdersScreen(props) {
    const { navigation, changeLoadingState, setPopup } = props
    const [orderList, setOrderList] = useState([])
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getOrderList()
        });
        return unsubscribe;
    }, [navigation]);
    const cancelOrder = (item) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const ids = item?.SELLER_ORDER_ITEM_DETAILS?.map((products) => products.id).join(",")
        // console.log("ids  :  ",ids)
        // return;
        var raw = JSON.stringify({
            "user_id": item.CUSTOMER_ID,
            "order_id": item.PRIMARY_ORDER_ID,
            "cancel_return_action": "Cancel",
            "item_id": ids,
            "reason_cancel_return": "I have Changed my mind!"
        });
        console.log("cancel order : ", raw)
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(server + "cancel_items", requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log(result)
                // if (result.status) {
                // }
                if (result.status) {
                    getOrderList()

                    setPopup({ message: result.message, status: "success", open: true })
                } else {
                    setPopup({ message: result.message, status: "faliure", open: false })
                }
            })
            .catch(error => console.log('error', error));
    }

    const getOrderList = async () => {
        const loginData = await getData("loginData")
        const userData = JSON.parse(loginData)
        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=77cd74e58723f8c0f9e0e020ca688e8bf8abf296");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        changeLoadingState(true)
        console.log("`${server}userorderlist/${userData?.USER_ID}`  :  ", `${server}userorderlist/${userData?.USER_ID}`)
        fetch(`${server}userorderlist/${userData?.USER_ID}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)
                console.log("userorderlist :  ", JSON.stringify(result))
                if (result && result.status) {
                    setOrderList(result.data)
                } else {
                    setOrderList([])
                }
            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(False)
            });
    }

    return (
        <View style={{ flex: 1, backgroundColor: whiteTxtColor }}><Header
            navigation={navigation}
            name={"My Orders"}
        />
            <ScrollView style={{ padding: 10 }}>{orderList.map((item) =>
                <View>
                    <Text style={{ fontFamily: 'Poppins-SemiBold', marginVertical: 10 }}>{"Order Placed:"}<Text style={{ fontFamily: 'Poppins-SemiBold' }}>  {item.CREATED_DATE}</Text></Text>
                    <View style={{ width: '100%', height: 1, backgroundColor: categorySaperator, marginVertical: 10 }}></View>
                    <View>
                        <Text style={{ fontFamily: 'Poppins-SemiBold', marginTop: 5 }}>{"Order Id:"}<Text style={{ fontFamily: 'Poppins-SemiBold' }}>  {item.DISPLAY_PRIMARY_ORDER_ID}</Text></Text>
                        <Text style={{ fontFamily: 'Poppins-SemiBold', marginVertical: 5 }}>{"Ship to:"}<Text style={{ fontFamily: 'Poppins-SemiBold' }}>  {JSON.parse(item.ADDRESS_DATA).name}</Text></Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ flex: .5, fontFamily: 'Poppins-SemiBold', marginVertical: 5, fontSize: 12 }}>{"Delivery Date:"}<Text style={{ fontFamily: 'Poppins-Regular' }}>  {item.GROCERY_DELIVERY_DATE || "N/A"}</Text></Text>
                            <Text style={{ flex: .5, fontFamily: 'Poppins-SemiBold', marginVertical: 5, fontSize: 12 }}>{"Delivery Time:"}<Text style={{ fontFamily: 'Poppins-Regular' }}>  {item.GROCERY_DELIVERY_SLOT || "N/A"}</Text></Text>


                        </View>
                        {/* <Text
                            style={{ position: 'absolute', right: 10, top: 10, fontSize: 40 }}
                        >{">"}</Text> */}
                        <TouchableOpacity style={{ position: 'absolute', right: 10, top: 10, }}
                            onPress={() => navigation.navigate("OrderDetails", { item })}
                        >
                            <Image
                                style={{ width: 25, height: 25, tintColor: '#000000' }}
                                source={require("../../assets/right-arrow.png")}
                            />
                        </TouchableOpacity>

                        {/* <MaterialIcons
                            onPress={() => navigation.navigate("OrderDetails", { item })}
                            style={{ position: 'absolute', right: 10, top: 10 }}
                            name="keyboard-arrow-right" size={30} color="black" /> */}
                    </View>

                    {/* <View style={{ width: '100%', height: 1, backgroundColor: categorySaperator, marginVertical: 10 }}></View> */}

                    {item.SELLER_ORDER_ITEM_DETAILS && item.SELLER_ORDER_ITEM_DETAILS.map((sellerItem) => <View style={{ flexDirection: "row", marginTop: 10, padding: 10, borderTopColor: categorySaperator, borderTopWidth: 2 }}>
                        <View style={{ flex: .25, justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                style={{ width: 90, height: 90, borderWidth: 2, borderColor: categorySaperator, borderRadius: 0, padding: 20, resizeMode: 'center' }}
                                source={{ uri: sellerItem.IMGAE_URL }}
                            />
                        </View>

                        <View style={{ flex: .5, paddingVertical: 5, paddingLeft: 10 }}>
                            <Text
                                numberOfLines={2}
                                style={{ fontFamily: 'Poppins-Medium', color: textColor }}>{sellerItem.product_name}</Text>
                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                <Text
                                    style={{ fontFamily: 'Poppins-SemiBold', color: textColor }}>{"QTY:"}<Text style={{ fontFamily: "Poppins-SemiBold" }}> {sellerItem.qty}</Text></Text>
                            </View>
                            {/* <View style={{ flexDirection: 'row', }}>
                                <Text
                                    style={{ alignSelf: 'center', fontFamily: 'Poppins-SemiBold', color: textColor }}>{"Order Status:"}
                                </Text>
                                <View
                                    style={{
                                        alignSelf: 'center',
                                        backgroundColor: sellerItem.item_status === 'Pending' ?
                                            '#D0d0d0' : (sellerItem.item_status === 'Completed' || sellerItem.item_status === 'Shipped') ?
                                                '#01CB4B' : sellerItem.item_status === 'Cancelled' || item.ORDER_STATUS === 'Cancled' ? '#FC0033' : null
                                        , paddingHorizontal: 8,
                                        paddingVertical: 5,
                                        borderRadius: 5,
                                        marginLeft: 5,
                                    }}
                                >
                                    <Text style={{
                                        alignSelf: 'center',
                                        fontFamily: "Poppins-SemiBold",
                                        color: sellerItem.item_status === 'Pending' ? 'black' : 'white',
                                        borderRadius: 2,
                                        backgroundColor: 'transparent'

                                    }}>
                                        {sellerItem.item_status}</Text>
                                </View>

                            </View> */}


                        </View>
                        <View style={{ flex: .25, justifyContent: 'space-between', paddingVertical: 5, paddingRight: 5 }}>

                            <View style={{ flexDirection: "row", alignSelf: 'flex-end' }}>
                                <Text
                                    style={{ fontFamily: 'Poppins-Regular', color: textColor, alignSelf: 'flex-end' }}>{currency}</Text>
                                <Text
                                    style={{ fontFamily: 'Poppins-Medium', color: textColor, alignSelf: 'flex-end' }}>{sellerItem.price}</Text>
                            </View>
                        </View>

                    </View>)}
                    {item.SELLER_ORDER_ITEM_DETAILS.find(sellerItem => sellerItem.item_status != 'Cancelled') ? <View style={{ flexDirection: 'row', justifyContent: 'center', marginHorizontal: 5, flex: .9, }}>
                        <TouchableOpacity
                            onPress={() => {
                                if (item.ORDER_STATUS === 'Pending') {
                                    cancelOrder(item)
                                }
                            }}
                            style={{
                                justifyContent: 'center', flex: .2, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1,
                                borderColor: item.ORDER_STATUS === 'Pending' ? allCategoryPink : "gray", borderRadius: 10,
                            }}>
                            <Text style={{ alignSelf: 'center', color: item.ORDER_STATUS === 'Pending' ? allCategoryPink : "gray" }}>Cancel</Text></TouchableOpacity>
                        <Text style={{ flex: .8, alignSelf: 'center', marginLeft: 10, fontSize: 11, fontFamily: 'Poppins-SemiBold', color: 'gray' }}>Order that have already shipped can not be cancelled</Text>
                    </View> : null}

                    {/* Order Stepper Component */}
                    {item.ORDER_TRACK_DETAILS && (
                        <OrderStepper orderTrackDetails={item.ORDER_TRACK_DETAILS} />
                    )}

                    <View style={{ width: '100%', height: 5, backgroundColor: categorySaperator, marginVertical: 10 }}></View>

                </View>)}
            </ScrollView>
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

const Orders = connect(mapStateToProps, mapDispatchToProps)(OrdersScreen);
export default Orders;

