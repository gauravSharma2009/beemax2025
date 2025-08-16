import { ScrollView } from "native-base"
import React, { useEffect, useState } from "react"
import { Dimensions, FlatList, Image, ImageBackground, Text, TouchableOpacity, View } from "react-native"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { changeLoadingState } from "../actions/loadingAction"
import { allcategorylist, server } from "../common/apiConstant"
import { productBorderColor, textColor, whiteTxtColor } from "../common/colours"
import Header from "../components/Header"

function SubcategoriesScreen(props) {
    const { navigation, route, changeLoadingState } = props
    const { item } = route?.params
    const [categories, setCategories] = useState(null)

    useEffect(() => {
        console.log("item  :  ", item)
        getCategories()
    }, [])
    const getCategories = async () => {
        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=2d028ff23c06904a8a328459b2d4c6fe9f3f4ab9");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        changeLoadingState(true)
        console.log("`${server}${allcategorylist}`  :  ",`${server}${allcategorylist}`)
        fetch(`${server}${allcategorylist}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)
                console.log("subcategory result : ",JSON.stringify(result))
                //setCategories(result?.data)
                const found = result.data?.find(category => category.id === item.id)
                setCategories(found)
                console.log("found  : ", JSON.stringify(found))
            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)
            });
    }
    const sendToNext = (item) => {
        if (item.subcategory_details && item.subcategory_details.length > 0) {
            // alert("Hello")
            navigation.navigate("SubSubCategories", { item })
        } else {
            // alert("bye")
        }
        //item.subcategory_details && item.subcategory_details.length > 0 ? navigation.navigate("SubCategories", { item }) : navigation.navigate("ProductListing", { item })
    }
    return (
        <View style={{ flex: 1, backgroundColor: whiteTxtColor }}>
            <Header
                navigation={navigation}
                name={categories?.title}
            />
            <ScrollView style={{ marginTop: 10 }}>
                <FlatList
                    style={{ width: '100%', }}
                    numColumns={3}
                    data={categories?.category_details}
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
                {categories && categories?.app_promotion_banner ? <Image
                    source={{ uri: categories?.app_promotion_banner }}
                    style={{ width: '100%', height: 200, resizeMode: 'center' }}
                /> : null}
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
        ...bindActionCreators({ changeLoadingState }, dispatch),
    }

}

const Subcategories = connect(mapStateToProps, mapDispatchToProps)(SubcategoriesScreen);
export default Subcategories;

