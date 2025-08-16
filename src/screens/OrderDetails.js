import React, { useEffect, useState } from "react"
import { Text, View, ScrollView, Image, TouchableOpacity, Linking } from "react-native"
import { buttonBgColor, categorySaperator, coupanGreen, textColor, whiteTxtColor } from "../common/colours";
import { currency } from "../common/strings";
import Header from "../components/Header";
import { MaterialIcons } from '@expo/vector-icons';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { changeLoadingState } from "../actions/loadingAction";
import { server } from "../common/apiConstant";
import { setPopup } from "../actions/message";

function OrderDetailsScreen(props) {
    const { navigation, route, changeLoadingState, setPopup } = props
    const { item } = route?.params
    const [userData, setuserData] = useState(null)
    const [dealerData, setDealerData] = useState(null)

    useEffect(() => {
        console.log("item : ", JSON.stringify(item))
        setuserData(JSON.parse(item.ADDRESS_DATA))
        setDealerData(JSON.parse(item.SELLER_DATA))

    }, [])
    const cancelOrder = () => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "ci_session=23437e2312548766b8a374f1fe83548def9ed297");

        var raw = JSON.stringify({
            "order_id": item.ORDER_DETAILS_ID
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        changeLoadingState(true)
        fetch(`${server}cancel_order`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)

                if (result && result.status) {
                    setuserData(null)
                    setDealerData(null)
                    navigation.goBack()
                    // getOrderList()
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
    return (
        <View style={{ flex: 1, backgroundColor: whiteTxtColor }}>
            <Header
                name={"Order Details #" + item.DISPLAY_PRIMARY_ORDER_ID}
                navigation={navigation}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps={"handled"}
                style={{ width: '100%', height: '93%', padding: 10 }}>
                <View>
                    <Text style={{ fontFamily: 'Poppins-SemiBold', marginVertical: 10 }}>{"Order Placed:"}<Text style={{ fontFamily: 'Poppins-Regular' }}>  {item.CREATED_DATE}</Text></Text>
                    <View style={{ width: '100%', height: 1, backgroundColor: categorySaperator, marginVertical: 10 }}></View>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: .5 }}>
                            <Text style={{ fontFamily: 'Poppins-SemiBold', marginTop: 5 }}>{"Payment Option:"}<Text style={{ fontFamily: 'Poppins-Regular' }}>  {item.PAYMENT_METHOD}</Text></Text>
                            <Text style={{ fontFamily: 'Poppins-SemiBold', marginVertical: 5 }}>{"Ship to:"}<Text style={{ fontFamily: 'Poppins-Regular' }}>  {JSON.parse(item.ADDRESS_DATA).name}</Text></Text>
                            <Text style={{ fontFamily: 'Poppins-SemiBold', marginVertical: 5,fontSize:12 }}>{"Delivery Date:"}<Text style={{ fontFamily: 'Poppins-Regular' }}>  {item.GROCERY_DELIVERY_DATE}</Text></Text>

                        </View>
                        <View style={{ flex: .5 }}>
                            <Text style={{ fontFamily: 'Poppins-SemiBold', marginTop: 5 }}>{"Payment Status:"}<Text style={{ fontFamily: 'Poppins-Regular' }}>  {item.PAYMENT_STATUS}</Text></Text>
                            <Text style={{ fontFamily: 'Poppins-SemiBold', marginVertical: 5 }}>{"Transaction ID:"}<Text style={{ fontFamily: 'Poppins-Regular' }}>  {item?.TRANSACTION_ID}</Text></Text>
                            <Text style={{ fontFamily: 'Poppins-SemiBold', marginVertical: 5,fontSize:12 }}>{"Delivery Time:"}<Text style={{ fontFamily: 'Poppins-Regular' }}>  {item.GROCERY_DELIVERY_SLOT}</Text></Text>

                        </View>
                    </View>



                    {/* <View style={{ width: '100%', height: 1, backgroundColor: categorySaperator, marginVertical: 10 }}></View> */}

                    {item.SELLER_ORDER_ITEM_DETAILS && item.SELLER_ORDER_ITEM_DETAILS.map((sellerItem) => <View style={{ flexDirection: "row", marginTop: 10, padding: 10, borderTopColor: categorySaperator, borderTopWidth: 2 }}>
                        <View style={{ flex: .25, justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                style={{ width: 90, height: 90, borderWidth: 2, borderColor: categorySaperator, borderRadius: 7, padding: 20, resizeMode: 'center' }}
                                source={{ uri: sellerItem.IMGAE_URL }}
                            />
                        </View>

                        <View style={{ flex: .5, paddingVertical: 5, paddingLeft: 10 }}>
                            <Text
                                numberOfLines={2}
                                style={{ fontFamily: 'Poppins-Medium', color: textColor }}>{sellerItem.product_name}</Text>
                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                <Text
                                    style={{ fontFamily: 'Poppins-SemiBold', color: textColor }}>{"QTY:"}<Text style={{ fontFamily: "Poppins-Regular" }}> {sellerItem.qty}</Text></Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ alignSelf: 'center', fontFamily: 'Poppins-SemiBold', color: textColor }}>{"Order Status:"}</Text>
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
                            </View>

                            {/* <Text
                                style={{ fontFamily: 'Poppins-SemiBold', color: textColor }}>{"Order Status:"}<Text style={{ fontFamily: "Poppins-Regular" }}> {sellerItem.item_status}</Text></Text> */}

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
                    <View style={{ width: '100%', height: 1, backgroundColor: categorySaperator, marginVertical: 10 }}></View>
                    <Text style={{ fontFamily: 'Poppins-SemiBold', color: textColor, fontSize: 18 }}>Price Breakup</Text>
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', marginTop: 10 }}>
                        <Text style={{ color: textColor, fontSize: 16 }}>Sub Total (GST included)</Text>
                        <Text style={{ color: textColor, fontSize: 16 }}>{currency}<Text style={{ color: textColor, fontSize: 18 }}>{item.SUBTOTAL}</Text>
                        </Text>

                    </View>
                    <View style={{ width: '100%', height: 1, backgroundColor: categorySaperator, marginVertical: 15 }}></View>
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', marginTop: 0 }}>
                        <Text style={{ color: coupanGreen, fontSize: 16, fontFamily: 'Poppins-Regular' }}>Coupan Discount</Text>
                        <Text style={{ color: textColor, fontSize: 16, fontFamily: 'Poppins-Regular' }}>{currency}<Text style={{ color: textColor, fontSize: 18 }}>{Math.round(item.DISCOUNT_AMOUNT)}</Text>
                        </Text>

                    </View>
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', marginTop: 10 }}>
                        <Text style={{ color: textColor, fontSize: 16, fontFamily: 'Poppins-Regular' }}>Shipping Charge</Text>
                        <Text style={{ color: textColor, fontSize: 16, fontFamily: 'Poppins-Regular' }}>{currency}<Text style={{ color: textColor, fontSize: 18 }}>{item.SHIPPING_CHARGE}</Text>
                        </Text>

                    </View>
                    <View style={{ width: '100%', height: 1, backgroundColor: categorySaperator, marginVertical: 15 }}></View>
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', marginTop: 0 }}>
                        <Text style={{ color: textColor, fontSize: 16, fontFamily: 'Poppins-SemiBold' }}>Total Paid</Text>
                        <Text style={{ color: textColor, fontSize: 16, fontFamily: 'Poppins-Regular' }}>{currency}<Text style={{ color: textColor, fontSize: 18 }}>{Math.round(item.TOTAL)}</Text>
                        </Text>

                    </View>
                    <View style={{ width: '100%', height: 10, backgroundColor: categorySaperator, marginVertical: 20 }}></View>
                    <Text style={{ fontFamily: 'Poppins-SemiBold', color: textColor, fontSize: 18 }}>Billing/Shipping Address</Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins-Regular", marginTop: 5, color: textColor }}>{userData?.name}, {userData?.mobile_number}</Text>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins-Regular", marginTop: 5, color: textColor }}>{userData?.address}, {userData?.city}, {userData?.state}, {userData?.pincode}</Text>
                    <View style={{ width: '100%', height: 10, backgroundColor: categorySaperator, marginVertical: 20 }}></View>
                    <Text style={{ fontFamily: 'Poppins-SemiBold', color: textColor, fontSize: 18 }}>Sold By</Text>
                    <Text style={{ fontSize: 16, fontFamily: "Poppins-Regular", marginTop: 5, color: textColor }}>{dealerData?.company_name}</Text>
                    {/* <Text style={{ fontSize: 16, fontFamily: "Poppins-Regular", marginTop: 5, color: textColor }}>{dealerData.name}, {dealerData.mobile_number}</Text> */}
                    <Text style={{ fontSize: 14, fontFamily: "Poppins-Regular", marginTop: 5, color: textColor }}>{dealerData?.address}, GST - {dealerData?.gst_no}</Text>
                    <View style={{ width: '100%', height: 10, backgroundColor: categorySaperator, marginVertical: 20 }}></View>

                    <View style={{ width: '100%', justifyContent: 'space-around', flexDirection: 'row', marginBottom: 30 }}>
                        <TouchableOpacity
                            onPress={() => {
                                const url = `${server}print_invoice/` + item.ORDER_DETAILS_ID
                                Linking.canOpenURL(url).then(supported => {
                                    if (supported) {
                                        Linking.openURL(url);
                                    } else {
                                        console.log("Don't know how to open URI: " + url);
                                    }
                                });
                            }}
                            style={{ borderColor: buttonBgColor, padding: 10, borderRadius: 5, borderWidth: 2, flex: .45, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: buttonBgColor, fontFamily: 'Poppins-Regular' }}>Download Invoice</Text></TouchableOpacity>
                        {/* {item.SELLER_ORDER_ITEM_DETAILS.find(sellerItem => sellerItem.item_status === 'Pending') && <TouchableOpacity
                            onPress={() => cancelOrder()}
                            style={{ borderColor: buttonBgColor, padding: 10, borderRadius: 5, borderWidth: 2, flex: .45, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: buttonBgColor, fontFamily: 'Poppins-Regular' }}>Cancel Order</Text></TouchableOpacity>} */}
                    </View>

                </View>
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

const OrderDetails = connect(mapStateToProps, mapDispatchToProps)(OrderDetailsScreen);
export default OrderDetails;
