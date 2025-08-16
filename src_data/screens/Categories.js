import React, { useState, useEffect } from "react"
import { Dimensions, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { changeLoadingState } from "../actions/loadingAction"
import { allcategorylist, server, productlistbycategoryid } from "../common/apiConstant"
import { BackgroundGray, buttonBgColor, categoryBackground, categorySaperator, subCategoriesname, textColor, whiteTxtColor } from "../common/colours"

function CategoriesScreen(props) {
    const { changeLoadingState } = props
    const [categories, setCategories] = useState(null)
    const [allCategories, setAllCategories] = useState(null)
    const [dataToDisplay, setDataToDisplay] = useState([])

    const [selectedIndex, setSelectedIndex] = useState(0)
     
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getCategories()
            setSelectedIndex(0)
        });

        return unsubscribe;
    }, [navigation]);

    // useEffect(() => {
    //     console.log("dataToDisplay  :  ", JSON.stringify(dataToDisplay))
    // }, [dataToDisplay])

    useEffect(() => {
        if (categories && categories.length > 0 && !categories[selectedIndex]?.category_details) {
            //alert(" not available");
            console.log(" categories[selectedIndex]  : ", categories[selectedIndex])
            navigation.navigate("ProductListing", { item: categories[selectedIndex] })
        }
        categories && categories.length > 0 && setDataToDisplay(categories[selectedIndex]?.category_details)
    }, [selectedIndex, categories])

    const getCategories = async () => {
        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=2d028ff23c06904a8a328459b2d4c6fe9f3f4ab9");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        changeLoadingState(true)
        console.log("`${server}${allcategorylist}`  :  ", `${server}${allcategorylist}`)
        fetch(`${server}${allcategorylist}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)

                console.log(result)
                setCategories(result?.data)
            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)

            });
    }
    const { navigation } = props
    return (
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: whiteTxtColor }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ width: '25%', height: '100%', }}>
                {categories && categories.length > 0 && categories.map((item, index) => <TouchableOpacity
                    onPress={() => setSelectedIndex(index)}
                    key={"main" + index}
                    style={{
                        justifyContent: 'center', width: '100%', height: Dimensions.get("window").width * .25, backgroundColor: selectedIndex === index ? categoryBackground : whiteTxtColor,
                        borderBottomWidth: 2, borderBottomColor: categorySaperator
                    }}>
                    <Text style={{ alignSelf: 'center', textAlign: 'center', fontFamily: 'Poppins-Regular', color: textColor }}>{item.title}</Text>
                    {/* <View style={{ width: '100%', height: 2, backgroundColor: categorySaperator, alignSelf: 'flex-end' }} /> */}
                </TouchableOpacity>)}
            </ScrollView>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ width: '75%', height: '100%', }}>
                {categories && categories.length > 0 && categories[selectedIndex]?.category_details && categories[selectedIndex]?.category_details.length > 0 && categories[selectedIndex]?.category_details.map((category, index) =>
                    <View key={"category1" + index}>
                        <Text style={{ fontFamily: 'Poppins-SemiBold', color: textColor, marginTop: 5, marginLeft: 10, marginBottom: 10 }}>{category.title}</Text>
                        <FlatList

                            numColumns={3}
                            data={category?.subcategory_details} renderItem={({ item, index }) =>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate("ProductListing", { item })} style={{
                                        width: Dimensions.get("window").width * .25, height: Dimensions.get("window").width * .25,
                                        justifyContent: 'center', marginTop: index > 2 ? 10 : 0
                                    }}>
                                    <Image
                                        style={{ width: 70, height: 90, alignSelf: 'center' }}
                                        source={{ uri: item.image }} />
                                    {/* <Text
                                        numberOfLines={1}
                                        style={{ fontSize: 12, color: subCategoriesname, fontFamily: 'Poppins-Regular', marginTop: 5, alignSelf: 'center', textAlign: 'center' }}>{item.title}</Text> */}

                                </TouchableOpacity>}
                        />

                    </View>)}

            </ScrollView>
        </View>
    )
}


const mapStateToProps = (state) => {
    // console.log("redux state : ", state)
    return {
        pinCode: state.pinCode.pincode

    }
};
const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        ...bindActionCreators({ changeLoadingState }, dispatch),
    }

}

const Categories = connect(mapStateToProps, mapDispatchToProps)(CategoriesScreen);
export default Categories;