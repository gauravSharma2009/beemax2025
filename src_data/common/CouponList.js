import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ImageBackground } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { allCategoryPink, BackgroundGray, categorySaperator, offPurpleColor } from './colours';

const CouponList = (props) => {
    const { offersList, applyCoupan, setAppliedCoupan, appliedCoupan, setCoupanDiscount } = props
    const [copiedCoupon, setCopiedCoupon] = useState('');
    const couponCodes = [
        { code: 'CODE123', discount: '10%' },
        { code: 'SALE50', discount: '50%' },
        { code: 'SAVE25', discount: '25%' },
    ];

    const copyCouponCode = (code) => {
        setCopiedCoupon("")
        applyCoupan("")
        setAppliedCoupan("")
        setCoupanDiscount(0)
        setCopiedCoupon(code);
    };

    const applyCoupon = () => {
        console.log('Coupon code applied:', copiedCoupon);
        if (appliedCoupan) {
            setCopiedCoupon("")
            applyCoupan("")
            setAppliedCoupan("")
            setCoupanDiscount(0)
            //   setCoupanData(null)
        } else {
            applyCoupan(copiedCoupon, "coupan")
            setAppliedCoupan(copiedCoupon)
        }

    };
    if (!offersList || offersList.length === 0) {
        return null
    }
    return (
        <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%', backgroundColor: BackgroundGray, paddingVertical: 20 }}>

            {offersList?.map((coupon, index) => (
                <ImageBackground
                    source={require('../../assets/coupan-bg.png')}
                    resizeMode={'stretch'}
                    style={{
                        // flex: 1,
                        alignSelf: 'center',
                        resizeMode: 'center',
                        width: '98%',
                        marginLeft: '2%',
                        height: 90,
                        marginVertical: 5,
                        //marginHorizontal:10
                        // backgroundColor: 'red',
                        alignSelf: 'center',
                        //  alignItems:'center'
                    }}>
                    <View key={'' + index} style={styles.card}>
                        <View style={{
                            // alignItems: 'center',
                            justifyContent: 'space-evenly',
                            height: '100%',
                            paddingHorizontal: 15
                        }}>
                            <ImageBackground
                                resizeMode={'stretch'}
                                style={{ width: 100, height: 25, justifyContent: 'center' }}
                                //source={require('../../assets/couponb-bg-new.png')}
                                source={require('../../assets/coupon-bg-das.png')}
                            >
                                <Text style={styles.couponCode}>{coupon.coupon_code}</Text>

                            </ImageBackground>
                            <Text style={styles.discount}>Flat {coupon.discount}% OFF</Text>
                        </View>
                        {
                            applyCoupan ? <TouchableOpacity
                                style={{ marginRight: 15, paddingRight: 10 }}
                                onPress={
                                    () => {
                                        copyCouponCode(coupon.coupon_code)
                                        console.log("copiedCoupon  :  ", coupon.coupon_code)
                                    }}>
                                <Feather name="copy" size={30} color={allCategoryPink} />
                            </TouchableOpacity> :
                                <Text style={{
                                    marginRight: 10, color: allCategoryPink, fontFamily: 'Poppins-Regular', paddingHorizontal: 10
                                }}>COUPON APPLY ON CART</Text>
                        }
                    </View >
                </ImageBackground >

                // <View key={index} style={styles.couponContainer}>

                // </View>
            ))}


            {
                setCopiedCoupon && applyCoupan && <View style={styles.inputContainer}>
                    <TextInput
                        editable={false}
                        placeholderTextColor="#999"
                        style={styles.input}
                        placeholder="Enter Coupon code"
                        value={copiedCoupon}
                        onChangeText={setCopiedCoupon}
                    />
                    <TouchableOpacity style={styles.applyButton} onPress={applyCoupon}>
                        {console.log("insdie view  : ", appliedCoupan, "  applyCoupan :  ", applyCoupan)}
                        <Text style={styles.applyButtonText}>{appliedCoupan ? "REMOVE" : "APPLY"}</Text>
                    </TouchableOpacity>
                </View>
            }
        </View>

    );
};

const styles = StyleSheet.create({
    card: {
        // backgroundColor: '#FFFFFF',
        // borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 16,
        //  elevation: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        //alignSelf:'center'
    },
    container: {
        // flex: 1,
        resizeMode: 'cover',
        width: '97%',
        height: 100,
        //marginHorizontal:10
        //backgroundColor: '#fff',
        alignSelf: 'center'
    },
    couponContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 10,
    },
    couponContent: {
        alignItems: 'center',
    },
    couponCode: {
        fontSize: 16,
        fontWeight: 'bold',
        // borderColor: offPurpleColor,
        // borderWidth: 1,
        // borderRadius: 5,
        fontFamily: 'Poppins-Regular',
        color: offPurpleColor,
        alignSelf: 'center'
        // borderStyle: 'dashed',
        //minWidth: 100,
        //textAlign: 'center'
    },
    discount: {
        fontSize: 14,
        color: '#000',
        marginTop: 5,
        fontFamily: 'Poppins-SemiBold'

    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 10,
        alignSelf: 'center'
    },
    input: {
        flex: .7,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 20,
        height: 45,
        fontFamily: 'Poppins-Regular'
    },
    applyButton: {
        flex: .3,
        marginLeft: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 5,
    },
    applyButtonText: {
        color: allCategoryPink,
        fontSize: 13,
        fontFamily: 'Poppins-SemiBold',
    },
});

export default CouponList;
