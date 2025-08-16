import React, { useEffect, useState } from "react"
import { Dimensions, FlatList, Image, ImageBackground, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { allcategorylist, server } from "../common/apiConstant"
import { productBorderColor, textColor, whiteTxtColor } from "../common/colours"
import Header from "../components/Header"

function SubSubcategoriesScreen(props) {
    const { navigation, route } = props
    const { item } = route?.params


    const sendToNext = (item) => {
        // if (item.subcategory_details && item.subcategory_details.length > 0) {
        //     alert("Hello")
        //     navigation.navigate("SubCategories", { item })
        // } else {
        //     alert("bye")
        // }
        navigation.navigate("ProductListing", { item })
    }
    return (
        <View style={{ flex: 1, backgroundColor: whiteTxtColor }}>
            <Header
                navigation={navigation}
                name={item?.title}
            />
            <ScrollView style={{marginTop:10}}>
                <FlatList
                    style={{ width: '100%', }}
                    numColumns={3}
                    data={item?.subcategory_details}
                    renderItem={({ item, index }) =>
                        <TouchableOpacity
                            onPress={() => sendToNext(item)}
                            key={"product" + index}
                            style={{ width: Dimensions.get("window").width * .33, paddingHorizontal: 5 }}>
                            {/* <ImageBackground
                                style={{ width: '100%', height: Dimensions.get("window").width * .33, justifyContent: 'center' }}
                                source={{ uri: 'https://st2.depositphotos.com/1590879/9035/v/950/depositphotos_90359888-stock-illustration-red-christmas-border-background.jpg' }}
                            >

                                {item.image ? <Image
                                    style={{ width: (Dimensions.get("window").width * .3) - 15, height: (Dimensions.get("window").width * .3) - 15, resizeMode: 'center', alignSelf: 'center' }}
                                    source={{ uri: item.image }}
                                /> : null}
                            </ImageBackground> */}
                             <View
                                style={{ width: '100%', height: Dimensions.get("window").width * .33, justifyContent: 'center' }}
                                source={{ uri: 'https://st2.depositphotos.com/1590879/9035/v/950/depositphotos_90359888-stock-illustration-red-christmas-border-background.jpg' }}
                            >

                                {item.image ? <Image
                                    style={{ width: (Dimensions.get("window").width * .3) - 15, height: (Dimensions.get("window").width * .3) - 15, resizeMode: 'center', alignSelf: 'center' }}
                                    source={{ uri: item.image }}
                                /> : null}
                            </View>
                            <Text style={{ alignSelf: 'center', color: textColor, fontFamily: 'Poppins-Regular', textAlign: 'center' }}>{item.title}</Text>
                        </TouchableOpacity>}
                />
                {item && item?.app_promotion_banner ? <Image
                    source={{ uri: item?.app_promotion_banner }}
                    style={{ width: '100%', height: 200, resizeMode: 'center' }}
                /> : null}
            </ScrollView>

        </View>
    )
}

const SubSubcategories = SubSubcategoriesScreen;
export default SubSubcategories;