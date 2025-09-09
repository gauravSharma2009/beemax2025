import React, { useState, useEffect, useCallback, useRef } from "react"
import { ImageBackground, RefreshControl } from "react-native"
import { Dimensions, FlatList, Image, Text, TouchableOpacity, View } from "react-native"
import { Rating } from "react-native-ratings"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { changeLoadingState } from "../actions/loadingAction"
import { productlistbycategoryid, server } from "../common/apiConstant"
import { getData, storeData } from "../common/asyncStore"
import { allCategoryPink, BackgroundGray, buttonBgColor, categoryBackground, categorySaperator, mrpColor, offColor, productBorderColor, subCategoriesname, textColor, whiteTxtColor } from "../common/colours"
import { currency } from "../common/strings"
import Header from "../components/Header"
import AddButton from '../common/AddButton'
import ProductItem from "../common/ProductItem"
import CartDetails from "../common/CartDetailsCard"
import { setPopup } from "../actions/message"
import { changeCartCount } from "../actions/cartCount"
import PTRView from 'react-native-pull-to-refresh';
import { height, width } from "deprecated-react-native-prop-types/DeprecatedImagePropType"
import { useFocusEffect } from '@react-navigation/native';

function ProductListingScreen(props) {
    const { navigation, route, changeLoadingState, pinCode, setPopup, changeCartCount } = props
    const { item, from } = route?.params
    const [changeCart, setChangeCart] = useState(0)
    const [products, setProducts] = useState([])
    const [pageCount, setPageCount] = useState(1)
    const [isLoading, setIsLoading] = useState(false);
    const [isEndReached, setIsEndReached] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [clickedItem, setClickedItem] = useState(null);
    const [counter, setCounter] = useState(1)
    const flatListRef = useRef(null);
    const ITEM_HEIGHT = 275; // Adjust based on your item height

    // useEffect(() => {
    //     alert("Hello")

    //     const unsubscribe = navigation.addListener('focus', () => {
    //         setProducts([])
    //         setPageCount(1)
    //         setTimeout(() => {
    //             // alert("calling")
    //             getProductList()
    //         }, 500)
    //     });
    //     return unsubscribe;
    // }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            const getClickedItem = async () => {
                const item = await getData("clickedItem");
                let productsData = JSON.parse(JSON.stringify(products))

                if (item) {
                    console.log("Item : ", item)
                    // alert("Hello")

                    const clickedItem = JSON.parse(item);
                    if (clickedItem) {
                        const uniqueId = await getData("uniqueId")
                        console.log("getting unique id", uniqueId)

                        var myHeaders = new Headers();
                        myHeaders.append("Cookie", "ci_session=9a77591918bbf99b223c231d22e1155f7f613b18");

                        var requestOptions = {
                            method: 'GET',
                            headers: myHeaders,
                            redirect: 'follow'
                        };
                        const product = await getData("products")
                        const products = JSON.parse(product)
                        console.log("api to details refresh  : ", `${server}productdetailsbyid/${clickedItem.id}/${pinCode}/${uniqueId}`)
                        fetch(`${server}productdetailsbyid/${clickedItem.id}/${pinCode}/${uniqueId}`, requestOptions)
                            .then(response => response.json())
                            .then(result => {
                                console.log("productsData : ", productsData)


                                // console.log("result.data.aRelatedProductsDetails : ", JSON.stringify(result.data.aProductDetailsData))
                                if (result?.data?.aProductDetailsData && result.data.aProductDetailsData.length > 0) {
                                    const object = result?.data?.aProductDetailsData[0];
                                    console.log("object  :  ", object)
                                    // console.log("products  :  ",products)
                                    let index = 0;
                                    const newArray = object && products && products.map((item, itemIndex) => {
                                        if (item.id === object.id)
                                            index = itemIndex
                                        return item.id === object.id ? { ...item, qty_added_in_cart: object.qty_added_in_cart } : item
                                    })
                                    setProducts([])
                                    setProducts(newArray)
                                    // setCounter(counter + 1)
                                    setTimeout(() => {
                                        flatListRef.current.scrollToIndex({ animated: true, index: Math.floor(index/2) });
                                    }, 100)
                                }
                            })
                            .catch(error => {
                                console.log('error', error)

                            });
                    }
                }
            }
            getClickedItem()
            return () => {
                console.log("clearing")
                //  storeData("clickedItem", "")
            };
        }, [])
    );


    useEffect(() => {
        getProductList()
    }, [])
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
            })
            .catch(error => {
                console.log('error', error)

            });
    }
    const setAction = async (product) => {
        console.log(" product : ", product)
        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=9f68c961b84071779a964257631bb46d9322eb23");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        changeLoadingState(true)
        const uniqueId = await getData("uniqueId")
        console.log("URL list by category: ", `${server}${productlistbycategoryid}${from && from === 'banner' ? item.redirection_id : item.id}/${pinCode}/${product.page}/${uniqueId}`)
        fetch(`${server}${productlistbycategoryid}${from && from === 'banner' ? item.redirection_id : item.id}/${pinCode}/${product.page}/${uniqueId}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)
                let productArray = JSON.parse(JSON.stringify(products))

                result?.data?.aProductListData.forEach(element => {
                    for (let i = 0; i < productArray.length; i++) {
                        if (productArray[i].id === element.id && productArray[i].page === product.page) {
                            productArray[i] = { ...element, page: product.page }
                            break;
                        }
                    }
                });
                // const data = result?.data?.aProductListData.map((item) => { return { ...item, page: pageCount } })
                setProducts(productArray);
                checkCartCount();
            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)

            });

    }

    const getProductList = async () => {
        // alert("Hello")
        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=9f68c961b84071779a964257631bb46d9322eb23");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        changeLoadingState(true)
        const uniqueId = await getData("uniqueId")
        console.log("URL list by category: ", `${server}${productlistbycategoryid}${from && from === 'banner' ? item.redirection_id : item.id}/${pinCode}/${pageCount}/${uniqueId}`)
        fetch(`${server}${productlistbycategoryid}${from && from === 'banner' ? item.redirection_id : item.id}/${pinCode}/${pageCount}/${uniqueId}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)
                setChangeCart(changeCart + 1)
                if (result?.data?.aProductListData && result?.data?.aProductListData.length === 0) {
                    setIsEndReached(true);
                } else {
                    const data = result?.data?.aProductListData?.map((item) => { return { ...item, page: pageCount } })
                    setProducts([...products, ...data]);
                    setPageCount(pageCount + 1);
                }
                // if (result && result.status && result.data) {
                //     setProducts(result.data.aProductListData);
                // }
            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)

            });
    }

    const getProductListBySwipe = async (page) => {
        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=9f68c961b84071779a964257631bb46d9322eb23");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        changeLoadingState(true)
        const uniqueId = await getData("uniqueId")
        console.log("URL list by category: ", `${server}${productlistbycategoryid}${from && from === 'banner' ? item.redirection_id : item.id}/${pinCode}/${pageCount}/${uniqueId}`)
        fetch(`${server}${productlistbycategoryid}${from && from === 'banner' ? item.redirection_id : item.id}/${pinCode}/${page}/${uniqueId}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)

                const data = result?.data?.aProductListData?.map((item) => { return { ...item, page: page } })
                setProducts(data);
                setPageCount(page + 1);

            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)

            });
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
        console.log("raw : ", raw)
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
                if (result.status) {
                    setPopup({ message: result.message, status: "success", open: true })
                } else {
                    setPopup({ message: result.message, status: "faliure", open: false })
                }

            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)

            });
    }
    const renderFooter = () => {
        if (!isLoading) return null;
        return (
            <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    };
    const getItemLayout = (data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      });
    
      const onScrollToIndexFailed = (info) => {
        const wait = new Promise((resolve) => setTimeout(resolve, 500));
        wait.then(() => {
          flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
        });
      };
    return (
        <View style={{ flex: 1, backgroundColor: whiteTxtColor }}>
            <Header
                navigation={navigation}
                name={item?.title || item?.category_title}
                search={true}
            />
            {/* <PTRView
                onRefresh={() => {
                    setProducts([])
                    setPageCount(1)
                    setTimeout(() => {
                        getProductList()
                    }, 1500)
                }}
                style={{
                    width: '100%', height: "94%",
                    backgroundColor: "green"
                    //flex: .94, //justifyContent: 'center' 
                }}
            > */}
            <View style={{ width: '100%', height: '94%' }}>
                {counter && products && products.length > 0 ? <FlatList
                    style={{ width: '100%', height: "95%" }}
                    numColumns={2}
                    data={products}
                    ref={flatListRef}
                    getItemLayout={getItemLayout}
                    onScrollToIndexFailed={onScrollToIndexFailed}
                    onEndReached={isEndReached ? null : getProductList}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true)
                                //setProducts([])
                                //setPageCount(1)
                                setTimeout(() => {
                                    setRefreshing(false)
                                    setProducts([])
                                    getProductListBySwipe(1)
                                }, 2000);
                            }} />
                    }
                    // contentContainerStyle={styles.list}
                    renderItem={({ item, index }) =>
                        <ProductItem
                            products={products}
                            navigation={navigation}
                            getProductList={getProductList}
                            changeLoadingState={changeLoadingState}
                            item={item}
                            index={index}
                            setAction={setAction}
                        />

                    }
                /> : <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Image
                        style={{ width: 75, height: 75, alignSelf: 'center' }}
                        source={require('../../assets/icons/empty_product_list.png')}
                    />
                </View>
                }

                <CartDetails
                    navigation={navigation}
                    changeCart={changeCart}
                />
            </View>
            {/* </PTRView> */}

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
        ...bindActionCreators({ changeLoadingState, setPopup, changeCartCount }, dispatch),
    }

}

const ProductListing = connect(mapStateToProps, mapDispatchToProps)(ProductListingScreen);
export default ProductListing;
