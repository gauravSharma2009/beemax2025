
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
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
import OrderStatusBottomSheet from "../components/OrderStatusBottomSheet";
import GroceryHomeScreen from "../components/GroceryHomeScreen";

function HomeScreen(props) {
    const { navigation, changeLoadingState, pinCode, address, changeCartCount, setPopup } = props
    const [bannerData, setbannerData] = useState(null)
    const [bannerDataWidth, setbannerDataWidth] = useState(null)
    const [bannerDataHeight, setbannerDataHeight] = useState(null)
    const [topCategoryData, setTopCategoryData] = useState(null)
    const [homeCategoryProduct, setHomeCategoryProdycts] = useState([])
    const [aTSNData, setAstnData] = useState([])


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
    const [showOrderStatus, setShowOrderStatus] = useState(false)



    const AUTO_SCROLL_INTERVAL = 2000; // 5 seconds
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            //console.log("calling data  :  ")
            //setbannerDataWidth(null)
            // setbannerDataHeight(null)
            setLoadingData(true)
            setTopCategoryData(null)
            setHomeCategoryProdycts(null)
            setAstnData(null)
            //setHomeCategoryPromotionHeight(null)
            setBannerBottom(null)
            //setBannerBottomHeight(null)
            //setTopBannerHeight(null)
            setTopBannerData(null)
            setFooterBannerData(null)
            setCurrentPage(0)
            getHomePageData()
            storeData("clickedItem", "")
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


    const checkCartCount = useCallback(async () => {
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
    }, [changeCartCount])


    const getHomePageData = useCallback(async () => {
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
                    console.log("setting data : ", [result?.data?.aTSNData])
                    setHomeCategoryProdycts(result?.data?.aHomeCategoryProductsDetails)
                    setAstnData([{ heading: "Try Something New", aTSNData: [result?.data?.aTSNData] }])
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
    }, [pinCode, changeLoadingState])

    const getCartCount = useCallback(async (id) => {

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
    }, [])
    const addToCart = useCallback(async (product) => {
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
    }, [changeLoadingState, getCartCount, setPopup])
    const navigateToCategories = useCallback((item) => {
        navigation.navigate("ProductListing", { item })

        // if (item.id === '-1') {
        //     navigation.navigate("CategoriesStack")
        // } else {
        //     navigation.navigate("SubCategories", { item })
        // }
    }, [navigation])

    const getFirstFourElements = useCallback((item) => {
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
    }, [])
    const _renderDotIndicator = useCallback(() => {
        return <PagerDotIndicator
            selectedDotStyle={{ backgroundColor: buttonBgColor }}
            pageCount={bannerData?.length} />;
    }, [bannerData?.length])

    // Memoize expensive calculations
    const windowWidth = useMemo(() => Dimensions.get('window').width, [])

    const bannerDimensions = useMemo(() => {
        if (!bannerData?.length) return null
        const w = 969; const h = 501
        return {
            width: w * (170 / h),
            height: h
        }
    }, [bannerData?.length])

    const promotionHeight = useMemo(() => {
        const w = 1028; const h = 268
        return ((windowWidth * .95) / w) * h
    }, [windowWidth])

    const bottomBannerHeight = useMemo(() => {
        const w = 954; const h = 270
        return ((windowWidth * .95) / w) * h
    }, [windowWidth])

    const topBannerCalculatedHeight = useMemo(() => {
        const w = 1170; const h = 194
        return (windowWidth / w) * h
    }, [windowWidth])

    // Memoized Product Item Component
    const ProductItem = useMemo(() => {
        return React.memo(({ product, index, onPress, onAddToCart }) => (
            <View key={'product_details' + index} style={{ paddingTop: 15, paddingRight: 5 }}>
                <TouchableOpacity
                    onPress={() => onPress(product)}
                    style={{ borderColor: productBorderColor, borderRadius: 8, borderWidth: 2, width: 154, marginLeft: 10, paddingBottom: 10 }}>
                    <Image
                        style={{ width: 100, height: 160, resizeMode: 'contain', alignSelf: 'center' }}
                        source={{ uri: product.image_first }}
                    />

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
            </View>
        ))
    }, [])

    // Memoized navigation handlers
    const handleProductPress = useCallback((product) => {
        navigation.navigate("ProductDetails", { product })
    }, [navigation])

    const handleBannerPress = useCallback((bannerItem, type) => {
        if (type === 'category') {
            navigation.navigate("ProductListing", { item: bannerItem, from: 'banner' })
        } else if (type === 'page') {
            navigation.navigate("CmsPage", { item: bannerItem, from: 'banner' })
        } else {
            navigation.navigate("ProductDetails", { product: bannerItem, from: 'banner' })
        }
    }, [navigation])

    const handleRefresh = useCallback(() => {
        setbannerData(null)
        setLoadingData(true)
        setTopCategoryData(null)
        setHomeCategoryProdycts(null)
        setTopBannerData(null)
        setBannerBottom(null)
        setFooterBannerData(null)
        setCurrentPage(0)
        getHomePageData()
        storeData("clickedItem", "")
    }, [getHomePageData])

    // Memoized navigation handlers for header
    const handlePincodePress = useCallback(() => navigation.navigate("PincodePage"), [navigation])
    const handleSearchPress = useCallback(() => navigation.navigate("ProductSearchPage"), [navigation])
    const handleUserPress = useCallback(() => navigation.navigate("UserScreen"), [navigation])

    // console.log("aTSNData  :  ", aTSNData)
    return (
        <View
            style={{ flex: 1, backgroundColor: whiteTxtColor }}
        >
            {/* {console.log("rendring")}
            <StatusBar style="light"
                backgroundColor="#3b006a"
            /> */}
            {/* <GroceryHomeScreen /> */}
            <View style={{ flex: .06, width: "100%", backgroundColor: '#3b006a', justifyContent: 'space-between', flexDirection: 'row', paddingVertical: 15 }}>
                <TouchableOpacity
                    onPress={handlePincodePress}
                    style={{ flexDirection: 'row', alignSelf: 'center', flex: .25, justifyContent: 'center', height: '100%', }}
                >
                    <Text
                        numberOfLines={1}
                        style={{ alignSelf: 'center', color: 'white', marginLeft: 10, flex: .8, fontSize: 15 }}>{address}</Text>
                    <Image
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
                        onPress={handleSearchPress}
                    >
                        <Image
                            style={{ width: 20, height: 20, alignSelf: 'center', marginRight: 5 }}
                            source={require('../../assets/search-white.png')}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ alignItems: 'center' }}
                        onPress={handleUserPress}
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
                onRefresh={handleRefresh}
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
                        onPress={() => handleBannerPress(topBannerData, topBannerData.redirection_type)}
                        style={{ width: '100%', height: topBannerCalculatedHeight, marginBottom: 7 }}>
                        <Image
                            source={{ uri: topBannerData.image_url }}
                            style={{ width: '100%', height: '100%', resizeMode: "center" }}
                        />
                    </TouchableOpacity>}

                    <SliderComponent
                        navigation={navigation}
                        bannerData={bannerData}
                    />

                    <View style={{ marginTop: 10, marginBottom: 10 }}>
                        {aTSNData && aTSNData?.length > 0 && aTSNData?.map((item, index) => {
                            return <View key={"homeCategories" + index}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingHorizontal: 10 }}>
                                    <Text style={{ fontFamily: "Poppins-SemiBold", color: 'black', alignSelf: 'center', fontSize: 17 }}>{item?.heading}</Text>

                                </View>
                                {item && item?.aTSNData && Array.isArray(item?.aTSNData) && item?.aTSNData.length > 0
                                    && item?.aTSNData[0] && item?.aTSNData[0].products && Array.isArray(item.aTSNData[0]?.products) && item?.aTSNData[0].products?.length > 0 && < ScrollView
                                        style={{ marginTop: 0, paddingTop: 0 }}
                                        horizontal={true}
                                        showsHorizontalScrollIndicator={false}
                                    >
                                        {console.log("Inside the loop", item?.aTSNData[0]?.products)}
                                        {item?.aTSNData[0].products?.map((product, index) =>
                                            <ProductItem
                                                key={'product_details' + index}
                                                product={product}
                                                index={index}
                                                onPress={handleProductPress}
                                            />
                                        )}
                                    </ScrollView>}
                                {/* <View style={{ backgroundColor: BackgroundGray, paddingVertical: 10, marginTop: 10 }}>
                                    <Text style={{ fontSize: 14, padding: 10, fontFamily: 'Poppins-SemiBold' }}>{item?.app_promotion_banner_title}</Text>
                                    <TouchableOpacity
                                        onPress={() => item?.app_promotion_banner_link_type === 'category' ? navigation.navigate("ProductListing", {
                                            from: "banner", item: {
                                                ...item, redirection_id: item?.app_promotion_banner_link_id, title: item?.app_promotion_banner_label,
                                                heading: item?.heading
                                            }
                                        })

                                            : navigation.navigate("ProductDetails", { product: { ...item, redirection_id: item?.app_promotion_banner_link_id }, from: 'banner' })}
                                    >
                                        <Image

                                            style={{ width: '95%', height: homeCategoryPromotionHeight, alignSelf: 'center' }}
                                            source={{ uri: item?.app_promotion_banner }}
                                        />
                                    </TouchableOpacity>

                                </View> */}
                            </View>
                        })}

                    </View>
                    <CategoryHome
                        topCategoryData={topCategoryData}
                        navigateToCategories={navigateToCategories}
                    />

                    {bannerBottom && bannerBottom.length > 0 && <TouchableOpacity
                        onPress={() => handleBannerPress(bannerBottom[0], bannerBottom[0].redirection_type)}
                    ><Image
                            style={{ width: windowWidth * .95, height: bottomBannerHeight, marginTop: 20, alignSelf: 'center' }}
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
                                        <ProductItem
                                            key={'product_details' + index}
                                            product={product}
                                            index={index}
                                            onPress={handleProductPress}
                                        />
                                    )}
                                </ScrollView>}
                                <View style={{ backgroundColor: BackgroundGray, paddingVertical: 10, marginTop: 10 }}>
                                    <Text style={{ fontSize: 14, padding: 10, fontFamily: 'Poppins-SemiBold' }}>{item.app_promotion_banner_title}</Text>
                                    <TouchableOpacity
                                        onPress={() => handleBannerPress({
                                            ...item,
                                            redirection_id: item.app_promotion_banner_link_id,
                                            title: item.app_promotion_banner_label
                                        }, item.app_promotion_banner_link_type)}
                                    >
                                        <Image
                                            style={{ width: '95%', height: promotionHeight, alignSelf: 'center' }}
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
                            onPress={() => handleBannerPress(product, product.redirection_type)}
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
            {/* <OrderStatusBottomSheet
                visible={showOrderStatus}
                onClose={() => setShowOrderStatus(false)}
                orderId="BM-3498"
                deliveryTime="Delivery in 19 minutes*"
                currentStatus="Order Placed"
            /> */}
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