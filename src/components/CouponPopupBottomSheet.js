import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    Image,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    StatusBar,
} from 'react-native';
import { getData } from '../common/asyncStore';
import { server } from '../common/apiConstant';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COUPON_POPUP_API = 'get_coupon_popups';

/**
 * CouponPopupBottomSheet
 *
 * Props:
 *  - navigation  : React Navigation prop (pass from HomeScreen)
 *  - isLoggedIn  : boolean from redux
 *
 * Usage in HomeScreen:
 *   <CouponPopupBottomSheet navigation={navigation} isLoggedIn={isLoggedIn} />
 *
 * Redirection is handled inside this component via `navigation`.
 * When the user taps the image / CTA button:
 *   - redirection_type === 'product'  → navigate('ProductDetail', { id: link_id })
 *   - redirection_type === 'category' → navigate('ProductListing', { item: { id: link_id } })
 *   - fallback                        → close the sheet
 */
// Max allowed image height so it never overflows the screen
const MAX_IMAGE_HEIGHT = SCREEN_HEIGHT * 0.82;

function CouponPopupBottomSheet({ navigation, isLoggedIn }) {
    const [visible, setVisible] = useState(false);
    const [currentPopup, setCurrentPopup] = useState(null);
    const [popupQueue, setPopupQueue] = useState([]);
    const [imageHeight, setImageHeight] = useState(SCREEN_WIDTH); // 1:1 fallback
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    // ─── Fetch coupon popups silently on mount ─────────────────────────────────
    useEffect(() => {
        fetchCouponPopups();
    }, []);

    const fetchCouponPopups = async () => {
        try {
            const loginData = await getData('loginData');
            const userData = loginData ? JSON.parse(loginData) : null;
            const userId = userData?.USER_ID ?? 0;
            console.log('[CouponPopup] Fetching popups for user_id:', userId);
            console.log('[CouponPopup] API endpoint:', `${server}${COUPON_POPUP_API}`);
            const response = await fetch(`${server}${COUPON_POPUP_API}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId }),
            });

            const result = await response.json();
            //  let result = {
            //     "status": true,
            //     "data": {
            //         "aPopups": [
            //             {
            //                 "popup_id": "1",
            //                 "popup_name": "newuser 50",
            //                 "image_url": "https://www.staging.beemax.in/media/uploads/coupon_popup/1777048060_b1.png",
            //                 "redirection_type": "product",
            //                 "link_id": "444",
            //                 "coupon_code": "NEWUSER50",
            //                 "coupon_discount": "50",
            //                 "coupon_discount_type": "fixed",
            //                 "coupon_info": "asadasd",
            //                 "sticky_on_cart": 1,
            //                 "valid_upto": "2031-01-24",
            //                 "user_type": "new"
            //             },
            //             {
            //                 "popup_id": "3",
            //                 "popup_name": "favorate 50",
            //                 "image_url": "https://www.staging.beemax.in/media/uploads/coupon_popup/1777048216_b3.png",
            //                 "redirection_type": "category",
            //                 "link_id": "44",
            //                 "coupon_code": "FAVORITE50",
            //                 "coupon_discount": "50",
            //                 "coupon_discount_type": "fixed",
            //                 "coupon_info": "",
            //                 "sticky_on_cart": 0,
            //                 "valid_upto": "2031-05-24",
            //                 "user_type": "all"
            //             }
            //         ],
            //         "user_type": "new",
            //         "is_new_user": true
            //     },
            //     "message": "Applicable popups found",
            //     "statusCode": 200
            // }

            console.log('[CouponPopup] API response:', result);

            if (result?.status && result?.data?.aPopups?.length > 0) {
                const { aPopups, is_new_user } = result.data;

                // Priority: if is_new_user → show "new" user_type popups first,
                // then rest. Otherwise show all in order.
                let ordered = [];
                if (is_new_user) {
                    const newUserPopups = aPopups.filter(p => p.user_type === 'new');
                    const otherPopups = aPopups.filter(p => p.user_type !== 'new');
                    ordered = [...newUserPopups, ...otherPopups];
                } else {
                    ordered = aPopups.filter(p => p.user_type !== 'new');
                }

                if (ordered.length > 0) {
                    setPopupQueue(ordered);
                    showPopup(ordered[0]);
                }
            }
        } catch (error) {
            console.log('[CouponPopup] Error fetching popups:', error);
           

            // if (result?.status && result?.data?.aPopups?.length > 0) {
            //     const { aPopups, is_new_user } = result.data;

            //     // Priority: if is_new_user → show "new" user_type popups first,
            //     // then rest. Otherwise show all in order.
            //     let ordered = [];
            //     if (is_new_user) {
            //         const newUserPopups = aPopups.filter(p => p.user_type === 'new');
            //         const otherPopups = aPopups.filter(p => p.user_type !== 'new');
            //         ordered = [...newUserPopups, ...otherPopups];
            //     } else {
            //         ordered = aPopups.filter(p => p.user_type !== 'new');
            //     }

            //     if (ordered.length > 0) {
            //         setPopupQueue(ordered);
            //         showPopup(ordered[0]);
            //     }
            // }
        }
    };

    // ─── Show / hide animations ────────────────────────────────────────────────
    const showPopup = (popup) => {
        // Fetch real image dimensions first, then slide up
        Image.getSize(
            popup.image_url,
            (imgWidth, imgHeight) => {
                // Scale proportionally: width = SCREEN_WIDTH, height = proportional
                const proportionalHeight = (SCREEN_WIDTH / imgWidth) * imgHeight;
                // Cap at MAX_IMAGE_HEIGHT so it never exceeds the screen
                const finalHeight = Math.min(proportionalHeight, MAX_IMAGE_HEIGHT);
                setImageHeight(finalHeight);
                setCurrentPopup(popup);
                setVisible(true);
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    bounciness: 4,
                }).start();
            },
            (_error) => {
                // If getSize fails, fall back to a square and still show
                console.log('[CouponPopup] getSize failed, using fallback height');
                setImageHeight(SCREEN_WIDTH);
                setCurrentPopup(popup);
                setVisible(true);
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    bounciness: 4,
                }).start();
            }
        );
    };

    const hidePopup = (callback) => {
        Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 260,
            useNativeDriver: true,
        }).start(() => {
            setVisible(false);
            setCurrentPopup(null);
            slideAnim.setValue(SCREEN_HEIGHT);
            if (callback) callback();
        });
    };

    // ─── Redirection handler ───────────────────────────────────────────────────
    const handleRedirect = () => {
        console.log('[CouponPopup] Redirecting user based on popup data:', currentPopup);
        
        hidePopup(() => {
            if (!currentPopup) return;
            const { redirection_type, link_id } = currentPopup;
            if (redirection_type === 'category') {
                navigation.navigate('ProductListing', { item: { id: link_id }, from: 'coupon' });
            } else if (redirection_type === 'page') {
                navigation.navigate('CmsPage', { item: currentPopup, from: 'coupon' });
            } else {
                navigation.navigate('ProductDetails', { product: { ...currentPopup, redirection_id: link_id }, from: 'coupon' });
            }
        });
    };

    const handleClose = () => {
        hidePopup();
    };

    if (!visible || !currentPopup) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            {/* Dim background */}
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.overlay} />
            </TouchableWithoutFeedback>

            {/* Slide-up sheet */}
            <Animated.View
                style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
            >
                {/* Close button */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>

                {/* Coupon image — full width, proportional height, fully clickable */}
                <TouchableOpacity activeOpacity={0.9} onPress={handleRedirect}>
                    <Image
                        source={{ uri: currentPopup.image_url }}
                        style={[styles.couponImage, { height: imageHeight }]}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            </Animated.View>
        </Modal>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const SHEET_BORDER_RADIUS = 20;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: SHEET_BORDER_RADIUS,
        borderTopRightRadius: SHEET_BORDER_RADIUS,
        overflow: 'hidden',
        // Max height guard so it never exceeds 85 % of screen
        maxHeight: SCREEN_HEIGHT * 0.85,
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 14,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.55)',
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    couponImage: {
        width: SCREEN_WIDTH,
        // height is set dynamically via state (proportional to real image dimensions)
        borderTopLeftRadius: SHEET_BORDER_RADIUS,
        borderTopRightRadius: SHEET_BORDER_RADIUS,
    },
});

export default CouponPopupBottomSheet;