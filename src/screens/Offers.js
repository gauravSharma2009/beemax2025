import React, { useEffect, useState } from "react"
import { StatusBar } from "react-native"
import { Text, View, StyleSheet } from "react-native"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { changeLoadingState } from "../actions/loadingAction"
import { server } from "../common/apiConstant"
import { getData } from "../common/asyncStore"
import { BackgroundGray, whiteTxtColor } from "../common/colours"
import CouponList from "../common/CouponList"
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Image } from "react-native"
import { TouchableOpacity } from "react-native"
import { Dimensions } from "react-native"

function OffersScreen(props) {
    const { changeLoadingState, navigation } = props;
    const [offers, setOffers] = useState(null)
    const [offerBanner, setOfferBanner] = useState(null)
    const [offerInfo, setOfferInfo] = useState(null)

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // The screen is focused
            // Call any action
            //selectedAddress && addresses && getCartData()
            getOrderList()
        });

        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation]);

    const getOrderList = async () => {
        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=77cd74e58723f8c0f9e0e020ca688e8bf8abf296");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        changeLoadingState(true)

        // Fetch from the new API endpoint
        fetch(`${server}offer_banner_info`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false)
                // console.log("https://www.beemax.in/rest/api/offer_banner_info","   OffersScreen : ",JSON.stringify(result))
                if (result && result.status) {
                    // Extract the offer banner info
                    if (result.data && result.data.offerInformation) {
                        setOfferBanner(result.data.offerInformation.offer_banner)
                        setOfferInfo(result.data.offerInformation)  // Store the full offer information
                    }
                    // The new API might still return coupon data in a different structure
                    // If the API returns coupon data directly in result.data we should check that
                    // For now, setting to empty array since the API structure was described as only containing banner info
                    setOffers([])
                } else {
                    setOffers([])
                }
            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)
            });
    }

    return (
        <View style={{ flex: 1, backgroundColor: BackgroundGray }}>
            {/* <StatusBar style="light"
                backgroundColor="#3b006a"
            /> */}

            <View style={{ width: "100%", backgroundColor: '#3b006a', justifyContent: 'space-between', flexDirection: 'row', paddingVertical: 15 }}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: 10, marginTop: 10 }}
                >
                    <Image
                        source={require('../../assets/icons/back.png')}
                        style={{ width: 32, height: 32, resizeMode: 'contain', tintColor: '#FFFFFF' }}
                    />
                </TouchableOpacity>

                {/* <View style={{ flexDirection: 'row', alignSelf: 'center', flex: .2, justifyContent: 'flex-end' }}>
                    <Image
                        style={{ width: 20, height: 20, alignSelf: 'center', marginRight: 5 }}
                        source={require('../../assets/search-white.png')}
                    />
                    <TouchableOpacity
                        style={{ alignItems: 'center' }}
                        onPress={() => navigation.navigate("UserScreen")}
                    >
                        <Image
                            style={{ width: 20, height: 20, alignSelf: 'center', marginHorizontal: 10 }}
                            source={require('../../assets/user.png')}
                        />
                    </TouchableOpacity>

                </View> */}
            </View>

            {/* Display the offer banner if available */}
            {offerBanner && (
                <TouchableOpacity
                    style={styles.offerBannerContainer}
                    onPress={() => {
                        // Handle redirection based on offer_redirection_type and offer_redirection_id
                        if (offerInfo) {
                            const redirectionType = offerInfo.offer_redirection_type;
                            const redirectionId = offerInfo.offer_redirection_id;

                            // Assuming navigation to a category screen when clicked
                            // You might want to adjust this based on your app's navigation structure
                            // if (redirectionType === 'category' && redirectionId) {
                            //     // navigation.navigate('Category', { categoryId: redirectionId });
                            //     console.log('Redirecting to category:', redirectionId);
                            //     // Uncomment the line above when you have the navigation setup
                            // }
                            // alert("hello")
                            if (redirectionType === 'category') {
                                navigation.navigate("ProductListing", { item: { ...offerInfo, redirection_id: redirectionId }, from: 'banner' })
                            } else if (redirectionType === 'page') {
                                navigation.navigate("CmsPage", { item: offerInfo, from: 'banner' })
                            } else {
                                navigation.navigate("ProductDetails", { product: { ...offerInfo, redirection_id: redirectionId }, from: 'banner' })
                            }
                        }
                    }}
                >
                    <Image
                        source={{ uri: offerBanner }}
                        style={styles.offerBannerImage}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            )}

            {offers && offers.length > 0 && (
                <View style={styles.couponListContainer}>
                    <CouponList
                        offersList={offers}
                        applyCoupan={null}
                        setAppliedCoupan={null}
                    />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    offerBannerContainer: {
        width: '100%',
        height: '90%', // Use 35% of screen height for banner
    },
    offerBannerImage: {
        width: '100%',
        height: '100%',
    },
    couponListContainer: {
        flex: 1, // Take remaining space after banner and header
    }
});

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

const Offers = connect(mapStateToProps, mapDispatchToProps)(OffersScreen);
export default Offers;