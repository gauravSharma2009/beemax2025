import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeCartCount } from '../actions/cartCount';
import { server } from './apiConstant';
import { getData, storeData } from './asyncStore';
import { allCategoryPink, whiteTxtColor } from './colours';
import { currency } from './strings';

const CartDetailsCard = (props) => {
    const { cartCount = 0, changeCart = 0, navigation } = props
    const [cartData, setCartData] = useState([])
    const [subTotal, setSubTotal] = useState([])
    console.log()
    useEffect(() => {
        getCartData();
    }, [cartCount])
    useEffect(() => {
        let amount = 0;
        if (cartData) {
            for (let i = 0; i < cartData.length; i++) {
                amount = amount + (Number(cartData[i].subtotal))
            }
        }
        setSubTotal(amount)
    }, [cartData])

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

        console.log("Address URL : ", url)

        fetch(url, requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log("result.data  :  ", result.data)
                if (result && result.data && result.data.aCartItemDetails) {
                    setCartData(result.data.aCartItemDetails)
                } else {
                    setCartData([])
                }
                console.log(JSON.stringify(result))
            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)
            });
    }
    return (
        <View style={{ marginBottom:10,paddingHorizontal: 15, borderRadius: 10, alignSelf: 'center', width: '90%', height: 50, backgroundColor: allCategoryPink, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 17, alignSelf: 'center', color: whiteTxtColor, fontFamily: 'Poppins-SemiBold' }}>{cartCount} items {"|"} {currency} {subTotal}</Text>
            <TouchableOpacity
                onPress={() => {
                    storeData("clickedItem","")
                    navigation.navigate("Cart")}}
                style={{ flexDirection: "row", alignSelf: 'flex-end', alignSelf: 'center' }}>
                <Image
                    style={{
                        width: 20, height: 20, tintColor: whiteTxtColor, marginRight: 5
                    }}
                    source={require('../../assets/cart-icon-blue.png')}
                />
                <Text
                    style={{ fontSize: 17, fontFamily: 'Poppins-Regular', color: whiteTxtColor, alignSelf: 'flex-end', fontFamily: 'Poppins-SemiBold' }}>{"View Cart"}</Text>
                {/* <Text
                    style={{ fontFamily: 'Poppins-Medium', color: textColor, alignSelf: 'flex-end' }}>{item.subtotal}</Text> */}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: allCategoryPink,
        borderRadius: 8,
        paddingHorizontal: 10,
        // paddingVertical: 8,
        width: 80,
        height: 37,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginRight: 10
    },
    addButton: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: 'Poppins-Regular'

    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    minusButton: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 8,
        fontFamily: 'Poppins-Regular'

    },
    plusButton: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginLeft: 8,
        fontFamily: 'Poppins-Regular'

    },
    quantityText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Poppins-Regular'

    },
    quantity: {
        fontSize: 16,
        color: '#fff',
        fontFamily: 'Poppins-Regular'
    },
});

const mapStateToProps = (state) => {
    return {
        cartCount: state.cartCount.count
    }
};
const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        ...bindActionCreators({ changeCartCount }, dispatch),
    }

}

const CartDetails = connect(mapStateToProps, mapDispatchToProps)(CartDetailsCard);

export default CartDetails;
