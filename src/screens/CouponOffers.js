import React, { useState } from "react"
import {
    Text, View, ScrollView, TouchableOpacity, TextInput, Dimensions, Image
} from "react-native"
import {
    BackgroundGray, buttonBgColor, categorySaperator, coupanGreen,
    textColor, textInputColor, whiteTxtColor
} from "../common/colours"

// Scale down a little on small / narrow devices so the rows don't get messy.
const SMALL = Dimensions.get('window').width < 360
const fs = (n) => (SMALL ? n - 1 : n)   // font scale helper

/**
 * Coupon & Offers screen.
 *
 * Navigated to from Cart via:
 *   navigation.navigate("CouponOffers", {
 *       offersList, subTotal, appliedCoupon, onApply, onRemove
 *   })
 *
 * - offersList   : aCouponOffersList array from cartdata API
 * - subTotal     : current cart item total (used to decide locked / unlocked)
 * - appliedCoupon: currently applied coupon_code (or null)
 * - onApply(code): callback that applies the coupon to the cart
 * - onRemove()   : callback that removes the applied coupon
 */
function CouponOffers(props) {
    const { navigation, route } = props
    const {
        offersList = [],
        subTotal = 0,
        appliedCoupon = null,
        onApply,
        onRemove,
    } = route?.params || {}

    const [typedCode, setTypedCode] = useState("")
    const [expandedId, setExpandedId] = useState(null)

    // Build the headline for a coupon, e.g. "Flat ₹50 off on orders above ₹799"
    const couponTitle = (coupon) => {
        const isPercent = coupon.discount_type === "percentage" || coupon.discount_type === "percent"
        const min = parseFloat(coupon.min_order_value || 0)
        if (isPercent) {
            return `Get ${coupon.discount}% off on orders above ₹${min}`
        }
        return `Flat ₹${coupon.discount} off on orders above ₹${min}`
    }

    const isUnlocked = (coupon) =>
        parseFloat(subTotal) >= parseFloat(coupon.min_order_value || 0)

    const handleApply = (code) => {
        if (!code) return
        if (typeof onApply === "function") onApply(code)
        navigation.goBack()
    }

    const handleRemove = () => {
        if (typeof onRemove === "function") onRemove()
        navigation.goBack()
    }

    const renderCoupon = (coupon, index) => {
        const applied = appliedCoupon && appliedCoupon === coupon.coupon_code
        const unlocked = isUnlocked(coupon)
        const expanded = expandedId === coupon.id

        return (
            <View key={coupon.id || index} style={{
                backgroundColor: whiteTxtColor, borderRadius: 10,
                marginHorizontal: 12, marginBottom: 10,
                borderWidth: 1, borderColor: categorySaperator, overflow: 'hidden'
            }}>
                {/* Top row: badge + title + action (Remove / Locked) */}
                <View style={{
                    flexDirection: 'row', alignItems: 'flex-start',
                    paddingHorizontal: 10, paddingTop: 10
                }}>
                    {/* Discount tag: rotated square outline with an upright "%" (no icon font) */}
                    <View style={{
                        width: 24, height: 24, borderRadius: 12, backgroundColor: coupanGreen,
                        justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 1
                    }}>
                        <View style={{
                            position: 'absolute', width: 13, height: 13, borderRadius: 3,
                            borderWidth: 1.5, borderColor: whiteTxtColor, transform: [{ rotate: '45deg' }]
                        }} />
                        <Text style={{
                            color: whiteTxtColor, fontFamily: 'Poppins-SemiBold', fontSize: fs(9)
                        }}>%</Text>
                    </View>

                    <View style={{ flex: 1, paddingRight: 8 }}>
                        {applied ? (
                            <Text style={{
                                fontFamily: 'Poppins-SemiBold', fontSize: fs(14), color: coupanGreen
                            }}>
                                Saved ₹{coupon.discount}!
                            </Text>
                        ) : (
                            <Text style={{
                                fontFamily: 'Poppins-SemiBold', fontSize: fs(13), color: textColor, lineHeight: fs(18)
                            }}>
                                {couponTitle(coupon)}
                            </Text>
                        )}
                    </View>

                    {/* Right side action */}
                    {applied ? (
                        <TouchableOpacity onPress={handleRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Text style={{
                                fontFamily: 'Poppins-SemiBold', fontSize: fs(13), color: buttonBgColor
                            }}>Remove</Text>
                        </TouchableOpacity>
                    ) : !unlocked ? (
                        <View style={{
                            borderWidth: 1, borderColor: categorySaperator, borderRadius: 5,
                            paddingHorizontal: 8, paddingVertical: 3
                        }}>
                            <Text style={{
                                fontFamily: 'Poppins-Medium', fontSize: fs(11), color: textInputColor
                            }}>Locked</Text>
                        </View>
                    ) : null}
                </View>

                {/* Applied banner sub-text */}
                {applied && (
                    <Text style={{
                        fontFamily: 'Poppins-Regular', fontSize: fs(11), color: textInputColor,
                        paddingHorizontal: 38, paddingTop: 1
                    }}>
                        {couponTitle(coupon)}
                    </Text>
                )}

                {/* Divider */}
                <View style={{
                    height: 1, backgroundColor: categorySaperator,
                    marginHorizontal: 10, marginTop: 10
                }} />

                {/* Code chip + Apply / Know more */}
                <View style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingHorizontal: 10, paddingVertical: 8
                }}>
                    <View style={{
                        borderWidth: 1, borderColor: categorySaperator, borderRadius: 5,
                        paddingHorizontal: 8, paddingVertical: 3, backgroundColor: BackgroundGray
                    }}>
                        <Text style={{
                            fontFamily: 'Poppins-Medium', fontSize: fs(12), color: textColor, letterSpacing: 0.3
                        }}>{coupon.coupon_code}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* Apply button shown only when unlocked & not applied */}
                        {!applied && unlocked && (
                            <TouchableOpacity
                                onPress={() => handleApply(coupon.coupon_code)}
                                style={{
                                    backgroundColor: coupanGreen, borderRadius: 5,
                                    paddingHorizontal: 12, paddingVertical: 4, marginRight: 10
                                }}>
                                <Text style={{
                                    fontFamily: 'Poppins-Medium', fontSize: fs(12), color: whiteTxtColor
                                }}>Apply</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => setExpandedId(expanded ? null : coupon.id)}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{
                                fontFamily: 'Poppins-Medium', fontSize: fs(12), color: textColor, marginRight: 4
                            }}>Know more</Text>
                            <Image
                                source={require('../../assets/icons/back.png')}
                                style={{
                                    width: 13, height: 13, resizeMode: 'contain', tintColor: textColor,
                                    // back.png points left; rotate it to point down (collapsed) / up (expanded)
                                    transform: [{ rotate: expanded ? '90deg' : '-90deg' }]
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Expanded details – headline + coupon info */}
                {expanded ? (
                    <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                        <Text style={{
                            fontFamily: 'Poppins-Medium', fontSize: fs(13), color: textColor,
                            lineHeight: fs(18), marginBottom: 4
                        }}>
                            {couponTitle(coupon)}
                        </Text>
                        {coupon.coupon_info ? (
                            <Text style={{
                                fontFamily: 'Poppins-Regular', fontSize: fs(12), color: textInputColor, lineHeight: fs(18)
                            }}>
                                {coupon.coupon_info}
                            </Text>
                        ) : null}
                    </View>
                ) : null}
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: BackgroundGray }}>
            {/* Header strip */}
            <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: '#3b006a', paddingHorizontal: 12, paddingVertical: 14
            }}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                        source={require('../../assets/icons/back.png')}
                        style={{ width: 26, height: 26, resizeMode: 'contain', tintColor: whiteTxtColor }}
                    />
                </TouchableOpacity>
                <Text style={{
                    fontFamily: 'Poppins-SemiBold', fontSize: fs(16), color: whiteTxtColor, marginLeft: 12
                }}>Coupon &amp; Offers</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                {/* Coupon code input */}
                <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    marginHorizontal: 12, marginTop: 12
                }}>
                    <TextInput
                        placeholder="Type coupon code here"
                        placeholderTextColor={textInputColor}
                        value={typedCode}
                        autoCapitalize="characters"
                        onChangeText={setTypedCode}
                        style={{
                            flex: 1, backgroundColor: whiteTxtColor, borderWidth: 1,
                            borderColor: categorySaperator, borderRadius: 8,
                            paddingHorizontal: 12, paddingVertical: 8,
                            fontFamily: 'Poppins-Regular', fontSize: fs(12), color: textColor
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => handleApply(typedCode.trim())}
                        disabled={!typedCode.trim()}
                        style={{
                            marginLeft: 8, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10,
                            backgroundColor: typedCode.trim() ? buttonBgColor : '#cccccc'
                        }}>
                        <Text style={{
                            fontFamily: 'Poppins-SemiBold', fontSize: fs(12), color: whiteTxtColor
                        }}>Apply</Text>
                    </TouchableOpacity>
                </View>

                {/* Section label */}
                <Text style={{
                    fontFamily: 'Poppins-SemiBold', fontSize: fs(11), color: textInputColor,
                    marginHorizontal: 14, marginTop: 16, marginBottom: 8, letterSpacing: 0.5
                }}>FEATURED COUPONS</Text>

                {offersList && offersList.length > 0 ? (
                    offersList.map(renderCoupon)
                ) : (
                    <Text style={{
                        fontFamily: 'Poppins-Regular', fontSize: fs(13), color: textInputColor,
                        textAlign: 'center', marginTop: 30
                    }}>No coupons available right now.</Text>
                )}
            </ScrollView>
        </View>
    )
}

export default CouponOffers
