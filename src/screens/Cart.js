import React, { useEffect, useState } from "react"
import { Text, View, ScrollView, FlatList, Image, TouchableOpacity, TextInput } from "react-native"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { changeLoadingState } from "../actions/loadingAction"
import { getData } from "../common/asyncStore"
import { allCategoryPink, buttonBgColor, categorySaperator, coupanGreen, textColor, textInputColor, whiteTxtColor } from "../common/colours"
import { currency } from "../common/strings"
import Header from '../components/Header'
import AntDesign from 'react-native-vector-icons/AntDesign';

import { StackActions } from '@react-navigation/native';
import ValidationView from "../common/ValidationView"
import { server } from "../common/apiConstant"
import AddButton from "../common/AddButton"
import CouponList from "../common/CouponList"
import Ionicons from 'react-native-vector-icons/Ionicons';

import { changeCartCount } from "../actions/cartCount"
import SlotSelection from "../common/SlotSelection"
import { setPopup } from "../actions/message"
import RadioButton from "../common/RadioButton"
import RazorpayCheckout from 'react-native-razorpay';
import { flex } from "styled-system"
function CartScreen(props) {
    const { navigation, changeLoadingState, changeCartCount, setPopup } = props
    const [isCart, setIsCart] = useState(true)
    const [iAddress, setAddress] = useState(false)
    const [isSummary, setSummary] = useState(false)
    const [cartData, setCartData] = useState([])
    const [freeDealData, setFreeDealData] = useState([])
    const [coupanApplied, setCoupanApplied] = useState(null)
    const [coupanCode, setCoupanCode] = useState("")
    const [addresses, setAddresses] = useState([])
    const [selectedAddress, setSelectedAddress] = useState(0)
    const [coupanDiscount, setCoupanDiscount] = useState(0)
    const [coupanData, setCoupanData] = useState(null)
    const [offersList, setOffersList] = useState(null)
    const [appliedCoupan, setAppliedCoupan] = useState(null)
    const [discountOnly, setdiscountOnly] = useState(0)
    const [totalAmount, setTotalAmount] = useState(0)
    const [subTotal, setSubTotal] = useState(0)

    const [shippingAmount, setShippingAmount] = useState(0)
    const [aShippingDetails, setShippingDetails] = useState(null)
    const [summaryData, setSummaryData] = useState(null)
    const [grandAmount, setGrandAmount] = useState(0)
    const [type, setType] = useState("")
    const [orderNumber, setOrderNo] = useState("")
    const [error, setError] = useState({})
    const [days, setDays] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [selectedDay, setSelectedDay] = useState(null)

    const [instantDelivery, setInstantDelivery] = useState(false)
    const [instantDeliveryText, setInstantDeliveryTxt] = useState(null)
    const [isCodAvailable, setIsCodAvailable] = useState(true)
    const [isShippingAvailable, setIsShippingAvailable] = useState(true)
    const [loadingData, setIsLoading] = useState(true)
    const [percentageSaved, setPercentageSaved] = useState(null)
    useEffect(() => {
        if (totalAmount && totalAmount > 0 && cartData && cartData.length > 0) {
            let needToRemove = []
            freeDealData && freeDealData.forEach((item) => {
                if (parseFloat(totalAmount) < parseFloat(item.free_deal_on))
                    needToRemove.push(item.id)
            })
            if (needToRemove && needToRemove.length > 0) {
                const filteredItems = cartData.filter(item => needToRemove.includes(item.id));
                filteredItems && filteredItems.length > 0 && removeFromCart(filteredItems)
            }
        }
    }, [totalAmount, cartData])

    const removeFromCart = async (filteredItems) => {
        filteredItems.forEach(async (item) => {
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("Cookie", "ci_session=2bf9726eebea7926b7c73664c9a4797ab758ba13");
            const loginData = await getData("loginData")
            const userData = JSON.parse(loginData)
            const uniqueId = await getData("uniqueId")

            var raw = JSON.stringify({
                "seller_id": item.SELLER_ID,
                "user_id": userData?.USER_ID,
                "product_id": item.id,
                "device_id": uniqueId,
                "qty": -1
            });
            //return;

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };
            changeLoadingState(true)
            try {
                const url = `${server}addtocart`;
                const response = await fetch(url, requestOptions);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                //  return data;
            } catch (error) {
                console.error('Error fetching data:', error);
                return null;
            }

        })
        getCartData()
    }
    useEffect(() => {
        if (instantDelivery) {
            setSelectedSlot(null)
            setSelectedDay(null)
        }
    }, [instantDelivery])
    useEffect(() => {
        console.log(selectedSlot)
        if (selectedSlot) {
            setInstantDelivery(null)
        }
    }, [selectedSlot])
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (!iAddress) {
                setIsCart(true)
                setAddress(false)
                setSummary(false)
            }
            getAddresses()

            // getCartData()
        });

        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation, selectedAddress, addresses]);
    useEffect(() => {
        //console.log("discountOnly:  ",discountOnly)
        //console.log("coupanDiscount:  ",coupanDiscount)

        discountOnly + parseInt(coupanDiscount)
        const value = discountOnly + parseInt(coupanDiscount)
        setPercentageSaved("₹ " + (value) + " Saved! ")

    }, [coupanDiscount])

    useEffect(() => {
        let amount = 0;
        if (cartData) {
            for (let i = 0; i < cartData.length; i++) {
                amount = amount + (Number(cartData[i].subtotal))
            }
        }
        setSubTotal(amount)
        if (coupanDiscount) {
            amount = amount - coupanDiscount
        }
        setTotalAmount("" + amount)
        setGrandAmount("" + (amount + shippingAmount))
    }, [cartData, coupanDiscount, shippingAmount])
    useEffect(() => {
        if (appliedCoupan) {
            setTimeout(() => {
                applyCoupan(appliedCoupan)

            }, 1000)
        }
    }, [cartData])


    const addItem = (qty, item) => {
        // console.log("item : ", item)
        // return
        addToCart({ product: item, qty: 1 })
    }
    const minusItem = (qty, item) => {
        addToCart({ product: item, qty: -1 })
    }

    const addToCart = async ({ product, qty }) => {
        // console.log("  product:  ", product)
        // return;
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "ci_session=2bf9726eebea7926b7c73664c9a4797ab758ba13");
        const loginData = await getData("loginData")
        const userData = JSON.parse(loginData)
        const uniqueId = await getData("uniqueId")

        var raw = JSON.stringify({
            "seller_id": product.SELLER_ID,
            "user_id": userData?.USER_ID,
            "product_id": product.id,
            "device_id": uniqueId,
            "qty": qty
        });
        console.log("raw : ", raw)
        //return;

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        changeLoadingState(true)
        const url = `${server}addtocart`;
        console.log("url  :  ", url)
        fetch(url, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)

                console.log("cart add data : ", result)
                if (result && result.status) {
                    //   getCartCount(uniqueId)
                    getCartData()
                    // if (appliedCoupan) {
                    //     applyCoupan(appliedCoupan)
                    // }
                } else {
                    setPopup({ message: result.message, status: "faliure", open: true })

                }
            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)

            });
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
                console.log(" Address data: ", JSON.stringify(result))
                if (result && result.status) {
                    setAddresses(result.data)

                } else {
                    result.statusCode === 200 && setAddresses([])
                }
                setTimeout(() => {
                    console.log("Calling from here")
                    getCartData()
                }, 500)
                console.log(JSON.stringify(result))
            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)
                getCartData()

            });
    }
    useEffect(() => {
        getAddresses()
    }, [selectedAddress])
    const getCartData = async () => {
        const uniqueId = await getData("uniqueId")
        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=3e998d27810297039809f7b75e1fa98299a4c265");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        let url = `${server}cartdata/${uniqueId}`
        console.log("Address URL : ", iAddress, addresses)

        if (addresses && addresses.length > 0) {
            const loginData = await getData("loginData")
            const userData = JSON.parse(loginData)


            console.log("addresses : ", addresses)
            url = url + '/' + userData?.USER_ID + '/' + addresses[selectedAddress].ID
        }
        console.log("Address URL : ", url)
        setIsLoading(true)
        changeLoadingState(true)

        fetch(url, requestOptions)
            .then(response => response.json())
            .then(result => {

                changeLoadingState(false)
                // console.log("result.data  :  ", JSON.stringify(result.data))
                if (result && result.data && result.data.aCartItemDetails) {
                    setIsCodAvailable(result.data.isCodAvailable)
                    setIsShippingAvailable(result.data.isShippingAvailable)
                    setCartData(result.data.aCartItemDetails)
                    // console.log("result.data.aCartItemDetails  :  ", result.data.aCartItemDetails)
                    const modifiedFreeDealData = result.data.aFreeDealsProList &&
                        result.data.aFreeDealsProList.map((item) => {
                            let isAddedTOCart = false;
                            result.data.aCartItemDetails.forEach((cartItem) => {
                                if (!isAddedTOCart && item.id === cartItem.id)
                                    isAddedTOCart = true
                            })
                            return { ...item, isAddedTOCart }
                        })
                    setFreeDealData(modifiedFreeDealData)

                    let totalPrice = 0;
                    let sellingPrice = 0;
                    result.data.aCartItemDetails.forEach(item => {
                        totalPrice = totalPrice + parseFloat(item.mrp_price) * Number(item.QTY);
                        sellingPrice = sellingPrice + parseFloat(item.selling_price) * Number(item.QTY);
                        //let percentageSaved = ((mrp - sellingPrice) / mrp) * 100;
                        //console.log(`For item ${item.title}, the percentage amount saved from MRP to selling price is ${percentageSaved.toFixed(2)}%`);
                    });
                    console.log("Total Price ", totalPrice, "  selling price : ", sellingPrice)
                    const value = totalPrice - sellingPrice + parseInt(coupanDiscount)
                    setdiscountOnly(totalPrice - sellingPrice)
                    setPercentageSaved("₹ " + (value) + " Saved! ")

                    setOffersList(result.data.aCouponOffersList)
                    setInstantDeliveryTxt(result.data.instantDelivery)
                    if (result.data.aShippingDetails) {
                        console.log("result.data.aShippingDetails.shipping_charge  :  ", result.data.aShippingDetails.shipping_charge)
                        setShippingAmount(Number(result.data.aShippingDetails.shipping_charge))
                        setShippingDetails(result.data.aShippingDetails)
                    } else {
                        setShippingAmount(0)
                        setShippingDetails(null)
                    }
                } else {
                    setCartData([])
                }
                setDays(result?.data?.aDeliverySlots)
                console.log(JSON.stringify(result))
                setIsLoading(false)

            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)
                setIsLoading(false)

            });
    }
    const removeItem = async (item) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "ci_session=b3a918326995ae93186ed84393970a580a1238f8");

        var raw = JSON.stringify({
            "cart_id": item.CART_ID
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        changeLoadingState(true)

        fetch(`${server}removecartitem`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)

                console.log(result)
                if (result && result.status) {
                    getCartData()
                }
            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)

            });
    }
    const bottomProduuct = ({ item, index }) => (
        <View
            key={"bottomItem" + index}
            style={{ flexDirection: "row", marginTop: 10, padding: 0, borderTopColor: categorySaperator, borderTopWidth: 0, justifyContent: 'space-between' }}>
            <View style={{ flex: .6, flexDirection: 'row' }}>
                <View style={{ paddingVertical: 5, paddingHorizontal: 10 }}>
                    <Text
                        numberOfLines={2}
                        style={{ fontFamily: 'Poppins-Regular', color: textColor, fontSize: 14, }}>{item.title}</Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row', flex: .4, justifyContent: 'flex-end', paddingHorizontal: 10 }}>
                <View style={{ alignSelf: 'center', marginLeft: 10 }}>
                    <View style={{ flexDirection: "row", alignSelf: 'flex-end' }}>
                        <Text
                            style={{ fontFamily: 'Poppins-Regular', color: textColor, alignSelf: 'flex-end' }}>{currency}</Text>
                        <Text
                            style={{ fontFamily: 'Poppins-Medium', color: textColor, alignSelf: 'flex-end' }}>{item.subtotal}</Text>
                    </View>
                    {/* <Text style={{ color: allCategoryPink }}>{item.mrp_price}</Text> */}
                </View>
            </View>
        </View>
    )

    const freedealItem = ({ item }) => {
        console.log("item freeDeal : ", item)
        return (
            <View style={{
                marginTop: 10, borderColor: categorySaperator,
                borderWidth: 1, borderRadius: 5, width: "95%", alignSelf: 'center'
            }}>
                <View style={{ width: '100%', backgroundColor: "#F1F1F1", minHeight: 30, padding: 10 }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Poppins-Medium', color: textColor, }}>{`Shop for ₹${item?.free_deal_on} to get discount`}</Text>
                </View>

                <View style={{
                    flexDirection: "row",
                    justifyContent: 'space-between',
                    margin: 5
                }}>
                    <View style={{ flex: .25, flexDirection: 'row' }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("ProductDetails", { product: item })
                                }
                            >
                                <Image
                                    style={{ width: 90, height: 90, borderWidth: 2, borderColor: categorySaperator, borderRadius: 7, padding: 20, resizeMode: 'center' }}
                                    source={{ uri: item.image_first }}
                                />
                            </TouchableOpacity>

                        </View>
                    </View>

                    <View style={{ justifyContent: 'space-between', alignItems: 'flex-end', flexDirection: 'row', flex: .75, }}>

                        <View style={{ alignSelf: 'flex-start', marginLeft: 10, marginBottom: 10, flex: .7 }}>
                            <Text
                                numberOfLines={2}
                                style={{ fontFamily: 'Poppins-Medium', color: textColor, fontSize: 11, width: '50%' }}>{item.title}</Text>
                            <View style={{ flexDirection: "row", alignSelf: 'flex-start' }}>
                                <Text
                                    style={{ fontFamily: 'Poppins-Bold', color: textColor, alignSelf: 'flex-start', fontSize: 22 }}>{currency}</Text>
                                <Text
                                    style={{ fontFamily: 'Poppins-Bold', color: textColor, alignSelf: 'flex-start', fontSize: 22 }}>{item.selling_price}</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignSelf: 'flex-start' }}>
                                <Text
                                    style={{ fontFamily: 'Poppins-Regular', color: textColor, alignSelf: 'flex-end' }}>Current MRP Price {currency}</Text>
                                <Text
                                    style={{ fontFamily: 'Poppins-Medium', color: textColor, alignSelf: 'flex-end' }}>{item.mrp_price}</Text>
                            </View>
                        </View>
                        <AddButton
                            isAddBlocked={parseFloat(item?.free_deal_on) >= parseFloat(totalAmount)}
                            // isAddedToCart={false}
                            freeDealAddedToCart={item?.isAddedTOCart}
                            style={{
                                flex: .3,
                                alignSelf: 'flex-end',
                                backgroundColor: parseFloat(item?.free_deal_on) <= parseFloat(totalAmount) ? allCategoryPink : '#d0d0d0'
                            }}
                            callBack={getCartData}
                            changeLoadingState={changeLoadingState}
                            addItem={addItem}
                            minusItem={minusItem}
                            item={{ ...item, qty_added_in_cart: item.QTY }}
                        />

                    </View>
                </View>
            </View>

        )
    };
    const renderItem = ({ item }) => (
        !item.QTY || item.QTY === "0" ? null : <View style={{ flexDirection: "row", marginTop: 10, padding: 10, borderTopColor: categorySaperator, borderTopWidth: 0, justifyContent: 'space-between' }}>
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: .27 }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("ProductDetails", { product: item })
                    }
                >
                    <Image
                        style={{ width: 90, height: 90, borderWidth: 2, borderColor: categorySaperator, borderRadius: 7, padding: 20, resizeMode: 'center' }}
                        source={{ uri: item.FIRST_IMAGE }}
                    />
                </TouchableOpacity>

            </View>

            <View style={{ flex: .73, }}>

                <View style={{ paddingVertical: 5, paddingHorizontal: 5, flexDirection: 'row', width: '100%' }}>
                    <Text
                        numberOfLines={2}
                        style={{ fontFamily: 'Poppins-Medium', color: textColor, fontSize: 11, flex: item.is_deal_product && item.is_deal_product == '1' ? .68 : 1 }}>{item.title}</Text>
                    {/* <View style={{ flexDirection: 'row', marginTop: 5 }}>

                    </View> */}
                    {item.is_deal_product && item.is_deal_product == '1' && <View style={{
                        borderRadius: 7, backgroundColor: coupanGreen, paddingHorizontal: 10, height: 35, justifyContent: 'center',
                        flex: item.is_deal_product && item.is_deal_product == '1' ? .32 : 1, alignSelf: 'flex-end'
                    }}>
                        <Text style={{ color: '#ffffff', fontSize: 12, fontFamily: 'Poppins-Medium',alignSelf:'center' }}>Deal Applied</Text>
                    </View>}
                </View>
                <View style={{ justifyContent: 'flex-end', alignItems: 'flex-end', flexDirection: 'row', flex: .4, justifyContent: 'flex-end', }}>
                    <AddButton
                        isAddedToCart={true}
                        style={{ alignSelf: 'flex-end' }}
                        callBack={getCartData}
                        changeLoadingState={changeLoadingState}
                        addItem={addItem}
                        minusItem={minusItem}
                        item={{ ...item, qty_added_in_cart: item.QTY }}
                    />
                    <View style={{ alignSelf: 'flex-end', marginLeft: 10, marginBottom: 10, minWidth: 45 }}>
                        <Text
                            style={{
                                alignSelf: 'flex-end',
                                fontFamily: 'Poppins-Regular', color: textInputColor, textDecorationLine: 'line-through',
                                textDecorationStyle: 'solid'
                            }}>{currency} {Number(item.mrp_price) * Number(item.QTY)}</Text>
                        <View style={{ flexDirection: "row", alignSelf: 'flex-end' }}>
                            <Text
                                style={{ fontFamily: 'Poppins-Regular', color: textColor, alignSelf: 'flex-end' }}>{currency}</Text>
                            <Text
                                style={{ fontFamily: 'Poppins-Medium', color: textColor, alignSelf: 'flex-end' }}>{item.subtotal}</Text>
                        </View>
                    </View>
                </View>
            </View>


        </View>
    );
    const redirectToAddress = async () => {
        const login = await getData("isLogin")
        if (login && login === 'true') {
            getCartData()
            setIsCart(false)
            setAddress(true)
            // setTimeout(()=>{
            //     getCartData()
            // },500)
        } else {
            navigation.navigate("LoginFlow", { from: "cart" })
        }

    }
    const renderAddressItem = ({ item, index }) => (
        <View style={{ width: '95%', borderWidth: 1, borderRadius: 10, borderColor: categorySaperator, marginTop: 20, padding: 20, marginHorizontal: 10 }}>
            <Text style={{ fontFamily: 'Poppins-Medium', color: textColor }}>{item.Name}</Text>
            <Text style={{ marginTop: 3, fontFamily: 'Poppins-Regular', color: textInputColor }}>{item.Address + ", " + item.City + ", " + item.State + ", " + item.Pincode}</Text>

            <Text style={{ borderRadius: 5, fontFamily: 'Poppins-Regular', color: textColor, backgroundColor: categorySaperator, width: '20%', textAlign: 'center', padding: 5, marginTop: 10 }}>{item.Address_Type}</Text>
            <View style={{ position: 'absolute', bottom: 10, right: 5, flexDirection: 'row', marginRight: 10, marginTop: 5 }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("MyAddress", { editItemFromPrevious: item, cart: true })}
                ><Text style={{ color: buttonBgColor }}>EDIT</Text></TouchableOpacity>

            </View>
            <TouchableOpacity
                onPress={() => setSelectedAddress(index)}
                style={{ justifyContent: 'center', alignItems: 'center', position: 'absolute', borderColor: buttonBgColor, height: 25, width: 25, borderRadius: 15, borderWidth: 5, right: 5, top: 10 }}>
                {selectedAddress === index && <View style={{ width: 10, height: 10, backgroundColor: buttonBgColor, borderRadius: 5 }}></View>}
            </TouchableOpacity>
        </View>
    );
    const applyCoupan = async (coupanCode, from) => {
        //coupanCode
        //return;
        const uniqueId = await getData("uniqueId")
        let amount = 0;
        if (cartData) {
            for (let i = 0; i < cartData.length; i++) {
                amount = amount + (Number(cartData[i].subtotal))
            }
        }
        setSubTotal(amount)
        // if (coupanDiscount) {
        //     amount = amount - coupanDiscount
        // }
        let valid = true
        let errorObject = {}

        if (!coupanCode) {
            errorObject = { "CoupanCode": "Please enter coupan code" }
            valid = false
        }

        if (!valid) {
            setError(errorObject)
            return;
        } else {
            setError({})
        }

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "ci_session=d34c4cfcfce40370ce45e19d76fa3a420596bf1c");
        // let amount = 0;
        // console.log("cartData  :  ",cartData)
        // if (cartData) {
        //     for (let i = 0; i < cartData.length; i++) {
        //         amount = amount + (Number(cartData[i].subtotal) * Number(cartData[i].QTY))
        //     }
        // }

        var raw = JSON.stringify({
            "coupon_code": coupanCode,
            "total": "" + amount,
            "device_id": uniqueId
        });
        console.log("raw : ", raw)
        console.log("totalAmount  :  ", amount)
        //return;
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        changeLoadingState(true)
        fetch(`${server}applycoupondiscount`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)
                if (result && result.status) {
                    if (from && from === "coupan")
                        setPopup({ message: result.message, status: "success", open: true })
                    setCoupanDiscount(result.data.iCouponDiscount)
                    setCoupanData(result.data)
                } else {
                    if (from && from === "coupan")
                        setPopup({ message: result.message, status: "faliure", open: true })
                    setCoupanDiscount(0)
                    setCoupanData(null)

                }
            })
            .catch(error => {
                console.log('error hello', error)
                changeLoadingState(false)

            });
    }
    const back = () => {
        if (isCart) {
            //  navigation.navigate("HomeStack")

            navigation.navigate("Tabs")
        } else if (iAddress) {
            setAddress(false)
            setIsCart(true)
        } else {
            // navigation.goBack()
            navigation.dispatch(
                StackActions.replace('Cart')
            );

        }
    }
    const placeOrder = async () => {
        if (!type) {
            return;
        }
        if (!selectedSlot && !instantDelivery) {
            setPopup({ message: "Please select delivery slot first.", status: "faliure", open: true })

            // alert(" hello")
            return;
        }
        // console.log("!selectedSlot && !instantDelivery  :  ", selectedSlot , instantDelivery)
        // return;
        if (type === 'ONLINE') {

            const callApi = async () => {
                const uniqueId = await getData("uniqueId")
                const loginData = await getData("loginData")
                const userData = JSON.parse(loginData)

                var myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("Cookie", "ci_session=6477d774404ca5f042522204a946849a3f634cb8");
                const todayDate = new Date()
                var raw = JSON.stringify({
                    "device_id": uniqueId,
                    "user_id": userData?.USER_ID,
                    "address_id": addresses[selectedAddress].ID,
                    "sub_total": "" + subTotal,
                    "coupon_used": coupanDiscount > 0 ? "y" : "n",
                    "coupon_code": coupanDiscount > 0 ? coupanCode : "",
                    "discount_percent": coupanData ? coupanData.iCouponPercent : '',
                    "discount_amount": coupanData ? "" + coupanData.iCouponDiscount : '',
                    "shipping_type": aShippingDetails?.shipping_type,
                    "shipping_charge": aShippingDetails?.shipping_charge,
                    "grand_total": "" + grandAmount,
                    "payment_method": type === 'ONLINE' ? type : "Cash On Delivery",
                    "grocery_delivery_date": instantDelivery ? todayDate.getDate() + "-" + (todayDate.getMonth() + 1) + "-" + todayDate.getFullYear() : selectedDay,
                    "grocery_delivery_time": instantDelivery ? instantDeliveryText : selectedSlot?.TIME_DETAILS,
                });
                console.log("raw : ", raw)
                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: raw,
                    redirect: 'follow'
                };
                changeLoadingState(true)

                fetch(`${server}orderplace`, requestOptions)
                    .then(response => response.json())
                    .then(result => {
                        changeLoadingState(false)

                        console.log("result : ", JSON.stringify(result))
                        if (result && result.status) {
                            var options = {
                                description: 'Credits towards consultation',
                                //image: 'https://i.imgur.com/3g7nmJC.png',
                                currency: 'INR',
                                key: "rzp_live_GLNDBQJScCfN8J",
                                // key: 'rzp_test_G3DynLoqIXyW78', // Your api key
                                amount: '' + (grandAmount * 100),
                                name: 'Payment',
                                prefill: {
                                    email: 'void@razorpay.com',
                                    contact: '',
                                    name: 'Razorpay Software'
                                },
                                theme: { color: '#F37254' }
                            }
                            RazorpayCheckout.open(options).then((data) => {
                                console.log("data from razor pay: ", data)
                                if (data && data.razorpay_payment_id) {
                                    var myHeaders = new Headers();
                                    myHeaders.append("Content-Type", "application/json");
                                    myHeaders.append("Cookie", "ci_session=21a9cec92442a0de6fadfa0a5515bc5e44563924");

                                    var raw = JSON.stringify({
                                        "payment_status_code": "200",
                                        "payment_status": "Complete",
                                        "unique_order_id": result?.data?.oder_id,
                                        "bank_transaction_id": data?.razorpay_payment_id
                                    });

                                    var requestOptions = {
                                        method: 'POST',
                                        headers: myHeaders,
                                        body: raw,
                                        redirect: 'follow'
                                    };

                                    fetch(`${server}payment_response`, requestOptions)
                                        .then(response => response.json())
                                        .then(result => {
                                            if (result && result.status) {
                                                setSummary(true)
                                                setAddress(false)
                                                setIsCart(false)
                                                setSummaryData(result.data)
                                                setOrderNo(result.data?.oder_id)
                                                changeCartCount(0)
                                            }
                                            console.log(result)
                                        })
                                        .catch(error => console.log('error', error));
                                }
                                // handle success
                                //alert(`Success: ${data.razorpay_payment_id}`);

                            }).catch((error) => {
                                // handle failure
                                alert(`Error: ${error.code} | ${error.description}`);
                            });



                        } else
                            setPopup({ message: result.message, status: "faliure", open: true })

                    })
                    .catch(error => {
                        console.log('error', error)
                        changeLoadingState(false)

                    });
            }
            callApi()

            return;
        }
        const uniqueId = await getData("uniqueId")
        const loginData = await getData("loginData")
        const userData = JSON.parse(loginData)

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "ci_session=6477d774404ca5f042522204a946849a3f634cb8");
        const todayDate = new Date()

        var raw = JSON.stringify({
            "device_id": uniqueId,
            "user_id": userData?.USER_ID,
            "address_id": addresses[selectedAddress].ID,
            "sub_total": "" + subTotal,
            "coupon_used": coupanDiscount > 0 ? "y" : "n",
            "coupon_code": coupanDiscount > 0 ? coupanCode : "",
            "discount_percent": coupanData ? coupanData.iCouponPercent : '',
            "discount_amount": coupanData ? "" + coupanData.iCouponDiscount : '',
            "shipping_type": aShippingDetails?.shipping_type,
            "shipping_charge": aShippingDetails?.shipping_charge,
            "grand_total": "" + grandAmount,
            "payment_method": type === 'ONLINE' ? type : "Cash On Delivery",
            "grocery_delivery_date": instantDelivery ? todayDate.getDate() + "-" + (todayDate.getMonth() + 1) + "-" + todayDate.getFullYear() : selectedDay,
            "grocery_delivery_time": instantDelivery ? instantDeliveryText : selectedSlot?.TIME_DETAILS,
        });
        console.log("raw : ", raw, aShippingDetails)
        //return;
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        changeLoadingState(true)

        fetch(`${server}orderplace`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)

                console.log("result : ", JSON.stringify(result))
                if (result && result.status) {
                    //navigation.goBack()
                    setSummary(true)
                    setAddress(false)
                    setIsCart(false)
                    setSummaryData(result.data)
                    setOrderNo(result.data?.oder_id)
                    changeCartCount(0)
                    //setPopup({ message: result.message, status: "success", open: true })

                } else
                    setPopup({ message: result.message, status: "faliure", open: true })

            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)

            });
    }
    return (
        <View style={{ flex: 1 }}>

            <View style={{ flex: .06, width: "100%", backgroundColor: '#3b006a', justifyContent: 'center', flexDirection: 'row', paddingVertical: 15 }}>
                <Ionicons
                    onPress={() => {
                        if (iAddress) {
                            setIsCart(true)
                            setAddress(false)
                        }
                        else
                            navigation.goBack()
                    }}
                    style={{ marginLeft: 0, position: 'absolute', left: 5, alignSelf: 'center' }}
                    name="ios-chevron-back-outline"
                    size={32}
                    color={whiteTxtColor} />
                <View style={{ flex: .6, justifyContent: 'center', alignSelf: 'center' }}>
                    <Image
                        style={{ alignSelf: 'center', width: 138, height: 30 }}
                        source={require('../../assets/logo.png')}
                    />
                </View>
                <Text style={{ position: 'absolute', right: 5, alignSelf: 'center', fontFamily: 'Poppins-SemiBold', color: 'white', fontSize: 18, paddingRight: 10 }}>Cart</Text>

                {/* <View style={{ flexDirection: 'row', alignSelf: 'center', flex: .2, justifyContent: 'flex-end' }}>
                </View> */}
            </View>
            {isCart && cartData && cartData.length > 0 && (<ScrollView
                showsVerticalScrollIndicator={false}
                style={{ width: '100%', flex: .94, height: '94%', backgroundColor: 'white' }}>
                <FlatList
                    style={{ marginTop: 10 }}
                    data={cartData}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => "" + index}
                />
                {freeDealData && freeDealData.length > 0 ?
                    <View style={{ marginTop: 15, alignItems: 'center', flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 10 }}>
                        <View style={{ borderRadius: 7, backgroundColor: coupanGreen, paddingHorizontal: 15, paddingVertical: 10 }}>
                            <Text style={{ color: '#ffffff', fontSize: 16, fontFamily: 'Poppins-Medium' }}>Great Deals</Text>
                        </View>
                        <Text style={{ marginLeft: 5, fontSize: 18, fontFamily: 'Poppins-Medium' }}>Limited-Time Offer</Text>
                    </View>
                    : null}
                <FlatList
                    style={{ marginTop: 10 }}
                    data={freeDealData}
                    renderItem={freedealItem}
                    keyExtractor={(item, index) => "" + index}
                />
                <CouponList
                    setCoupanDiscount={setCoupanDiscount}
                    setAppliedCoupan={setAppliedCoupan}
                    appliedCoupan={appliedCoupan}
                    applyCoupan={applyCoupan}
                    offersList={offersList}
                />
                <View style={{ width: '100%', height: 10, marginVertical: 10, backgroundColor: null }}></View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 10 }}>
                    <Text
                        style={{ fontFamily: 'Poppins-Regular', color: textColor, fontSize: 18, paddingHorizontal: 0, marginTop: 0 }}>{"Item Total"}</Text>
                    <View style={{ flexDirection: "row" }}>
                        <Text
                            style={{ fontFamily: 'Poppins-Regular', color: textColor, fontSize: 16, }}>{currency}</Text>
                        <Text
                            style={{ fontFamily: 'Poppins-Regular', color: textColor, fontSize: 16, }}>{subTotal}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 10 }}>
                    <Text
                        style={{ fontFamily: 'Poppins-Regular', color: coupanGreen, fontSize: 16, }}>{"Coupan Discount"}</Text>
                    <View style={{ flexDirection: "row" }}>
                        <Text
                            style={{ fontFamily: 'Poppins-Regular', color: textColor, fontSize: 16, }}>{currency}</Text>
                        <Text
                            style={{ fontFamily: 'Poppins-Regular', color: coupanGreen, fontSize: 16, }}>{coupanDiscount}</Text>
                    </View>
                </View>

                <View style={{ backgroundColor: categorySaperator, height: 1, width: '100%', marginVertical: 20 }}></View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 10 }}>
                    <Text
                        style={{ fontFamily: 'Poppins-SemiBold', color: textColor, fontSize: 18, }}>{"To Pay"}</Text>
                    <View style={{ flexDirection: "row" }}>
                        <Text
                            style={{ fontFamily: 'Poppins-SemiBold', color: textColor, fontSize: 18, }}>{currency}</Text>
                        <Text
                            style={{ fontFamily: 'Poppins-SemiBold', color: textColor, fontSize: 18, }}>{totalAmount}</Text>
                    </View>

                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}><Image
                    style={{ width: 25, height: 25, tintColor: coupanGreen }}
                    source={(require('../../assets/discount.png'))}
                />
                    <Text style={{ color: coupanGreen, fontFamily: 'Poppins-SemiBold', alignSelf: 'center' }}>  {percentageSaved} <Text style={{ fontSize: 12 }}>on this order</Text></Text>

                </View>
                <TouchableOpacity
                    onPress={redirectToAddress}
                    style={{ backgroundColor: allCategoryPink, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 5, marginVertical: 20, width: '80%', alignSelf: 'center' }}>
                    <Text style={{ color: whiteTxtColor, fontFamily: 'Poppins-Regular', alignSelf: 'center', fontSize: 18 }}>CONTINUE TO PAYMENT</Text>
                </TouchableOpacity>
            </ScrollView>)}
            {iAddress && cartData && cartData.length > 0 && <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ width: '100%', flex: .94, height: '94%', backgroundColor: 'white' }}>

                <View style={{ width: '100%', marginVertical: 10, backgroundColor: categorySaperator }}></View>
                <TouchableOpacity
                    onPress={() => navigation.navigate("MyAddress", { editItemFromPrevious: null, cart: true })}
                >
                    <Text style={{ color: buttonBgColor, fontSize: 18, fontFamily: 'Poppins-SemiBold', margin: 10 }}>+ ADD NEW ADDRESSES</Text>

                </TouchableOpacity>


                <FlatList
                    showsVerticalScrollIndicator={false}
                    style={{ width: '100%' }}
                    data={addresses}
                    renderItem={renderAddressItem}
                    keyExtractor={(item, index) => 'addresses' + index}
                />

                {addresses && addresses.length > 0 && !isShippingAvailable && <Text style={{ marginTop: 10, justifyContent: 'center', alignSelf: 'center', fontSize: 18, fontFamily: 'Poppins-SemiBold', color: allCategoryPink }}>Sorry We are not delivering here</Text>}

                {instantDeliveryText && <TouchableOpacity
                    onPress={() => setInstantDelivery(true)}
                    style={{
                        ...{
                            backgroundColor: '#ffffff',
                            padding: 10,
                            marginBottom: 5,
                            borderRadius: 5,
                            margin: 3,
                            marginTop: 15
                        }, width: '95%', alignSelf: 'center', flexDirection: 'row', borderColor: instantDelivery ? allCategoryPink : '#a1a1a1', borderWidth: 1
                    }}>
                    <RadioButton
                        isSelected={instantDelivery ? true : false}
                    />

                    <Text style={{
                        ...{
                            fontSize: 12,
                            alignSelf: 'center'
                        }, color: instantDelivery ? allCategoryPink : '#a1a1a1'
                    }}>{instantDeliveryText}</Text>
                </TouchableOpacity>}



                <FlatList
                    data={days}
                    keyExtractor={(item) => item.DAYS_ID}
                    renderItem={({ item }) => <SlotSelection
                        setSelectedSlot={setSelectedSlot}
                        setSelectedDay={setSelectedDay}
                        day={item} selectedSlot={selectedSlot}
                    />}
                />
                <View style={{ width: '100%', height: 10, marginVertical: 10, backgroundColor: categorySaperator }}></View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 5 }}>
                    <Text
                        style={{ fontFamily: 'Poppins-Regular', color: textColor, fontSize: 18, paddingHorizontal: 0, marginTop: 0 }}>{"Sub Total"}</Text>
                    <View style={{ flexDirection: "row" }}>
                        <Text
                            style={{ fontFamily: 'Poppins-Regular', color: textColor, fontSize: 16, }}>{currency}</Text>
                        <Text
                            style={{ fontFamily: 'Poppins-Regular', color: textColor, fontSize: 16, }}>{subTotal}</Text>
                    </View>
                </View>
                {/* <Text
                    style={{ fontFamily: 'Poppins-SemiBold', color: textColor, fontSize: 18, paddingHorizontal: 10 }}>{"Sub Total"}</Text> */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 10 }}>
                    <Text
                        style={{ fontFamily: 'Poppins-Regular', color: textColor, fontSize: 16, }}>{"Shipping Charge"}</Text>
                    <View style={{ flexDirection: "row" }}>
                        <Text
                            style={{ fontFamily: 'Poppins-Regular', color: textColor, fontSize: 16, }}>{currency}</Text>
                        <Text
                            style={{ fontFamily: 'Poppins-Regular', color: textColor, fontSize: 16, }}>{shippingAmount}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 10 }}>
                    <Text
                        style={{ fontFamily: 'Poppins-Regular', color: coupanGreen, fontSize: 16, }}>{"Coupan Discount"}</Text>
                    <View style={{ flexDirection: "row" }}>
                        <Text
                            style={{ fontFamily: 'Poppins-Regular', color: textColor, fontSize: 16, }}>{currency}</Text>
                        <Text
                            style={{ fontFamily: 'Poppins-Regular', color: coupanGreen, fontSize: 16, }}>{coupanDiscount}</Text>
                    </View>
                </View>
                <View style={{ width: '100%', height: 2, marginVertical: 10, backgroundColor: categorySaperator }}></View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 10 }}>
                    <Text
                        style={{ fontFamily: 'Poppins-SemiBold', color: textColor, fontSize: 16, }}>{"Total"}</Text>
                    <View style={{ flexDirection: "row" }}>
                        <Text
                            style={{ fontFamily: 'Poppins-Regular', color: textColor, fontSize: 16, }}>{currency}</Text>
                        <Text
                            style={{ fontFamily: 'Poppins-SemiBold', color: textColor, fontSize: 16, }}>{grandAmount}</Text>
                    </View>
                </View>
                {isShippingAvailable && <View style={{ flexDirection: 'row', paddingHorizontal: 10, marginTop: 20 }}>
                    <TouchableOpacity
                        onPress={() => setType("ONLINE")}
                        style={{ alignSelf: 'center', justifyContent: 'center', alignItems: 'center', borderColor: buttonBgColor, height: 25, width: 25, borderRadius: 15, borderWidth: 5, }}>
                        {type === "ONLINE" && <View style={{ width: 10, height: 10, backgroundColor: buttonBgColor, borderRadius: 5 }}></View>}
                    </TouchableOpacity>
                    <Text style={{ color: textColor, fontSize: 15, fontFamily: 'Poppins-SemiBold', alignSelf: 'center', marginLeft: 10 }}>Credit/Debit Card / Netbanking & UPI</Text>
                </View>}
                {isShippingAvailable && isCodAvailable ? <View style={{ flexDirection: 'row', paddingHorizontal: 10, marginTop: 20 }}>
                    <TouchableOpacity
                        onPress={() => setType("COD")}
                        style={{ alignSelf: 'center', justifyContent: 'center', alignItems: 'center', borderColor: buttonBgColor, height: 25, width: 25, borderRadius: 15, borderWidth: 5, }}>
                        {type === "COD" && <View style={{ width: 10, height: 10, backgroundColor: buttonBgColor, borderRadius: 5 }}></View>}
                    </TouchableOpacity>
                    <Text style={{ color: textColor, fontSize: 15, fontFamily: 'Poppins-SemiBold', alignSelf: 'center', marginLeft: 10 }}>Cash on Delivery</Text>
                </View> : null}
                {isShippingAvailable && <TouchableOpacity
                    onPress={placeOrder}
                    style={{ backgroundColor: allCategoryPink, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 5, marginVertical: 20, width: '80%', alignSelf: 'center' }}>
                    <Text style={{ color: whiteTxtColor, fontFamily: 'Poppins-Regular', alignSelf: 'center', fontSize: 18 }}>PROCEED</Text>
                </TouchableOpacity>}

            </ScrollView>}

            {isSummary && cartData && cartData.length > 0 && <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ width: '100%', flex: .94, height: '94%', backgroundColor: 'white' }}>

                {/* <View style={{ width: '100%', height: 10, marginVertical: 10, backgroundColor: categorySaperator }}></View> */}
                <View style={{ justifyContent: 'center', marginTop: 50, alignSelf: 'center' }}>
                    <AntDesign style={{ alignSelf: 'center' }}

                        name="checkcircleo" size={120} color={coupanGreen} />
                    <Text style={{ fontSize: 40, alignSelf: 'center', color: coupanGreen, fontFamily: 'Poppins-Regular' }}>Thank you!</Text>
                    <Text style={{ fontSize: 20, alignSelf: 'center', color: textColor, fontFamily: 'Poppins-Regular' }}>Order No. {orderNumber}</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("HomeStack")}
                        style={{
                            backgroundColor: allCategoryPink,
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            width: 80,
                            height: 37,
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            maxHeight: 35,
                            marginTop: 20
                        }}>
                        <Text style={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: 16,
                            fontFamily: 'Poppins-Regular'
                        }}>Home</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>}
            {isCart && (!cartData || cartData.length == 0) && <View style={{ width: '100%', flex: .94, backgroundColor: 'white' }}>
                <Image
                    resizeMode={'center'}
                    style={{ height: 100, width: 100, alignSelf: 'center', resizeMode: 'contain', marginTop: '40%' }}
                    source={require('../../assets/empty-cart-new.png')}
                />
                {!loadingData ? <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 18, alignSelf: 'center', marginTop: 20 }}>Your cart is empty</Text> : null}
                <TouchableOpacity
                    onPress={() => navigation.navigate("HomeStack")}
                    style={{ alignSelf: 'center', padding: 10, borderRadius: 7, borderWidth: 1, borderColor: allCategoryPink, marginTop: 20 }}>
                    <Text style={{ fontFamily: "Poppins-Regular", fontSize: 18, alignSelf: 'center', color: allCategoryPink }}>Browse Products</Text>
                </TouchableOpacity>
            </View>}
        </View >
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
        ...bindActionCreators({ changeLoadingState, changeCartCount, setPopup }, dispatch),
    }

}

const Cart = connect(mapStateToProps, mapDispatchToProps)(CartScreen);
export default Cart;

