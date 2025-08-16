import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Image, Dimensions } from 'react-native';
import AddButton from './AddButton';
import { mrpColor, productBorderColor, textColor, whiteTxtColor } from "../common/colours"
import { currency } from './strings';
import { storeData } from './asyncStore';

const ProductItem = (props) => {
    const { getProductList, changeLoadingState, item, index, navigation, setAction, products } = props
    const { inventory, in_stock } = item
    return (
        <View style={{ paddingTop: 15, paddingRight: 5, backgroundColor: 'white' }}>
            <TouchableOpacity
                onPress={() => {
                    storeData("clickedItem", JSON.stringify(item))
                    storeData("products", JSON.stringify(products))

                    navigation.push("ProductDetails", { product: item })
                }}
                key={"product" + index}
                style={{ borderColor: productBorderColor, borderRadius: 8, borderWidth: 2, width: Dimensions.get('window').width * .45, marginLeft: 10, paddingBottom: 10 }}>
                <Image
                    style={{ width: 100, height: 160, resizeMode: 'contain', alignSelf: 'center' }}
                    source={{ uri: item?.image_first }}
                />
                <Text
                    numberOfLines={2}
                    style={{ minHeight: 40, fontSize: 14, color: textColor, fontFamily: 'Poppins-SemiBold', marginTop: 5, marginLeft: 5 }}>{item.title}</Text>

                <View style={{ flexDirection: 'row', marginTop: 5, }}>
                    <Text
                        style={{
                            fontSize: 10, color: mrpColor, fontFamily: 'Poppins-Regular', marginLeft: 5, textDecorationLine: 'line-through',
                            textDecorationStyle: 'solid',
                        }}
                    >{currency} {item.mrp_price}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 2 }}>
                    <Text
                        style={{ fontSize: 14, color: textColor, fontFamily: 'Poppins-SemiBold', marginLeft: 5 }}
                    >{currency}</Text>
                    <Text
                        style={{ fontSize: 14, color: textColor, fontFamily: 'Poppins-SemiBold', marginLeft: 2 }}
                    >{item.selling_price}</Text>


                </View>
                <ImageBackground
                    style={{ width: 35, height: 35, position: 'absolute', right: 5, top: 5, alignItems: 'center', justifyContent: 'center' }}
                    source={require('../../assets/discount-bg.png')}
                >
                    <Text
                        style={{ alignSelf: 'center', textAlign: 'center', fontSize: 8, color: whiteTxtColor, fontFamily: 'Poppins-Regular', }}
                    >{item.discount_percentage + '%' + "\nOFF"}</Text>

                </ImageBackground>

                <View style={{ position: 'absolute', bottom: 5, right: !item.qty_added_in_cart || Number(item.qty_added_in_cart) === 0 ? -2 : 8, }}>

                    <AddButton
                        setAction={setAction}
                        callBack={getProductList}
                        changeLoadingState={changeLoadingState}
                        type={"plus"}
                        item={item}
                        index={index}
                    />
                </View>
            </TouchableOpacity>
            {in_stock === "0" || parseInt(inventory) < 1 &&
                <View

                    key={"blur" + index}
                    style={{
                        height: '100%',
                        //borderColor: productBorderColor, 
                        width: Dimensions.get('window').width * .45,
                        marginLeft: 10,
                        backgroundColor: '#ffffffaa',
                        borderColor: "transparent",
                        borderRadius: 8, borderWidth: 2,
                        //backgroundColor: 'red',
                        // paddingBottom: 10,
                        // /padd
                        marginTop: 15,
                        position: 'absolute',
                        justifyContent: 'center'
                    }}>
                    <View style={{ backgroundColor: textColor, borderRadius: 7, paddingHorizontal: 15, paddingVertical: 8 }}>
                        <Text style={{ color: '#ffffff', fontFamily: 'Poppins-Bold', fontSize: 12, alignSelf: 'center' }}>Out of Stock</Text>
                    </View>

                </View>
            }
        </View>
    );
};

export default ProductItem;
