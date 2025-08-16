
import React, { useState, useEffect, useRef } from "react"
import { Text, View, ScrollView, TouchableOpacity, Image, ImageBackground, Dimensions } from "react-native"
import { homePageUrl, server } from "../common/apiConstant";
import { allCategoryPink, BackgroundGray, buttonBgColor, categoryTextpurpleColor, mrpColor, offColor, productBorderColor, textColor, whiteTxtColor } from "../common/colours";
import { Rating, AirbnbRating } from 'react-native-ratings';
import { currency } from "../common/strings";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { changeLoadingState } from "../actions/loadingAction";
import FastImage from 'react-native-fast-image'
import PTRView from 'react-native-pull-to-refresh';

//import { PagerTabIndicator, IndicatorViewPager, PagerTitleIndicator, PagerDotIndicator } from 'rn-viewpager';
import { FlatList } from "react-native";
import { NativeScreenNavigationContainer } from "react-native-screens";
import { getData, storeData } from "../common/asyncStore";
import { StatusBar } from 'expo-status-bar';
import AddButton from "../common/AddButton";
import { changeCartCount } from "../actions/cartCount";
import SliderComponent from "../common/SliderComponent";
import { setPopup } from "../actions/message";
import CategoryHome from "../common/CategoryHome";

function HomeScreen(props) {
    const { navigation, changeLoadingState, pinCode, address, changeCartCount, setPopup } = props
    const [bannerData, setbannerData] = useState(null)
    const [bannerDataWidth, setbannerDataWidth] = useState(null)
    const [bannerDataHeight, setbannerDataHeight] = useState(null)
    const [topCategoryData, setTopCategoryData] = useState(null)
    const [homeCategoryProduct, setHomeCategoryProdycts] = useState([])
    const [homeCategoryPromotionHeight, setHomeCategoryPromotionHeight] = useState(null)
    const [bannerBottom, setBannerBottom] = useState(null)
    const [bannerBottomHeight, setBannerBottomHeight] = useState(null)
    const [topBannerHeight, setTopBannerHeight] = useState(null)
    const scrollRef = useRef(null);
    const [count, setCount] = useState(0)
    const [topBannerData, setTopBannerData] = useState(null)
    const [footerBannerData, setFooterBannerData] = useState(null)
    const [loadingData, setLoadingData] = useState(true)
    const [refreshCounter, setRefreshCounter] = useState(1)

    const AUTO_SCROLL_INTERVAL = 2000; // 5 seconds
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            //console.log("calling data  :  ")
            //setbannerDataWidth(null)
            // setbannerDataHeight(null)
            setLoadingData(true)
            setTopCategoryData(null)
            setHomeCategoryProdycts(null)
            //setHomeCategoryPromotionHeight(null)
            setBannerBottom(null)
            //setBannerBottomHeight(null)
            //setTopBannerHeight(null)
            setTopBannerData(null)
            setFooterBannerData(null)
            setCurrentPage(0)
            getHomePageData()
            storeData("clickedItem","")
        });

        return unsubscribe;
    }, [navigation, pinCode]);
    
    useEffect(() => {
        pinCode && getHomePageData()

        // console.log("pinCode  :  ", pinCode)
    }, [pinCode, refreshCounter])
    useEffect(() => {
        checkCartCount();
    }, [])
    const [currentPag, setCurrentPage] = useState(0)
    useEffect(() => {
        const interval = setInterval(() => {
            if (currentPag < bannerData?.length - 1) {
                setCurrentPage(currentPag + 1);
            } else {
                setCurrentPage(0);
            }
        }, 3000);

        return () => {
            clearInterval(interval);
        };
    }, [currentPag, bannerData?.length]);
    

    const checkCartCount = async () => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "ci_session=2bf9726eebea7926b7c73664c9a4797ab758ba13");
        const uniqueId = await getData("uniqueId")

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        const url = `${server}countcartdata/${uniqueId}`;
        fetch(url, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeCartCount(result.data)
                // console.log("check cart count response :  ", result)
            })
            .catch(error => {
                console.log('error', error)

            });
    }


    const getHomePageData = async () => {
        //console.log("calling data")
        const uniqueId = await getData("uniqueId")

        var myHeaders = new Headers();
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        changeLoadingState(true)
        setLoadingData(true)
        console.log(" Home page url  :", `${server}${homePageUrl}/${pinCode}/${uniqueId}`)
        fetch(`${server}${homePageUrl}/${pinCode}/${uniqueId}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                setLoadingData(false)
                changeLoadingState(false)
                if (result.status && result.data) {
                    if (result?.data?.aBannerData && result?.data?.aBannerData.length > 0) {
                        let w = 969; let h = 501
                        setbannerDataWidth(w * (170 / h))
                        setbannerDataHeight(h)
                        // Image.getSize(result?.data?.aBannerData[0].image_url, (Width, Height) => {
                        //     console.log(" Width, Height : 4 ", Width, Height)


                        // }, (errorMsg) => {
                        //     console.log(errorMsg);

                        // });
                    }

                    setbannerData(result?.data?.aBannerData)
                    setTopCategoryData([
                        // ...[{
                        //     "id": "-1",
                        //     "title": "All categories",
                        //     "urlKey": "all_categories",
                        //     "image": "1644410214_beauty.jpg",
                        //     "image_url": "https:\/\/www.mystagingserver.co.in\/projects\/responsive-ecomm\/media\/uploads\/category\/thumbs\/1644410214_beauty.jpg"
                        // }],
                        ...result?.data?.aTopCategoryData])
                    if (result?.data?.aHomeCategoryProductsDetails && result?.data?.aHomeCategoryProductsDetails.length > 0) {
                        // result?.data?.aHomeCategoryProductsDetails[0].app_promotion_banner
                        let w = 1028; let h = 268

                        setHomeCategoryPromotionHeight(((Dimensions.get('window').width * .95) / w) * h)

                        // Image.getSize(result?.data?.aHomeCategoryProductsDetails[0].app_promotion_banner, (Width, Height) => {

                        //     console.log(" Width, Height : 1 ", Width, Height)
                        //     setHomeCategoryPromotionHeight(((Dimensions.get('window').width * .95) / Width) * Height)
                        // }, (errorMsg) => {
                        //     console.log(errorMsg);

                        // });
                    }
                    //console.log("setting data : ", result?.data?.aHomeCategoryProductsDetails)
                    setHomeCategoryProdycts(result?.data?.aHomeCategoryProductsDetails)

                    if (result?.data?.aBannerBottomImageDetails && result?.data?.aBannerBottomImageDetails.length > 0) {
                        let w = 954; let h = 270

                        setBannerBottomHeight(((Dimensions.get('window').width * .95) / w) * h)

                        // Image.getSize(result?.data?.aBannerBottomImageDetails[0].image_url, (Width, Height) => {
                        //     console.log(" Width, Height : 2 ", Width, Height)

                        //     setBannerBottomHeight(((Dimensions.get('window').width * .95) / Width) * Height)
                        // }, (errorMsg) => {
                        //     console.log(errorMsg);

                        // });
                    }
                    if (result?.data?.aTopBannerData && result?.data?.aTopBannerData) {
                        let w = 1170; let h = 194

                        setTopBannerHeight(((Dimensions.get('window').width) / w) * h)

                        // Image.getSize(result?.data?.aTopBannerData.image_url, (Width, Height) => {
                        //     console.log(" Width, Height : 3 ", Width, Height)

                        //     setTopBannerHeight(((Dimensions.get('window').width) / Width) * Height)
                        // }, (errorMsg) => {
                        //     console.log(errorMsg);

                        // });
                    }
                    setBannerBottom(result?.data?.aBannerBottomImageDetails)
                    setTopBannerData(result?.data?.aTopBannerData);
                    setFooterBannerData(result?.data?.aFooterBannerList);

                }
            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)
                setLoadingData(false)

            });
    }

    const getCartCount = async (id) => {

        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=874a68062a45ca215dc1e254f1c624dd3d92053c");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        fetch(`${server}countcartdata/${id}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                if (result && result.status) {
                    setCount(result.data)
                }
            })
            .catch(error => console.log('error', error));
    }
    const addToCart = async (product) => {
        // console.log("  product:  ", product)
        // return;
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "ci_session=2bf9726eebea7926b7c73664c9a4797ab758ba13");
        const loginData = await getData("loginData")
        const userData = JSON.parse(loginData)
        const uniqueId = await getData("uniqueId")

        var raw = JSON.stringify({
            "seller_id": product.seller_id,
            "user_id": userData?.USER_ID,
            "product_id": product.id,
            "device_id": uniqueId,
            "qty": "1"
        });
        //return;

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        changeLoadingState(true)
        fetch(`${server}addtocart`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)

                if (result && result.status) {
                    getCartCount(uniqueId)
                } else
                    setPopup({ message: result.message, status: "faliure", open: true })

            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)

            });
    }
    const navigateToCategories = (item) => {
        navigation.navigate("ProductListing", { item })

        // if (item.id === '-1') {
        //     navigation.navigate("CategoriesStack")
        // } else {
        //     navigation.navigate("SubCategories", { item })
        // }
    }
    const getFirstFourElements = (item) => {
        return item.product_details;
        if (item && item.product_details && Array.isArray(item.product_details)) {
            if (item.product_details.length > 4) {
                return item.product_details.slice(0, 4);
            } else {
                return item.product_details;
            }
        } else {
            return []; // Return an empty array if the input structure is not as expected
        }
    }
    const _renderDotIndicator = () => {
        return <PagerDotIndicator
            selectedDotStyle={{ backgroundColor: buttonBgColor }}
            pageCount={bannerData?.length} />;
    }
    return (
        <View
            style={{ flex: 1, backgroundColor: whiteTxtColor }}
        >
            {/* {console.log("rendring")}
            <StatusBar style="light"
                backgroundColor="#3b006a"
            /> */}

            <View style={{ flex: .06, width: "100%", backgroundColor: '#3b006a', justifyContent: 'space-between', flexDirection: 'row', paddingVertical: 15 }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("PincodePage")}
                    style={{ flexDirection: 'row', alignSelf: 'center', flex: .25, justifyContent: 'center', height: '100%', }}
                >
                    <Text

                        numberOfLines={1}
                        style={{ alignSelf: 'center', color: 'white', marginLeft: 10, flex: .8, fontSize: 15 }}>{address}</Text>
                    {/* <Text style={{ marginTop: 5, flex: .2, alignSelf: 'center', color: 'white', fontSize: 18, transform: [{ rotate: '90deg' }] }}>{">"}</Text> */}
                    <Image
                        onPress={() => navigation.navigate("PincodePage")}
                        style={{ width: 15, height: 15, flex: .2, alignSelf: 'center' }}
                        source={require('../../assets/down-arrow.png')}
                    />
                </TouchableOpacity>
                <View style={{ flex: .6, justifyContent: 'center' }}>
                    <Image
                        style={{ alignSelf: 'center', width: 138, height: 30 }}
                        source={require('../../assets/logo.png')}
                    />
                </View>

                <View style={{ flexDirection: 'row', alignSelf: 'center', flex: .2, justifyContent: 'flex-end' }}>

                    <TouchableOpacity
                        style={{ alignItems: 'center' }}
                        onPress={() => navigation.navigate("ProductSearchPage")}
                    >
                        <Image
                            style={{ width: 20, height: 20, alignSelf: 'center', marginRight: 5 }}
                            source={require('../../assets/search-white.png')}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ alignItems: 'center' }}
                        onPress={() => navigation.navigate("UserScreen")}
                    >
                        <Image
                            style={{ width: 20, height: 20, alignSelf: 'center', marginHorizontal: 10 }}
                            source={require('../../assets/user.png')}
                        />
                    </TouchableOpacity>

                </View>
            </View>
            <PTRView
                style={{ flex: .94, }}
                onRefresh={() => {
                    // setRefreshCounter(refreshCounter + 1)
                    //alert("Hello")
                    setbannerData(null)
                    setLoadingData(true)
                    setTopCategoryData(null)
                    setHomeCategoryProdycts(null)
                    setTopBannerData(null)
                    //setHomeCategoryPromotionHeight(null)
                    setBannerBottom(null)
                    //setBannerBottomHeight(null)
                    //setTopBannerHeight(null)
                    setFooterBannerData(null)
                    setCurrentPage(0)
                    getHomePageData()
                    storeData("clickedItem","")
                }}
            >

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps={"always"}
                    style={{ height: '100%', backgroundColor: whiteTxtColor }}>
                    {/* <TextInput
                placeholder="Search by Keyword"
                style={{ borderWidth: 1, borderColor: textColor, paddingVertical: 10, marginHorizontal: 10, borderRadius: 5, paddingHorizontal: 10, color: textColor, marginTop: 15 }} />
             */}
                    {topBannerData && <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => {
                            e.preventDefault()
                            topBannerData.redirection_type === 'category' ? navigation.navigate("ProductListing", { item: topBannerData, from: 'banner' }) : topBannerData.redirection_type === 'page' ?
                                navigation.navigate("CmsPage", { item: topBannerData, from: 'banner' })
                                : navigation.navigate("ProductDetails", { product: topBannerData, from: 'banner' })

                        }}
                        style={{ width: '100%', height: topBannerHeight, marginBottom: 7 }}>
                        <Image
                            source={{ uri: topBannerData.image_url }}
                            style={{ width: '100%', height: '100%', resizeMode: "center" }}
                        />
                    </TouchableOpacity>}
                    {/* {bannerData && bannerData && bannerData.length > 0 && < ScrollView
                    style={{ marginTop: 10, marginBottom: 10 }}
                    horizontal={true}
                    ref={scrollRef}

                    showsHorizontalScrollIndicator={false}
                >
                    {bannerData.map((item, index) => */}
                    <SliderComponent
                        navigation={navigation}
                        bannerData={bannerData}
                    />
                    {/* {bannerData && bannerData.length > 0 && <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                        console.log("item  :  ", bannerData[currentPag])
                        // item.redirection_type === 'category' ? navigation.navigate("ProductListing", { item, from: 'banner' }) : navigation.navigate("ProductDetails", { product: item, from: 'banner' })
                        bannerData[currentPag].redirection_type === 'category' ? navigation.navigate("ProductListing", { item: bannerData[currentPag], from: 'banner' }) : navigation.navigate("ProductDetails", { product: bannerData[currentPag], from: 'banner' })

                    }}
                    key={''}
                    style={{
                        marginLeft: 0,
                        padding:5,
                        //width: bannerDataWidth ,
                        width: Dimensions.get('window').width
                    }}>
                    <Image
                        style={{ borderRadius: 10, width: "100%", height: 180, resizeMode: 'stretch', }}
                        source={{ uri: bannerData[currentPag].image_url }}
                    />
                </TouchableOpacity>} */}
                    {/* )}
                </ScrollView>} */}
                    {/* <ScrollView
                style={{ marginTop: 15 }}
                showsHorizontalScrollIndicator={false}
                horizontal={true}>

                {topCategoryData && topCategoryData.length > 0 && topCategoryData.map((item, index) => <TouchableOpacity
                    onPress={() => navigateToCategories(item)}
                    key={"top" + index}
                    style={{ justifyContent: 'center', alignItems: 'center', width: 120 }}
                >
                    {item.id === '-1' ? <Image
                        style={{ width: 80, height: 80, borderRadius: 40 }}
                        source={require('../../assets/icons/category-top.png')}
                    /> : <Image
                        style={{ width: 80, height: 80, borderRadius: 40 }}
                        source={{ uri: item.image_url }}
                    />}

                    <Text style={{ fontSize: 12, color: textColor, fontFamily: 'Poppins-Regular', marginTop: 5 }}>{item.title}</Text>
                </TouchableOpacity>)}
            </ScrollView> */}
                    {/* <FlatList
                    data={topCategoryData}
                    renderItem={({ item }, index) => <TouchableOpacity
                        onPress={() => navigateToCategories(item)}
                        key={"top" + index}
                        style={{ justifyContent: 'space-between', alignItems: 'center', width: Dimensions.get('window').width * .25, padding: 5 }}
                    >
                        <Image
                            style={{
                                marginTop: 5, width: Dimensions.get('window').width * .25 - 10
                                , height: Dimensions.get('window').width * .33 - 10,
                            }}
                            source={{ uri: item.image_url }}
                        />

                    </TouchableOpacity>}
                    keyExtractor={item => item.id}
                    numColumns={4}
                /> */}
                    <CategoryHome
                        topCategoryData={topCategoryData}
                        navigateToCategories={navigateToCategories}
                    />
                    {/* {bannerData && bannerData.length > 0 && <IndicatorViewPager
                style={{ height: 200, width: "80%", marginVertical: 20,marginHorizontal:20 }}
                indicator={_renderDotIndicator()}
            >
                {bannerData && bannerData.length > 0 && bannerData.map((item, index) =>
                    <View
                        key={'' + index}
                        style={{ backgroundColor: 'white',marginLeft:10 }}>
                        <Image
                            style={{ borderRadius: 20, width: "100%", height: 220, resizeMode: 'cover' }}
                            source={{ uri: item.image_url }}
                        />
                    </View>
                )}

            </IndicatorViewPager>} */}
                    {bannerBottom && bannerBottom.length > 0 && <TouchableOpacity
                        onPress={() => {
                            console.log("bannerBottom", bannerBottom)
                            bannerBottom[0].redirection_type === 'category' ? navigation.navigate("ProductListing", { item: bannerBottom[0], from: 'banner' }) :
                                navigation.navigate("ProductDetails", { product: bannerBottom[0], from: 'banner' })

                        }}
                    ><Image

                            style={{ width: Dimensions.get("window").width * .95, height: bannerBottomHeight, marginTop: 20, alignSelf: 'center' }}
                            source={{ uri: bannerBottom[0]?.image_url }}
                        /></TouchableOpacity>}
                    {/* {console.log("homeCategoryProduct . :  ", homeCategoryProduct)} */}
                    <View >
                        {homeCategoryProduct && homeCategoryProduct.length > 0 && homeCategoryProduct.map((item, index) => {
                            return <View key={"homeCategories" + index}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingHorizontal: 10 }}>
                                    <Text style={{ fontFamily: "Poppins-SemiBold", color: 'black', alignSelf: 'center', fontSize: 17 }}>{item.title}</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            navigation.navigate("ProductListing", { item })
                                            // navigation.navigate("SubCategories", { item })
                                        }
                                        }
                                        style={{ padding: 10, borderRadius: 5 }}><Text style={{ color: allCategoryPink, fontFamily: 'Poppins-Regular' }}>See All ></Text></TouchableOpacity>
                                </View>


                                {item && item.product_details && item.product_details.length > 0 && < ScrollView
                                    style={{ marginTop: 0, paddingTop: 0 }}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                >
                                    {getFirstFourElements(item).map((product, index) =>
                                        <View key={'product_details' + index} style={{ paddingTop: 15, paddingRight: 5 }}>
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate("ProductDetails", { product })}
                                                key={"product" + index}
                                                style={{ borderColor: productBorderColor, borderRadius: 8, borderWidth: 2, width: 154, marginLeft: 10, paddingBottom: 10 }}>
                                                <Image
                                                    style={{ width: 100, height: 160, resizeMode: 'contain', alignSelf: 'center' }}
                                                    source={{ uri: product.image_first }}
                                                />
                                                {/* <FastImage
                                                style={{ width: 100, height: 160 }}
                                                source={{
                                                    uri: product.image_first,
                                                    // headers: { Authorization: 'someAuthToken' },
                                                    priority: FastImage.priority.normal,
                                                }}
                                                resizeMode={FastImage.resizeMode.contain}
                                            /> */}
                                                <Text
                                                    numberOfLines={2}
                                                    style={{ minHeight: 40, fontSize: 14, color: textColor, fontFamily: 'Poppins-SemiBold', marginTop: 10, marginLeft: 5 }}>{product.title}</Text>

                                                <View style={{ flexDirection: 'row', marginTop: 5, }}>

                                                    <Text
                                                        style={{
                                                            fontSize: 10, color: mrpColor, fontFamily: 'Poppins-Regular', marginLeft: 5, textDecorationLine: 'line-through',
                                                            textDecorationStyle: 'solid'
                                                        }}
                                                    >{currency} {product.mrp_price}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', marginTop: 2 }}>
                                                    <Text
                                                        style={{ fontSize: 14, color: textColor, fontFamily: 'Poppins-SemiBold', marginLeft: 5 }}
                                                    >{currency}</Text>
                                                    <Text
                                                        style={{ fontSize: 14, color: textColor, fontFamily: 'Poppins-SemiBold', marginLeft: 2 }}
                                                    >{product.selling_price}</Text>


                                                </View>
                                                <ImageBackground
                                                    style={{ width: 35, height: 35, position: 'absolute', right: -10, top: -10, alignItems: 'center', justifyContent: 'center' }}
                                                    source={require('../../assets/discount-bg.png')}
                                                >
                                                    <Text
                                                        style={{ alignSelf: 'center', textAlign: 'center', fontSize: 8, color: whiteTxtColor, fontFamily: 'Poppins-Regular', }}
                                                    >{product.discount_percentage + '%' + "\nOFF"}</Text>

                                                </ImageBackground>

                                                <View style={{ position: 'absolute', bottom: 5, right: !product.qty_added_in_cart || Number(product.qty_added_in_cart) === 0 ? -2 : 8, }}>
                                                    <AddButton
                                                        callBack={getHomePageData}
                                                        changeLoadingState={changeLoadingState}
                                                        type={"plus"}
                                                        item={product}
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                        </View>)}
                                </ScrollView>}
                                <View style={{ backgroundColor: BackgroundGray, paddingVertical: 10, marginTop: 10 }}>
                                    <Text style={{ fontSize: 14, padding: 10, fontFamily: 'Poppins-SemiBold' }}>{item.app_promotion_banner_title}</Text>
                                    <TouchableOpacity
                                        onPress={() => item.app_promotion_banner_link_type === 'category' ? navigation.navigate("ProductListing", {
                                            from: "banner", item: {
                                                ...item, redirection_id: item.app_promotion_banner_link_id, title: item.app_promotion_banner_label
                                            }
                                        })

                                            : navigation.navigate("ProductDetails", { product: { ...item, redirection_id: item.app_promotion_banner_link_id }, from: 'banner' })}
                                    >
                                        {/* {{ from: "banner", item: { ...item, redirection_id: item.app_promotion_banner_link_id,title:item.app_promotion_banner_label} */}
                                        <Image

                                            style={{ width: '95%', height: homeCategoryPromotionHeight, alignSelf: 'center' }}
                                            source={{ uri: item.app_promotion_banner }}
                                        />
                                    </TouchableOpacity>

                                </View>
                            </View>
                        })}

                        {(!homeCategoryProduct || !Array.isArray(homeCategoryProduct) || homeCategoryProduct.length === 0) ?
                            <View style={{ paddingTop: 20, width: '100%', justifyContent: 'center' }}>
                                {!loadingData ? <Text style={{ alignSelf: 'center', fontSize: 15, fontFamily: 'Poppins-SemiBold', textAlign: 'center' }}>{address?.trim()}</Text> : null}
                                {!loadingData ? <Text style={{ alignSelf: 'center', fontSize: 15, fontFamily: 'Poppins-SemiBold', textAlign: 'center' }}>We are coming soon.</Text> : null}
                            </View> : null
                        }

                    </View>
                    {footerBannerData && footerBannerData.banners &&
                        <Text style={{ fontFamily: "Poppins-SemiBold", color: 'black', alignSelf: 'flex-start', paddingHorizontal: 15, fontSize: 17, marginTop: 15, marginBottom: 10 }}>{footerBannerData.heading}</Text>

                    }
                    {footerBannerData && footerBannerData.banners && footerBannerData.banners.length > 0 && < ScrollView
                        style={{ marginTop: 5, marginBottom: 10 }}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    >
                        {footerBannerData.banners.map((product, index) => <TouchableOpacity
                            onPress={() => {
                                //console.log("product  :  ", product);
                                product.redirection_type === 'category' ? navigation.navigate("ProductListing", { item: product, from: 'banner' }) : navigation.navigate("ProductDetails", { product, from: 'banner' })
                            }}
                            key={"product1" + index}
                            style={{ borderRadius: 10, borderColor: productBorderColor, borderWidth: 2, width: 154, marginLeft: 10 }}>
                            <Image
                                style={{ width: 150, height: 200, resizeMode: 'cover', borderRadius: 10 }}
                                source={{ uri: product.image_url }}
                            />
                        </TouchableOpacity>)}
                    </ScrollView>}
                </ScrollView >
            </PTRView>

        </View >

    )
}



const mapStateToProps = (state) => {
    // console.log("redux state : ", state.pinCode)
    return {
        isLoading: state.loader.isLoading,
        pinCode: state.pinCode.pincode,
        address: state?.pinCode?.address || "Location"

        //isLoading: true

    }
};
const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        ...bindActionCreators({ changeLoadingState, changeCartCount, setPopup }, dispatch),
    }

}

const Home = connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
export default Home;