import React, { useEffect, useState } from "react"
import { Dimensions, FlatList, Image, ImageBackground, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import { allcategorylist, server } from "../common/apiConstant"
import Header from "../components/Header"
import { Rating, AirbnbRating } from 'react-native-ratings';
import { currency } from '../common/strings'
import { allCategoryPink, buttonBgColor, categorySaperator, categoryTextpurpleColor, coupanGreen, mrpColor, offColor, productBorderColor, rating5Color, ratingBackground, screenBgColor, subCategoriesname, textColor, textInputColor, unfilledRating, whiteTxtColor } from "../common/colours";
import { WebView } from 'react-native-webview';


import { getData, storeData } from "../common/asyncStore"
import { bindActionCreators } from "redux"
import { connect } from "react-redux"
import Ionicons from 'react-native-vector-icons/Ionicons';


import { changeLoadingState } from "../actions/loadingAction"
// import { PagerTabIndicator, IndicatorViewPager, PagerTitleIndicator, PagerDotIndicator } from 'react-native-best-viewpager';
//import { PagerTabIndicator, IndicatorViewPager, PagerTitleIndicator, PagerDotIndicator } from 'rn-viewpager';
import ValidationView from '../common/ValidationView'
import Accordion from "../common/Accordion"
import VariantSelect from "../common/VariantSelect"
import ImageSlider from "../common/ImageSlider"
import { StatusBar } from "react-native"
import AddButton from "../common/AddButton"
import ProductItem from "../common/ProductItem"
import CartDetails from "../common/CartDetailsCard"
import ImageModal from "../common/ImageModal"
import { setPopup } from "../actions/message"
//https://expo.dev/accounts/gaurav.sharma/projects/eCommerceApp/builds/edb4d13e-8955-4ee7-95cf-22ed299da642
function ProductDetailsScreen(props) {
    const { navigation, route, changeLoadingState, setPopup } = props
    const { product, from } = route?.params
    const [productDetails, setProductDetails] = useState(null)
    const [relatedProducts, setRelatedProducts] = useState(null)
    const [reviews, setReviews] = useState([])
    const [uniqueId, setUniqueId] = useState(null)
    const [count, setCount] = useState(0)
    const [pincodeMessage, setPincodeMessage] = useState(null)
    const [pincode, setPincode] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [review, setReview] = useState("")
    const [rating, setRating] = useState("")
    const [selectedSize, setSelectedSize] = useState("")
    const [selectedColor, setSelectedColor] = useState("")
    const [detail, setDetail] = useState(null)
    const [images, setImages] = useState(null)
    const [error, setError] = useState({})
    const [changeCart, setChangeCart] = useState(0)
    const [modalVisible, setModalVisible] = useState(false);

    const openModal = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };
    useEffect(() => {
        setDetail(product)
        const getUniqueId = async () => {
            const uniqueId = await getData("uniqueId")
            console.log("getting unique id", uniqueId)

            if (!uniqueId) {
                console.log("generating unique id")

                let id = uuidv4()
                setUniqueId(id)
                getCartCount(id)
                storeData("uniqueId", id)
            } else {
                console.log("found unique id", uniqueId)

                setUniqueId(uniqueId)
                getCartCount(uniqueId)
            }
        }
        console.log("item  :  ", JSON.stringify(product))
        getUniqueId()
        // setTimeout(() => {
        //     getCartCount()
        // }, 1000)

    }, [])
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setProductDetails(null)
            setRelatedProducts([])
            setReviews([])
            if (product) {
                getProductDetails()
            }
        });

        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation, product]);
    // useEffect(() => {
    //     //alert("calling api")
    //     if (detail) {
    //         getProductDetails()
    //     }
    // }, [detail])

    const _renderDotIndicator = () => {
        return <PagerDotIndicator
            selectedDotStyle={{ backgroundColor: buttonBgColor }}
            pageCount={images?.length} />;
    }
    useEffect(() => {
        let arr = []
        if (productDetails) {
            arr.push(productDetails[0].image_first)
            arr.push(productDetails[0].image_second)
            arr.push(productDetails[0].image_third)
            arr.push(productDetails[0].image_four)
        }
        //console.log("arr : ", arr)
        setImages(arr)
    }, [productDetails])
    const getProductDetails = async () => {
        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=9a77591918bbf99b223c231d22e1155f7f613b18");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        changeLoadingState(true)
        const uniqueId = await getData("uniqueId")

        console.log("URLS: ", `${server}productdetailsbyid/${from && from === 'banner' ? product.redirection_id : product.id}/${props.pincode}/${uniqueId}`)
        fetch(`${server}productdetailsbyid/${from && from === 'banner' ? product.redirection_id : product.id}/${props.pincode}/${uniqueId}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)
                setChangeCart(changeCart + 1)
                console.log("result.data.aRelatedProductsDetails : ", JSON.stringify(result.data.aRelatedProductsDetails))
                // console.log("end result : ")

                if (result && result.data) {
                    setProductDetails(result.data.aProductDetailsData)
                    setRelatedProducts(result.data.aRelatedProductsDetails)
                    setReviews(result?.data?.aReviewDetailsData || [])

                }
            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)

            });
    }
    const getCartCount = (id) => {
        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=874a68062a45ca215dc1e254f1c624dd3d92053c");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        console.log("uniqueId  :  ", uniqueId)
        fetch(`${server}countcartdata/${id}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log("count data : ", JSON.stringify(result))
                if (result && result.status) {
                    setCount(result.data)
                }
            })
            .catch(error => console.log('error', error));
    }

    // const addToCart = async () => {
    //     var myHeaders = new Headers();
    //     myHeaders.append("Content-Type", "application/json");
    //     myHeaders.append("Cookie", "ci_session=2bf9726eebea7926b7c73664c9a4797ab758ba13");
    //     const loginData = await getData("loginData")
    //     const userData = JSON.parse(loginData)
    //     var raw = JSON.stringify({
    //         "seller_id": productDetails[0].seller_id,
    //         "user_id": userData?.USER_ID,
    //         "product_id": productDetails[0].id,
    //         "device_id": uniqueId,
    //         "qty": "1"
    //     });
    //     console.log("raw : ", raw)
    //     //return;

    //     var requestOptions = {
    //         method: 'POST',
    //         headers: myHeaders,
    //         body: raw,
    //         redirect: 'follow'
    //     };
    //     changeLoadingState(true)
    //     fetch(`${server}addtocart`, requestOptions)
    //         .then(response => response.json())
    //         .then(result => {
    //             changeLoadingState(false)

    //             console.log(result)
    //             if (result && result.status) {
    //                 getCartCount(uniqueId)
    //             }
    //             alert(result.message)
    //         })
    //         .catch(error => {
    //             console.log('error', error)
    //             changeLoadingState(false)

    //         });
    // }

    const checkPinCodeAvailablity = async () => {
        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=e5736dface611983400161aa1ba7abbaca768315");
        let errorObject = {}
        let valid = true
        if (!pincode) {
            errorObject = { ...errorObject, "pincode": "Please enter Pincode." }
            valid = false
        }

        if (!valid) {
            setError(errorObject)
            return;
        } else {
            setError({})
        }
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        if (!pincode || pincode.length < 6) {
            alert("Please enter a valid pincode")
            return;
        }
        changeLoadingState(true)

        fetch(`${server}productavailabilitybypincode/${pincode}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)

                console.log("pincode result : ", JSON.stringify(result))
                if (result && result.status) {
                    setPincodeMessage(result.data?.aPincodeDetailsData[0])
                } else {
                    setPincodeMessage({ availability: "No" })

                }
            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)

            });
    }

    const addReviewToProduct = async () => {
        const loginData = await getData("loginData")
        const userData = JSON.parse(loginData)
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "ci_session=d12266efe52fe59bf88f72d453bb47492c482d84");
        let errorObject = {}

        let valid = true

        if (!name) {
            errorObject = { ...errorObject, "name": "Mandatory" }
            valid = false
        }
        if (!email) {
            errorObject = { ...errorObject, "email": "Mandatory" }
            valid = false
        }
        if (!review) {
            errorObject = { ...errorObject, "review": "Mandatory" }
            valid = false
        }
        if (!valid) {
            setError(errorObject)
            return;
        } else {
            setError({})
        }

        var raw = JSON.stringify({
            "user_id": userData?.USER_ID,
            "product_id": product.id,
            "name": name,
            "email": email,
            "reting": "" + rating,
            "review": review
        });
        console.log("raw", raw)
        //return;
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        changeLoadingState(true)

        fetch(`${server}addproductreview`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)

                console.log(result)
                if (result && result.status) {
                    setName("")
                    setEmail("")
                    setReview("")
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
    const addItem = (qty, item) => {
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
            "seller_id": product.seller_id,
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
        fetch(url, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)

                console.log("cart add data : ", result)
                if (result && result.status) {
                    getProductDetails()
                } else {
                    setPopup({ message: result.message, status: "faliure", open: false })
                }
            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)

            });
    }

    return (
        <View style={{ flex: 1, backgroundColor: screenBgColor }}>
            {/* <StatusBar style="light"
                backgroundColor="#3b006a"
            /> */}

            <View style={{ flex: .06, width: "100%", backgroundColor: '#3b006a', justifyContent: 'space-between', flexDirection: 'row', paddingVertical: 15 }}>
                <Ionicons
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: 10 }}
                    name="ios-chevron-back-outline"
                    size={32}
                    color={whiteTxtColor} />

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
            <ScrollView
                keyboardShouldPersistTaps={"always"}
                showsVerticalScrollIndicator={false}
                style={{ marginTop: 0, marginBottom: 0, flex: .94 }}>
                {productDetails && <View
                    style={{ width: '100%', paddingLeft: 10, backgroundColor: whiteTxtColor }}>

                    {console.log("productDetails[0].image_first  :  ", JSON.stringify(productDetails[0]))}
                    <ImageSlider
                        openModal={openModal}
                        images={productDetails[0].product_images}
                    />

                    <Text
                        style={{ fontSize: 20, color: textColor, fontFamily: 'Poppins-SemiBold', marginTop: 10, }}>{productDetails[0].title}</Text>
                    {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                        <Text style={{ fontFamily: 'Poppins-Regular', color: mrpColor, fontSize: 18 }}> </Text>


                    </View> */}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                        <View style={{ flexDirection: 'row', }}>
                            <Text
                                style={{ fontSize: 18, color: textColor, fontFamily: 'Poppins-Light', }}
                            >{currency}</Text>
                            <Text
                                style={{ fontSize: 18, color: textColor, fontFamily: 'Poppins-SemiBold', marginLeft: 2 }}
                            >{productDetails[0].selling_price}</Text>
                            {/* <Text
                                style={{ fontSize: 18, color: textColor, fontFamily: 'Poppins-Light', marginLeft: 10, textDecorationLine: 'line-through',
                                textDecorationStyle: 'solid', }}
                            >{currency}</Text> */}
                            <Text
                                style={{
                                    fontSize: 18, color: mrpColor, fontFamily: 'Poppins-Regular', marginLeft: 2, textDecorationLine: 'line-through',
                                    textDecorationStyle: 'solid', marginLeft: 10
                                }}
                            >{currency} {productDetails[0].mrp_price}</Text>
                            {/* {productDetails[0].discount_percentage && <Text
                            style={{ fontSize: 16, color: offColor, fontFamily: 'Poppins-Regular', marginLeft: 5, marginBottom: 5 }}
                        >{productDetails[0].discount_percentage + "% OFF"}</Text>} */}
                        </View>
                        <AddButton
                            callBack={getProductDetails}
                            changeLoadingState={changeLoadingState}
                            addItem={addItem}
                            minusItem={minusItem}
                            item={productDetails[0]}
                        />
                    </View>

                    {/* <View style={{ flexDirection: 'row', marginTop: 5 }}>
                        <Text
                            style={{ fontSize: 16, color: textColor, fontFamily: 'Poppins-SemiBold', }}
                        >{"Brand : "}</Text>
                        <Text
                            style={{ fontSize: 16, color: textColor, fontFamily: 'Poppins-Regular', }}
                        >{productDetails[0].brand_name}</Text>

                    </View> */}
                    {/* <View style={{ flexDirection: 'row', marginTop: 10 }}>
                        <Text
                            style={{ fontSize: 16, color: textColor, fontFamily: 'Poppins-SemiBold', }}
                        >{"Sold by : "}</Text>
                        <Text
                            style={{ fontSize: 18, color: buttonBgColor, fontFamily: 'Poppins-Regular', }}
                        >{productDetails[0].store_name}</Text>

                    </View> */}
                    {productDetails[0].Secondary_Attributes_Details && productDetails[0].Secondary_Attributes_Details.Size &&
                        <VariantSelect
                            productId={product.id}
                            navigation={navigation}
                            setDetail={setDetail}
                            variants={productDetails[0].Secondary_Attributes_Details}
                        />}

                    {/* {productDetails[0].Primary_Attributes_Details && productDetails[0].Primary_Attributes_Details.Color && <View style={{ width: '98%', height: 10, backgroundColor: categorySaperator, marginVertical: 20 }}></View>} */}
                    {productDetails[0].Primary_Attributes_Details && productDetails[0].Primary_Attributes_Details.Color &&
                        <View>
                            <Text
                                style={{ fontSize: 16, color: textColor, fontFamily: 'Poppins-SemiBold', }}
                            >{"More Options "}</Text>
                            {console.log("selectedColor  :  ", selectedColor , "   :  ",product )}
                            {console.log("productDetails[0].Primary_Attributes_Details.Color  :  ", productDetails[0].Primary_Attributes_Details.Color)}
                            <FlatList
                                numColumns={4}
                                data={Object.keys(productDetails[0].Primary_Attributes_Details.Color)}
                                renderItem={({ item }) =>
                                    <TouchableOpacity
                                        onPress={() => {
                                            navigation.push("ProductDetails", { product: { ...productDetails[0].Primary_Attributes_Details.Color[item], id: item } })
                                        }}
                                        style={{
                                            resizeMode: 'center', alignItems: 'center', width: '21%', height: 100, paddingHorizontal: 10, paddingVertical: 10,
                                            borderRadius: 5, borderColor:product.id === item ? categoryTextpurpleColor : whiteTxtColor, borderWidth: 1, marginLeft: '2%', 
                                        }}>
                                        <Image
                                            style={{ height: 60, width: '100%' }}
                                            source={{ uri: productDetails[0].Primary_Attributes_Details?.Color[item].image_first }}
                                        />

                                        <Text
                                            style={{ fontFamily: 'Poppins-Regular', color: selectedColor === item ? whiteTxtColor : textColor, textAlign: 'center', fontSize: 12 }}
                                        >{productDetails[0].Primary_Attributes_Details?.Color[item].Color}</Text>
                                    </TouchableOpacity>
                                }
                            />
                        </View>
                    }
                    {/* {productDetails[0].Secondary_Attributes_Details && productDetails[0].Secondary_Attributes_Details.Size && <View style={{ width: '98%', height: 10, backgroundColor: categorySaperator, marginVertical: 20 }}></View>}
                    {productDetails[0].Secondary_Attributes_Details && productDetails[0].Secondary_Attributes_Details.Size && <View>
                        <Text
                            style={{ fontSize: 16, color: textColor, fontFamily: 'Poppins-SemiBold', }}
                        >{"Select Size"}</Text>

                        <FlatList
                            numColumns={4}
                            data={Object.keys(productDetails[0].Secondary_Attributes_Details.Size)}
                            renderItem={({ item }) =>
                                <TouchableOpacity
                                    onPress={() => setSelectedSize(item)}
                                    style={{ justifyContent: 'center', alignItems: 'center', width: '21%', borderColor: textColor, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 10, marginLeft: '2%', backgroundColor: selectedSize === item ? textColor : whiteTxtColor }}>
                                    <Text
                                        style={{ fontFamily: 'Poppins-SemiBold', color: selectedSize === item ? whiteTxtColor : textColor }}
                                    >IND - {productDetails[0].Secondary_Attributes_Details.Size[item]}</Text>
                                </TouchableOpacity>
                            }
                        />
                    </View>} */}

                    {/* <View style={{ width: '98%', height: 10, backgroundColor: categorySaperator, marginVertical: 20 }}></View> */}

                    {pincodeMessage ? <View style={{ width: '100%', marginTop: 5 }}>

                        {pincodeMessage?.availability.toLowerCase() === 'yes' ? <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 16, color: coupanGreen }}>Delivery available in your area.</Text> : null}
                        {pincodeMessage?.availability.toLowerCase() === 'no' ? <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 16, color: "red", alignSelf: 'flex-end' }}>Delivery not available in your area.</Text> : null}

                    </View> : null}

                    <Accordion
                        changeLoadingState={changeLoadingState}
                        product={product}
                        reviews={reviews}
                        data={[
                            { type: "web", title: 'About Product', content: productDetails[0].description },
                            { type: 'web', title: 'Specification', content: productDetails[0].specification },
                            { type: 'review', title: 'Review', content: productDetails[0].specification },
                        ]}
                    />
                </View>}
                {relatedProducts && relatedProducts.length > 0 &&
                    <View style={{ width: '100%', backgroundColor: whiteTxtColor, marginTop: 0 }}>
                        <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                            <Text
                                style={{ fontSize: 16, color: textColor, fontFamily: 'Poppins-SemiBold', marginLeft: 10, marginTop: 10 }}
                            >{"Related Products"}</Text>

                            <View style={{ flexDirection: 'row', marginRight: 3, justifyContent: 'center' }}>
                                <Rating
                                    type='custom'
                                    ratingCount={5}
                                    imageSize={15}
                                    readonly={true}
                                    onFinishRating={(rating) => setRating(rating)}
                                    startingValue={Number(productDetails[0].average_rating)}
                                    style={{ alignSelf: 'center', marginLeft: 10 }}
                                />
                                <Text style={{ fontSize: 16, alignSelf: 'center', color: textColor, fontFamily: 'Poppins-Regular' }}>{`(${reviews?.length || 0} Reviews)`}</Text>
                            </View>
                        </View>

                        <FlatList
                            style={{ marginTop: 10 }}
                            numColumns={2}
                            data={relatedProducts}
                            renderItem={({ item, index }) =>
                                <ProductItem
                                    navigation={navigation}
                                    getProductList={getProductDetails}
                                    changeLoadingState={changeLoadingState}
                                    item={item}
                                    index={index}
                                />
                                // <View style={{ paddingTop: 15, paddingRight: 5 }}>
                                //     <TouchableOpacity
                                //         onPress={() => navigation.navigate("ProductDetails", { product: item })}
                                //         key={"product" + index}
                                //         style={{ borderColor: productBorderColor, borderRadius: 8, borderWidth: 2, width: Dimensions.get('window').width * .45, marginLeft: 10, paddingBottom: 10 }}>
                                //         <Image
                                //             style={{ width: 80, height: 130, resizeMode: 'contain', alignSelf: 'center' }}
                                //             source={{ uri: item?.image_first }}
                                //         />
                                //         <Text
                                //             numberOfLines={2}
                                //             style={{ minHeight: 40, fontSize: 14, color: textColor, fontFamily: 'Poppins-SemiBold', marginTop: 5, marginLeft: 5 }}>{item.title}</Text>
                                //         <Text
                                //             style={{ fontSize: 12, color: textColor, fontFamily: 'Poppins-Regular', marginTop: 5, marginLeft: 5 }}>{item.weight + ' g'}</Text>

                                //         <View style={{ flexDirection: 'row', marginTop: 5, }}>
                                //             <Text
                                //                 style={{ fontSize: 10, color: textColor, fontFamily: 'Poppins-Light', marginLeft: 5 }}
                                //             >{currency}</Text>
                                //             <Text
                                //                 style={{ fontSize: 10, color: mrpColor, fontFamily: 'Poppins-Regular', marginLeft: 2 }}
                                //             >{item.mrp_price}</Text>
                                //         </View>
                                //         <View style={{ flexDirection: 'row', marginTop: 2 }}>
                                //             <Text
                                //                 style={{ fontSize: 14, color: textColor, fontFamily: 'Poppins-SemiBold', marginLeft: 5 }}
                                //             >{currency}</Text>
                                //             <Text
                                //                 style={{ fontSize: 14, color: textColor, fontFamily: 'Poppins-SemiBold', marginLeft: 2 }}
                                //             >{item.selling_price}</Text>


                                //         </View>
                                //         <ImageBackground
                                //             style={{ width: 35, height: 35, position: 'absolute', right: 5, top: 5, alignItems: 'center', justifyContent: 'center' }}
                                //             source={require('../../assets/discount-bg.png')}
                                //         >
                                //             <Text
                                //                 style={{ alignSelf: 'center', textAlign: 'center', fontSize: 8, color: whiteTxtColor, fontFamily: 'Poppins-Regular', }}
                                //             >{item.discount_percentage + '%' + "\nOFF"}</Text>

                                //         </ImageBackground>
                                //         <View style={{ position: 'absolute', bottom: 5, right: 10, }}>
                                //             {console.log(" related products : ", item)}
                                //             <AddButton
                                //                 callBack={getProductDetails}
                                //                 changeLoadingState={changeLoadingState}
                                //                 type={"plus"}
                                //                 item={item}
                                //             />
                                //         </View>                                   

                                //     </TouchableOpacity>
                                // </View>
                            }
                        />
                    </View>}

            </ScrollView>
            {/* <View style={{ position: 'absolute', bottom: 0, height: 100, width: '100%', justifyContent: 'center' }}>

                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("Cart")}
                        style={{ flex: .3, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                style={{ width: 30, height: 30 }}
                                source={require('../../assets/icons/shopping-cart.png')}
                            />
                            <View style={{ justifyContent: 'center', alignItems: 'center', width: 20, height: 20, backgroundColor: buttonBgColor, position: 'absolute', right: 0, top: 0, borderRadius: 10 }}>
                                <Text style={{ color: whiteTxtColor }}>{count}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View
                        // onPress={() => navigation.navigate("SubCategories", { item })}
                        style={{ flex: .7, padding: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                        <TouchableOpacity
                            style={{ backgroundColor: textColor, paddingVertical: 10, paddingHorizontal: 25, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}
                        ><Text style={{ color: whiteTxtColor, fontFamily: 'Poppins-Regular' }}>Buy Now</Text></TouchableOpacity>
                        <TouchableOpacity
                            onPress={addToCart}
                            style={{ backgroundColor: buttonBgColor, padding: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }}
                        ><Text style={{ color: whiteTxtColor, fontFamily: 'Poppins-Regular' }}>Add to Cart</Text></TouchableOpacity>
                    </View>

                </View>

            </View> */}
            {productDetails && <CartDetails
                navigation={navigation}
                changeCart={changeCart}
            />}
            <ImageModal images={
                productDetails && productDetails[0].product_images?.map((item) => { return { url: item } }) || []
            } visible={modalVisible} onClose={closeModal} />

        </View>
    )
}

const mapStateToProps = (state) => {
    // console.log("redux state : ", state)
    return {
        pincode: state.pinCode.pincode
    }
};
const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        ...bindActionCreators({ changeLoadingState, setPopup }, dispatch),
    }

}

const ProductDetails = connect(mapStateToProps, mapDispatchToProps)(ProductDetailsScreen);
export default ProductDetails;
