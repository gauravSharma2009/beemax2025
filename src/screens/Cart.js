import React, { useEffect, useState, useCallback } from "react"
import {
    Text, View, ScrollView, FlatList, Image, TouchableOpacity,
    TextInput, Alert, Dimensions
} from "react-native"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { changeLoadingState } from "../actions/loadingAction"
import { getData } from "../common/asyncStore"
import {
    allCategoryPink, buttonBgColor, categorySaperator, coupanGreen,
    offPurpleColor, textColor, textInputColor, whiteTxtColor
} from "../common/colours"
import { currency } from "../common/strings"
import Header from '../components/Header'
import AntDesign from 'react-native-vector-icons/AntDesign';
import { StackActions } from '@react-navigation/native';
import ValidationView from "../common/ValidationView"
import { server } from "../common/apiConstant"
import AddButton from "../common/AddButton"
import CouponList from "../common/CouponList"
import Ionicons from 'react-native-vector-icons/Ionicons';
import { changeCartCount } from "../actions/cartCount"
import SlotSelection from "../common/SlotSelection"
import { setPopup } from "../actions/message"
import RadioButton from "../common/RadioButton"
import RazorpayCheckout from 'react-native-razorpay';

const SCREEN_WIDTH = Dimensions.get('window').width;
// ─── helpers ─────────────────────────────────────────────────────────────────
const isLateNight = () => {
    const h = new Date().getHours();
    return h >= 22 || h < 5; // 10 PM – 5 AM
};

// Scale fonts down slightly on small / narrow devices so rows don't get messy.
const SMALL = Dimensions.get('window').width < 360
const fs = (n) => (SMALL ? n - 1 : n)

// Darker gray used for product weight / MRP text (feedback: 575757)
const darkGrayColor = "#575757"
// Deal-applied tag colours (feedback: bg dafde1, font 606460, stroke 85c591)
const dealTagBg = "#DAFDE1"
const dealTagBorder = "#85C591"
const dealTagText = "#606460"
// "Shop for ₹X to unlock this deal" font colour (feedback: 0d662b)
const unlockTextColor = "#0D662B"
// Locked steal-deal Add button colour (feedback: e5e5e5)
const lockedAddBg = "#E5E5E5"

// A cart item counts towards the coupon-unlock amount unless it's explicitly
// flagged as not applicable (supports boolean or 0/1 from the API).
const isCouponApplicableItem = (item) => {
    // console.log("Checking coupon applicability for item:", item?.title, "is_coupon_applicable:", item?.is_coupon_applicable)
    if (item?.is_deal_product == '1') {
        return false;
    }
    if (item?.is_coupon_applicable == "1") {
        return true;
    }
    return item?.ignore_coupon_applicable == "1";
}

const getCouponEligibleAmount = (items) => {
    let amount = 0
        ; (items || []).forEach(item => {
            if (isCouponApplicableItem(item)) {
                amount += Number(item.selling_price) * Number(item.QTY)
            }
        })
    return amount
}

// Cart subtotal excluding steal/free deal products, used to decide whether a
// steal deal is unlocked. Computed directly from cartData (not from the
// separately-debounced `totalAmount` state) so it's never one render stale —
// using totalAmount here caused a newly-added deal item's own amount to be
// subtracted from a total that hadn't caught up yet, instantly re-locking
// (and auto-removing) the item that had just been added.
const getNonDealAmount = (items) => {
    let amount = 0
        ; (items || []).forEach(item => {
            if (item?.is_deal_product !== '1') {
                amount += Number(item.subtotal || 0)
            }
        })
    return amount
}

function CartScreen(props) {
    const { navigation, changeLoadingState, changeCartCount, setPopup } = props

    // ── view state ────────────────────────────────────────────────────────────
    const [isCart, setIsCart] = useState(true)
    const [iAddress, setAddress] = useState(false)
    const [isSummary, setSummary] = useState(false)
    const [loadingData, setIsLoading] = useState(true)

    // ── cart / product state ──────────────────────────────────────────────────
    const [cartData, setCartData] = useState([])
    const [outOfStockItems, setOutOfStockItems] = useState([])   // NEW
    const [freeDealData, setFreeDealData] = useState([])

    // ── coupon state ──────────────────────────────────────────────────────────
    const [appliedCoupan, setAppliedCoupan] = useState(null)
    const [coupanCode, setCoupanCode] = useState("")
    const [coupanDiscount, setCoupanDiscount] = useState(0)
    const [coupanData, setCoupanData] = useState(null)
    const [offersList, setOffersList] = useState(null)
    const [coupanAppliedMsg, setCoupanAppliedMsg] = useState("")  // NEW

    // ── fee / summary state from API ──────────────────────────────────────────
    const [applicableFees, setApplicableFees] = useState([])   // NEW
    const [summaryData, setSummaryData] = useState(null)  // aCheckoutSummary

    // ── totals ────────────────────────────────────────────────────────────────
    const [subTotal, setSubTotal] = useState(0)
    const [totalAmount, setTotalAmount] = useState(0)
    const [grandAmount, setGrandAmount] = useState(0)
    const [additionalFeeTotal, setAdditionalFeeTotal] = useState(0)
    const [additionalFeeOriginalTotal, setAdditionalFeeOriginalTotal] = useState(0)
    const [noDiscountTotal, setNoDiscountTotal] = useState(0)
    const [totalSaved, setTotalSaved] = useState(0)

    // ── delivery tip ──────────────────────────────────────────────────────────
    const [selectedTip, setSelectedTip] = useState(null)  // 10 | 20 | 30 | null
    const [tipPanelOpen, setTipPanelOpen] = useState(false)
    const TIP_OPTIONS = [10, 20, 30]

    // ── shipping / address ────────────────────────────────────────────────────
    const [shippingAmount, setShippingAmount] = useState(0)
    const [aShippingDetails, setShippingDetails] = useState(null)
    const [addresses, setAddresses] = useState([])
    const [selectedAddress, setSelectedAddress] = useState(0)
    const [isCodAvailable, setIsCodAvailable] = useState(true)
    const [isShippingAvailable, setIsShippingAvailable] = useState(true)

    // ── slot / instant delivery ───────────────────────────────────────────────
    const [days, setDays] = useState([])
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [selectedDay, setSelectedDay] = useState(null)
    const [instantDelivery, setInstantDelivery] = useState(false)
    const [instantDeliveryText, setInstantDeliveryTxt] = useState(null)
    const [showInstantDelivery, setShowInstantDelivery] = useState(false)
    const [userData, setUserData] = useState(null)

    // ── misc ──────────────────────────────────────────────────────────────────
    const [type, setType] = useState("")
    const [orderNumber, setOrderNo] = useState("")
    const [error, setError] = useState({})

    // ─────────────────────────────────────────────────────────────────────────
    // Recalculate grand total whenever relevant values change
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        let amount = 0;
        let mrpTotal = 0;
        if (cartData) {
            for (let i = 0; i < cartData.length; i++) {
                amount += Number(cartData[i].subtotal)
                mrpTotal += parseFloat(cartData[i].mrp_price) * Number(cartData[i].QTY)
            }
        }
        setSubTotal(amount)
        const afterCoupon = amount - Number(coupanDiscount)
        setTotalAmount(afterCoupon)

        // feeTotal = what's actually charged right now (a FREE/waived fee counts as 0).
        // feeOriginalTotal = what those same fees would have cost without the waiver —
        // this is the same amount the fee row itself shows crossed-out when waived.
        // Mirrors the exact same visibility rules used when rendering the fee rows
        // below, so a fee that's hidden from the bill (e.g. a free small_cart_fee)
        // never contributes to the total either — otherwise the total and what's
        // visibly itemised on screen wouldn't add up.
        let feeTotal = 0;
        let feeOriginalTotal = 0;
        applicableFees.forEach(f => {
            if (!(f.active || f.status_active)) return;
            if (f.code === 'late_night_fee' && !f.active) return;
            const isFreeFee = Number(f.amount) === 0
            if (f.code === 'small_cart_fee' && isFreeFee) return;

            feeTotal += Number(f.amount)
            feeOriginalTotal += isFreeFee && f.configured_amount ? Number(f.configured_amount) : Number(f.amount)
        });
        setAdditionalFeeTotal(feeTotal)
        setAdditionalFeeOriginalTotal(feeOriginalTotal)

        const tip = selectedTip || 0;
        const grand = afterCoupon + feeTotal + tip
        setGrandAmount(grand)
        // setGrandAmount(afterCoupon + Number(shippingAmount) + feeTotal + tip)

        // Gray/cut total shown above "To Pay" = the cut (MRP) amount already
        // shown crossed-out in the Item Total row + any other amount shown as
        // a cut line elsewhere in the bill summary (waived fees' original
        // amount) + tip — i.e. a "grand total" built purely from the figures
        // that are already struck through in the UI.
        const noDiscount = mrpTotal + feeOriginalTotal + tip
        setNoDiscountTotal(noDiscount)
        setTotalSaved(noDiscount - grand)

    }, [cartData, coupanDiscount, shippingAmount, applicableFees, selectedTip])

    // ── free-deal removal when total drops below threshold ────────────────────
    useEffect(() => {
        if (totalAmount > 0 && cartData.length > 0) {
            const dealUnlockAmount = getNonDealAmount(cartData) - Number(coupanDiscount)
            const needToRemove = freeDealData.filter(
                item => parseFloat(dealUnlockAmount) < parseFloat(item.free_deal_on)
            )
            if (needToRemove.length > 0) {
                const filteredItems = cartData.filter(c => needToRemove.find(f => f.id === c.id))
                if (filteredItems.length > 0) removeFromCart(filteredItems)
            }
        }
    }, [totalAmount, cartData, coupanDiscount])

    // ── slot / instant delivery mutual exclusion ──────────────────────────────
    useEffect(() => { if (instantDelivery) { setSelectedSlot(null); setSelectedDay(null) } }, [instantDelivery])
    useEffect(() => { if (selectedSlot) { setInstantDelivery(null) } }, [selectedSlot])

    // ── re-apply coupon when cart changes ─────────────────────────────────────
    useEffect(() => {
        if (appliedCoupan) {
            // Client-side minimum-order check first: don't rely solely on the
            // backend rejecting the re-validation call, since removing items
            // can drop the coupon-eligible amount below the applied coupon's
            // min_order_value and we need to guarantee removal either way.
            const coupon = offersList?.find(o => o.coupon_code === appliedCoupan)
            const eligibleAmount = getCouponEligibleAmount(cartData)
            const minOrderValue = parseFloat(coupon?.min_order_value || 0)
            if (coupon && parseFloat(eligibleAmount) < minOrderValue) {
                setPopup({
                    message: `${appliedCoupan} removed — minimum order value of ${currency}${minOrderValue} no longer met.`,
                    status: "faliure", open: true
                })
                removeCoupan()
                return
            }
            setTimeout(() => applyCoupan(appliedCoupan), 1000)
        }
    }, [cartData, offersList])

    // ── navigation focus ──────────────────────────────────────────────────────
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (!iAddress) { setIsCart(true); setAddress(false); setSummary(false) }
            getAddresses()
        });
        return unsubscribe;
    }, [navigation, selectedAddress, addresses])

    useEffect(() => { getAddresses() }, [selectedAddress])

    // ─────────────────────────────────────────────────────────────────────────
    // API helpers
    // ─────────────────────────────────────────────────────────────────────────
    // Refreshes the bottom-tab cart count badge from the server. Needed after
    // any cart mutation that doesn't already go through AddButton's own
    // add/minus handlers (which do this themselves) — e.g. the automatic
    // free-deal removal below, which calls addtocart directly.
    const refreshCartCount = async () => {
        const uniqueId = await getData("uniqueId")
        try {
            const res = await fetch(`${server}countcartdata/${uniqueId}`, { method: 'GET' })
            const result = await res.json()
            changeCartCount(result.data)
        } catch (e) { console.error('refreshCartCount error', e) }
    }

    const removeFromCart = async (filteredItems) => {
        const loginData = await getData("loginData")
        const userData = JSON.parse(loginData)
        const uniqueId = await getData("uniqueId")
        const headers = { "Content-Type": "application/json" }

        for (const item of filteredItems) {
            const raw = JSON.stringify({
                seller_id: item.SELLER_ID,
                user_id: userData?.USER_ID,
                product_id: item.id,
                device_id: uniqueId,
                qty: -1
            });
            changeLoadingState(true)
            try {
                await fetch(`${server}addtocart`, { method: 'POST', headers, body: raw });
            } catch (e) { console.error('removeFromCart error', e) }
        }
        getCartData()
        refreshCartCount()
    }

    const addToCart = async ({ product, qty }) => {
        const loginData = await getData("loginData")
        const userData = JSON.parse(loginData)
        const uniqueId = await getData("uniqueId")

        // ── per-order quantity limit check (from product.max_qty_per_order) ──
        if (qty > 0 && product.max_qty_per_order) {
            const currentQty = Number(product.QTY || 0)
            if (currentQty >= Number(product.max_qty_per_order)) {
                setPopup({
                    message: `You can only order up to ${product.max_qty_per_order} of this item per order.`,
                    status: "faliure", open: true
                })
                return;
            }
        }

        // ── per-day limit check (from product.max_qty_per_day) ───────────────
        // Backend manages the hard enforcement; we show a friendly message if
        // the backend returns an error in the addtocart response.

        const raw = JSON.stringify({
            seller_id: product.SELLER_ID,
            user_id: userData?.USER_ID,
            product_id: product.id,
            device_id: uniqueId,
            qty
        });
        changeLoadingState(true)
        try {
            const res = await fetch(`${server}addtocart`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: raw
            });
            const result = await res.json();
            changeLoadingState(false)
            if (result?.status) {
                getCartData()
            } else {
                setPopup({ message: result.message, status: "faliure", open: true })
            }
        } catch (e) {
            changeLoadingState(false)
            console.error('addToCart error', e)
        }
    }

    const addItem = (qty, item) => {
        if (item?.QTY >= parseInt(item?.inventory)) {
            Alert.alert("Stock Limit", "Cart quantity can't be more than available inventory.")
            return
        }
        addToCart({ product: item, qty: 1 })
    }
    const minusItem = (qty, item) => addToCart({ product: item, qty: -1 })

    const getAddresses = async () => {
        const loginData = await getData("loginData")
        const userData = JSON.parse(loginData)
        changeLoadingState(true)
        let fetchedAddresses = addresses
        try {
            const res = await fetch(`${server}useraddresslist/${userData?.USER_ID}`, { method: 'GET' });
            const result = await res.json();
            changeLoadingState(false)
            if (result?.status) {
                setAddresses(result.data)
                fetchedAddresses = result.data
            } else if (result.statusCode === 200) {
                setAddresses([])
                fetchedAddresses = []
            }
        } catch (e) { changeLoadingState(false); console.error(e) }
        // Pass the freshly-fetched addresses directly instead of relying on
        // component state, which won't reflect this update until re-render.
        setTimeout(() => getCartData(fetchedAddresses), 500)
    }
    const getCartData = async (addressListOverride) => {
        const uniqueId = await getData("uniqueId")
        const loginData = await getData("loginData")
        const userData = JSON.parse(loginData)
        setUserData(userData)
        console.log("user data : ", userData)
        const addrList = addressListOverride !== undefined ? addressListOverride : addresses

        let url = `${server}cartdata/${uniqueId}/${userData?.USER_ID || ""}`
        if (addrList?.length > 0) {
            url += `/${addrList[selectedAddress].ID}`
        }
        setIsLoading(true)
        changeLoadingState(true)

        console.log("Fetching cart data from URL:", url)
        try {
            const res = await fetch(url, { method: 'GET' });
            const result = await res.json();
            // const result = { "status": true, "data": { "aCartItemDetails": [{ "CART_ID": "59265", "SELLER_ID": "42", "QTY": "1", "subtotal": "350", "weight": "200", "id": "4735", "title": "ORIGINAL Brand Performance Sports Collar Tshirt Black Colour 1Pc (Medium)", "product_type": "simple", "mrp_price": "999", "selling_price": "350", "FIRST_IMAGE": "https://www.staging.beemax.in/media/uploads/product/thumbs/1772957117_rgtewgt.png", "is_deal_product": "0", "inventory": "4", "in_stock": "1", "product_size": "1Pc (Medium)", "max_qty_per_order": null, "max_qty_per_customer_per_day": null, "is_active": false }, { "CART_ID": "59267", "SELLER_ID": "42", "QTY": "1", "subtotal": "43", "weight": "50", "id": "4210", "title": "Beemax Fresh Choice Dalchini 50g /Cinnamon", "product_type": "simple", "mrp_price": "65", "selling_price": "43", "FIRST_IMAGE": "https://www.staging.beemax.in/media/uploads/product/thumbs/1735468748_308.jpg", "is_deal_product": "0", "inventory": "491", "in_stock": "1", "product_size": "1 Pc (50g) ", "max_qty_per_order": null, "max_qty_per_customer_per_day": null, "is_active": true }, { "CART_ID": "59264", "SELLER_ID": "42", "QTY": "3", "subtotal": "1167", "weight": "600", "id": "4786", "title": "Godrej aer Matic Kit Automatic Room Freshener Violet Valley Bloom 225ml  /Air Freshener", "product_type": "simple", "mrp_price": "625", "selling_price": "389", "FIRST_IMAGE": "https://www.staging.beemax.in/media/uploads/product/thumbs/1772945516_1699168745_Untitled_design_(1)_(1).png", "is_deal_product": "0", "inventory": "0", "in_stock": "0", "product_size": "1 Pack   ", "max_qty_per_order": null, "max_qty_per_customer_per_day": null, "is_active": false }], "aCouponOffersList": [{ "id": "1", "coupon_code": "NEWUSER50", "discount": "50", "discount_type": "fixed", "customer_type": "new", "min_order_value": "1.00", "used_max_time": "1", "last_order_check": "7", "restricted_products": "", "coupon_info": "Welome New", "sticky_on_cart": 1, "valid_upto": "2031-01-24" }, { "id": "2", "coupon_code": "WELCOME30", "discount": "30", "discount_type": "fixed", "customer_type": "regular", "min_order_value": "399.00", "used_max_time": "1", "last_order_check": "7", "restricted_products": "", "coupon_info": "Welcome Agian", "sticky_on_cart": 0, "valid_upto": "2031-02-24" }, { "id": "3", "coupon_code": "FAVORITE50", "discount": "50", "discount_type": "fixed", "customer_type": "regular", "min_order_value": "999.00", "used_max_time": "10", "last_order_check": "7", "restricted_products": "4522,4305,2908", "coupon_info": "Flat 50 off on orders above", "sticky_on_cart": 0, "valid_upto": "2031-05-24" }, { "id": "4", "coupon_code": "FAVORITE100", "discount": "100", "discount_type": "fixed", "customer_type": "regular", "min_order_value": "999.00", "used_max_time": "10", "last_order_check": "8", "restricted_products": "4522,4305,2908", "coupon_info": "Flat 100 off on orders above", "sticky_on_cart": 0, "valid_upto": "2033-09-20" }, { "id": "5", "coupon_code": "FAVORITE200", "discount": "200", "discount_type": "fixed", "customer_type": "regular", "min_order_value": "1999.00", "used_max_time": "10", "last_order_check": "7", "restricted_products": "4522,4305,2908", "coupon_info": "Flat 200 off on orders above", "sticky_on_cart": 0, "valid_upto": "2032-09-26" }], "aFreeDealsProList": [{ "id": "48669", "title": "Local Tomato 500g", "urlKey": "local-tomato-500g", "free_deal_product": "1", "free_deal_on": "299", "inventory": "14", "in_stock": "1", "mrp_price": "35", "selling_price": "9", "image_first": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775048338_1761230313_BrowserPreview_tmp_-_2025-10-23T200812.107.jpg", "image_second": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775048338_1761230313_BrowserPreview_tmp_-_2025-10-23T200812.107.jpg", "image_third": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775048338_1761230313_BrowserPreview_tmp_-_2025-10-23T200812.107.jpg", "image_four": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775048338_1761230313_BrowserPreview_tmp_-_2025-10-23T200812.107.jpg" }, { "id": "48673", "title": "Colgate MaxFresh Toothpaste 600g (4x150g)", "urlKey": "colgate-maxfresh-toothpaste-600g-4x150g-", "free_deal_product": "1", "free_deal_on": "299", "inventory": "19", "in_stock": "1", "mrp_price": "544", "selling_price": "349", "image_first": "https://www.staging.beemax.in/media/uploads/product/thumbs/1776485902_1750234729_1741667406_43_(1).jpg", "image_second": "https://www.staging.beemax.in/media/uploads/product/thumbs/1776485902_1750234729_1741667406_43_(1).jpg", "image_third": "https://www.staging.beemax.in/media/uploads/product/thumbs/1776485902_1750234729_1741667406_43_(1).jpg", "image_four": "https://www.staging.beemax.in/media/uploads/product/thumbs/1776485902_1750234729_1741667406_43_(1).jpg" }, { "id": "48674", "title": "Ruchi Golden Keshari Sooji 80g", "urlKey": "ruchi-golden-keshari-sooji-80g", "free_deal_product": "1", "free_deal_on": "299", "inventory": "25", "in_stock": "1", "mrp_price": "10", "selling_price": "5", "image_first": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775045287_green_color_mockup.png", "image_second": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775045287_green_color_mockup.png", "image_third": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775045287_green_color_mockup.png", "image_four": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775045287_green_color_mockup.png" }, { "id": "48675", "title": "Smiley Face Bouncy Ball 1Pc", "urlKey": "smiley-face-bouncy-ball-1pc", "free_deal_product": "1", "free_deal_on": "299", "inventory": "37", "in_stock": "1", "mrp_price": "35", "selling_price": "10", "image_first": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775047205_61yLqkmcN9L._AC_UF894,1000_QL80_.jpg", "image_second": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775047205_61yLqkmcN9L._AC_UF894,1000_QL80_.jpg", "image_third": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775047205_61yLqkmcN9L._AC_UF894,1000_QL80_.jpg", "image_four": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775047205_61yLqkmcN9L._AC_UF894,1000_QL80_.jpg" }, { "id": "48676", "title": "Set Wet Styling Hair Gel 100ml", "urlKey": "set-wet-styling-hair-gel-100ml", "free_deal_product": "1", "free_deal_on": "299", "inventory": "50", "in_stock": "1", "mrp_price": "100", "selling_price": "59", "image_first": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775048475_1724595128_19.jpg", "image_second": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775048475_1724595128_19.jpg", "image_third": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775048475_1724595128_19.jpg", "image_four": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775048475_1724595128_19.jpg" }, { "id": "48677", "title": "Lemon ( nimbu )", "urlKey": "lemon-nimbu-", "free_deal_product": "1", "free_deal_on": "299", "inventory": "23", "in_stock": "1", "mrp_price": "23", "selling_price": "9", "image_first": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775108513_1767412745_-lemon_(1).png", "image_second": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775108513_1767412745_-lemon_(1).png", "image_third": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775108513_1767412745_-lemon_(1).png", "image_four": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775108513_1767412745_-lemon_(1).png" }, { "id": "48678", "title": "Amul Moti Homogenised Toned Milk 450ml", "urlKey": "amul-moti-homogenised-toned-milk-450ml", "free_deal_product": "1", "free_deal_on": "299", "inventory": "40", "in_stock": "1", "mrp_price": "30", "selling_price": "10", "image_first": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775128374_1695482070_36.jpg", "image_second": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775128374_1695482070_36.jpg", "image_third": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775128374_1695482070_36.jpg", "image_four": "https://www.staging.beemax.in/media/uploads/product/thumbs/1775128374_1695482070_36.jpg" }, { "id": "4776", "title": "Godrej aer Matic Kit Automatic Room Freshener Violet Valley Bloom 225ml", "urlKey": "godrej-aer-matic-kit-automatic-room-freshener-violet-valley-bloom-225ml", "free_deal_product": "1", "free_deal_on": "299", "inventory": "7", "in_stock": "1", "mrp_price": "625", "selling_price": "375", "image_first": "https://www.staging.beemax.in/media/uploads/product/thumbs/1772796199_1699168745_Untitled_design_(1).png", "image_second": "https://www.staging.beemax.in/media/uploads/product/thumbs/1772796199_1699168745_34.jpg", "image_third": "https://www.staging.beemax.in/media/uploads/product/thumbs/1772796199_1699168745_Untitled_design_(1).png", "image_four": "https://www.staging.beemax.in/media/uploads/product/thumbs/1772796200_1699168745_34.jpg" }, { "id": "4856", "title": "Johnson's Baby Shampoo 50ml", "urlKey": "johnson-s-baby-shampoo-50ml", "free_deal_product": "1", "free_deal_on": "299", "inventory": "18", "in_stock": "1", "mrp_price": "70", "selling_price": "45", "image_first": "https://www.staging.beemax.in/media/uploads/product/thumbs/1774323376_1755505159_BrowserPreview_tmp_-_2025-08-18T134329.567.jpg", "image_second": "https://www.staging.beemax.in/media/uploads/product/thumbs/1774323403_1755505159_BrowserPreview_tmp_-_2025-08-18T134329.567.jpg", "image_third": "https://www.staging.beemax.in/media/uploads/product/thumbs/1774323403_1755505159_BrowserPreview_tmp_-_2025-08-18T134329.567.jpg", "image_four": "https://www.staging.beemax.in/media/uploads/product/thumbs/1774323403_1755505159_BrowserPreview_tmp_-_2025-08-18T134329.567.jpg" }], "aDeliveryTips": { "header": { "title": "Delivery Tip", "description": "A small tip means a lot..." }, "amounts": [{ "id": "1", "amount": "10.00" }, { "id": "2", "amount": "20.00" }, { "id": "3", "amount": "30.00" }] } }, "message": "Please find data", "statusCode": 200 };

            console.log("Cart Data", result)
            changeLoadingState(false)
            setIsLoading(false)

            if (result?.data?.aCartItemDetails) {
                console.log("Cart Data Items", result.data.aCartItemDetails)
                const d = result.data

                setIsCodAvailable(d.isCodAvailable)
                setIsShippingAvailable(d.isShippingAvailable)

                // ── Split in-stock vs out-of-stock / inactive items ────────────
                const inStock = []
                const outStock = []
                d.aCartItemDetails.forEach(item => {
                    // Auto-adjust qty to current inventory if cart qty > stock
                    const inventoryNum = parseInt(item.inventory || 0)
                    const cartQty = parseInt(item.QTY || 0)
                    const isInactive = item.is_active === false || item.is_active === "false" || item.is_active === 0 || item.is_active === "0"
                    if (
                        isInactive ||
                        item.in_stock === "0" ||
                        item.in_stock === 0 ||
                        item.is_deleted === "1" ||
                        !item.in_stock ||
                        inventoryNum === 0
                    ) {
                        outStock.push(item)
                    } else {
                        // If cart has more than available, show capped item
                        inStock.push({
                            ...item,
                            QTY: cartQty > inventoryNum ? inventoryNum : item.QTY,
                            subtotal: (
                                parseFloat(item.selling_price) *
                                (cartQty > inventoryNum ? inventoryNum : cartQty)
                            ).toFixed(0)
                        })
                    }
                })
                setOutOfStockItems(outStock)
                setCartData(inStock)

                // ── Free deal items ────────────────────────────────────────────
                const modifiedFreeDealData = d.aFreeDealsProList?.map(item => {
                    const isAddedTOCart = inStock.some(c => c.id === item.id)
                    return { ...item, isAddedTOCart }
                }) || []
                setFreeDealData(modifiedFreeDealData)

                // ── Applicable fees from backend ───────────────────────────────
                setApplicableFees(d.aApplicableFeeDetails || [])
                console.log("aCouponOffersList :", d.aCouponOffersList)
                // ── Coupon list ────────────────────────────────────────────────
                setOffersList(d.aCouponOffersList)

                // ── Delivery slots ─────────────────────────────────────────────
                setDays(d.aDeliverySlots)
                setInstantDeliveryTxt(d.instantDelivery)
                setShowInstantDelivery(d.instantDeliveryStatus)

                // ── Shipping ───────────────────────────────────────────────────
                if (d.aShippingDetails) {
                    setShippingAmount(Number(d.aShippingDetails.shipping_charge))
                    setShippingDetails(d.aShippingDetails)
                } else {
                    setShippingAmount(0)
                    setShippingDetails(null)
                }
            } else {
                setCartData([])
                setOutOfStockItems([])
            }
        } catch (e) {
            changeLoadingState(false)
            setIsLoading(false)
            console.error('getCartData error', e)
        }
    }

    const removeItem = async (item) => {
        const raw = JSON.stringify({ cart_id: item.CART_ID });
        changeLoadingState(true)
        try {
            const res = await fetch(`${server}removecartitem`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: raw
            });
            const result = await res.json();
            changeLoadingState(false)
            if (result?.status) getCartData()
        } catch (e) { changeLoadingState(false); console.error(e) }
    }

    const applyCoupan = async (code, from) => {
        const uniqueId = await getData("uniqueId")
        const loginData = await getData("loginData")
        const userData = JSON.parse(loginData)

        let amount = 0;
        cartData.forEach(item => { amount += Number(item.subtotal) })
        setSubTotal(amount)

        // Only items marked is_coupon_applicable count towards the amount
        // used to unlock/validate a coupon.
        const couponEligibleAmount = getCouponEligibleAmount(cartData)

        if (!code) {
            setError({ CoupanCode: "Please enter coupon code" })
            return;
        }
        setError({})

        const raw = JSON.stringify({
            coupon_code: code,
            total: "" + couponEligibleAmount,
            device_id: uniqueId,
            user_id: userData?.USER_ID
        });
        changeLoadingState(true)
        try {
            const res = await fetch(`${server}applycoupondiscount`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: raw
            });
            const result = await res.json();
            console.log("applyCoupan result", result)
            changeLoadingState(false)
            if (result?.status) {
                if (from === "coupan")
                    setPopup({ message: result.message, status: "success", open: true })
                setCoupanDiscount(result.data.iCouponDiscount)
                setCoupanData(result.data)
                setAppliedCoupan(code)
                setCoupanAppliedMsg(result.message || "")
            } else {
                if (from === "coupan") {
                    setPopup({ message: result.message, status: "faliure", open: true })
                    setCoupanDiscount(0)
                    setCoupanData(null)
                } else {
                    // Auto re-validation (cart changed) failed — e.g. removing
                    // items dropped the total below the coupon's minimum order
                    // value. The coupon no longer qualifies, so remove it
                    // entirely instead of leaving a stale "applied" banner
                    // with a zero discount.
                    setPopup({
                        message: result.message || `${code} removed — minimum order value no longer met.`,
                        status: "faliure", open: true
                    })
                    removeCoupan()
                }
            }
        } catch (e) { changeLoadingState(false); console.error(e) }
    }

    const removeCoupan = () => {
        setAppliedCoupan(null)
        setCoupanDiscount(0)
        setCoupanData(null)
        setCoupanCode("")
        setCoupanAppliedMsg("")
    }

    // ── open the full Coupon & Offers screen ──────────────────────────────────
    const openCouponScreen = () => {

        if (!userData) {
            navigation.navigate("LoginFlow", { from: "cart" })
            return
        }
        navigation.navigate("CouponOffers", {
            offersList: offersList || [],
            couponEligibleAmount: getCouponEligibleAmount(cartData),
            appliedCoupon: appliedCoupan,
            onApply: (code) => applyCoupan(code, "coupan"),
            onRemove: removeCoupan,
        })
    }

    // ── tip helpers ───────────────────────────────────────────────────────────
    const handleTip = (amount) => {
        setSelectedTip(prev => prev === amount ? null : amount)
    }
    const removeTip = () => {
        setSelectedTip(null)
        setTipPanelOpen(false)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Navigation helpers
    // ─────────────────────────────────────────────────────────────────────────
    const back = () => {
        if (isCart) { navigation.navigate("Tabs") }
        else if (iAddress) { setAddress(false); setIsCart(true) }
        else {
            navigation.dispatch(StackActions.replace('Cart'))
        }
    }

    const redirectToAddress = async () => {
        const login = await getData("isLogin")
        if (login && login === 'true') {
            getCartData()
            setIsCart(false)
            setAddress(true)
        } else {
            navigation.navigate("LoginFlow", { from: "cart" })
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Place order
    // ─────────────────────────────────────────────────────────────────────────
    const placeOrder = async () => {
        if (!type) return;
        if (!selectedSlot && !instantDelivery) {
            setPopup({ message: "Please select delivery slot first.", status: "faliure", open: true })
            return;
        }

        const uniqueId = await getData("uniqueId")
        const loginData = await getData("loginData")
        const userData = JSON.parse(loginData)
        const todayDate = new Date()

        const orderPayload = {
            device_id: uniqueId,
            user_id: userData?.USER_ID,
            address_id: addresses[selectedAddress].ID,
            sub_total: "" + subTotal,
            coupon_used: coupanDiscount > 0 ? "y" : "n",
            coupon_code: coupanDiscount > 0 ? appliedCoupan : "",
            discount_percent: coupanData ? coupanData.iCouponPercent : '',
            discount_amount: coupanData ? "" + coupanData.iCouponDiscount : '',
            shipping_type: aShippingDetails?.shipping_type,
            shipping_charge: aShippingDetails?.shipping_charge,
            delivery_tip: selectedTip ? "" + selectedTip : "0",
            additional_fee_total: "" + additionalFeeTotal,
            grand_total: "" + grandAmount,
            payment_method: type === 'ONLINE' ? type : "Cash On Delivery",
            grocery_delivery_date: instantDelivery
                ? `${todayDate.getDate()}-${todayDate.getMonth() + 1}-${todayDate.getFullYear()}`
                : selectedDay,
            grocery_delivery_time: instantDelivery ? instantDeliveryText : selectedSlot?.TIME_DETAILS,
        };

        if (type === 'ONLINE') {
            changeLoadingState(true)
            try {
                const res = await fetch(`${server}orderplace`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(orderPayload)
                });
                const result = await res.json();
                changeLoadingState(false)
                if (result?.status) {
                    const options = {
                        description: 'Credits towards consultation',
                        currency: 'INR',
                        key: "rzp_live_GLNDBQJScCfN8J",
                        amount: '' + (grandAmount * 100),
                        name: 'Payment',
                        prefill: { email: 'void@razorpay.com', contact: '', name: 'Razorpay Software' },
                        theme: { color: '#F37254' }
                    }
                    RazorpayCheckout.open(options).then(async (data) => {
                        if (data?.razorpay_payment_id) {
                            const pRes = await fetch(`${server}payment_response`, {
                                method: 'POST',
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    payment_status_code: "200",
                                    payment_status: "Complete",
                                    unique_order_id: result?.data?.oder_id,
                                    bank_transaction_id: data?.razorpay_payment_id
                                })
                            });
                            const pResult = await pRes.json();
                            if (pResult?.status) {
                                setSummary(true); setAddress(false); setIsCart(false)
                                setSummaryData(pResult.data)
                                setOrderNo(pResult.data?.oder_id)
                                changeCartCount(0)
                                setSelectedTip(null)
                            }
                        }
                    }).catch(err => Alert.alert("Payment Error", `${err.code} | ${err.description}`))
                } else {
                    setPopup({ message: result.message, status: "faliure", open: true })
                }
            } catch (e) { changeLoadingState(false); console.error(e) }
            return;
        }

        // COD
        changeLoadingState(true)
        console.log("URL : :", `${server}orderplace`)
        console.log("Placing order with payload (stringified):", JSON.stringify(orderPayload))
        try {
            const res = await fetch(`${server}orderplace`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderPayload)
            });
            const result = await res.json();
            console.log("Order placement result:", result)
            changeLoadingState(false)
            if (result?.status) {
                setSummary(true); setAddress(false); setIsCart(false)
                setSummaryData(result.data)
                setOrderNo(result.data?.oder_id)
                changeCartCount(0)
                setSelectedTip(null)
            } else {
                setPopup({ message: result.message, status: "faliure", open: true })
            }
        } catch (e) { changeLoadingState(false); console.error(e) }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Render helpers
    // ─────────────────────────────────────────────────────────────────────────

    /** Remove all out-of-stock / inactive items via API, then refresh cart */
    const removeAllUnavailableItems = async () => {
        const headers = { "Content-Type": "application/json" }
        changeLoadingState(true)
        for (const item of outOfStockItems) {
            const raw = JSON.stringify({ cart_id: item.CART_ID });
            try {
                console.log('Removing unavailable item', raw)
                await fetch(`${server}removecartitem`, { method: 'POST', headers, body: raw });
            } catch (e) { console.error('removeAllUnavailableItems error', e) }
        }
        changeLoadingState(false)
        getCartData()
    }

    /** Out-of-stock / inactive item box */
    const renderOutOfStockBox = () => {
        if (!outOfStockItems || outOfStockItems.length === 0) return null;
        return (
            <View style={{
                marginHorizontal: 10, marginTop: 10, borderRadius: 10,
                backgroundColor: '#fff', overflow: 'hidden'
            }}>
                {/* Header row */}
                <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingHorizontal: 12, paddingVertical: 8,
                    justifyContent: 'space-between'
                }}>
                    <Text style={{ color: '#FF4B4B', fontFamily: 'Poppins-SemiBold', fontSize: 14 }}>
                        Items are not in stock
                    </Text>
                    <TouchableOpacity onPress={removeAllUnavailableItems}>
                        {/* <AntDesign name="closecircle" size={20} color="#FF4B4B" /> */}
                        <Image
                            source={require('../../assets/icons/nw-cross.png')}
                            style={{ width: 24, height: 24, resizeMode: 'contain' }}
                        />
                    </TouchableOpacity>
                </View>
                {/* List */}
                {outOfStockItems.map((item, idx) => (
                    <View key={"oos" + idx} style={{
                        flexDirection: 'row', alignItems: 'center',
                        paddingHorizontal: 12, paddingVertical: 8,
                        // borderTopWidth: idx === 0 ? 0 : 1, borderTopColor: categorySaperator
                    }}>
                        <Image
                            source={{ uri: item.FIRST_IMAGE }}
                            style={{ width: 40, height: 40, borderRadius: 6, resizeMode: 'contain', borderWidth: 1, borderColor: '#e8eaef' }}
                        />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text numberOfLines={1} style={{
                                fontFamily: 'Poppins-Medium', color: textColor, fontSize: 13
                            }}>{item.title}</Text>
                            <Text style={{ fontFamily: 'Poppins-Regular', color: textInputColor, fontSize: 11 }}>
                                {item.QTY} unit{item.QTY > 1 ? "s" : ""} • {item.product_size || ""}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        )
    }

    // Apply (unapplied state) and Remove (applied state) buttons must share the
    // same width/alignment so the row doesn't jump when a coupon is applied.
    const couponActionBtnStyle = {
        borderWidth: 1, borderColor: '#999', borderRadius: 6, width: 75,
        paddingVertical: 6, marginRight: 5, alignItems: 'center',
        justifyContent: 'center', alignSelf: 'center'
    }

    /** Coupon & offers section (image 5 – left/right states) */
    const renderCouponSection = () => {
        return (
            <View style={{
                marginHorizontal: 10, marginTop: 12,
                borderRadius: 10, backgroundColor: '#fff',
                borderWidth: 1, borderColor: categorySaperator,
                overflow: 'hidden'
            }}>
                <Text style={{
                    fontFamily: 'Poppins-SemiBold', fontSize: 15, color: textColor,
                    paddingHorizontal: 12, paddingVertical: 10
                }}>Coupons & offers</Text>

                {/* Applied coupon banner */}
                {appliedCoupan ? (
                    <View style={{
                        flexDirection: 'row', alignItems: 'center',
                        backgroundColor: '#ffffff', paddingHorizontal: 12,
                        paddingVertical: 8, justifyContent: 'space-between',
                        borderTopWidth: 1, borderTopColor: categorySaperator
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 }}>
                            <View style={{width: 30, height: 30, justifyContent: 'center', alignItems: 'center',
                                 borderRadius: 5, borderWidth:1 , borderColor:"#D0D0D0"}}>
                                <Image
                                    source={require('../../assets/icons/percent_icon.png')}
                                    style={{ width: 24, height: 24, resizeMode: 'contain' }}
                                />
                            </View>
                            <View style={{ marginLeft: 8, flex: 1 }}>
                                <Text numberOfLines={1} style={{ fontFamily: 'Poppins-SemiBold', color: coupanGreen, fontSize: fs(13) }}>
                                    Save ₹{coupanDiscount} with {appliedCoupan}
                                </Text>
                                <TouchableOpacity onPress={openCouponScreen}>
                                    <Text style={{ fontFamily: 'Poppins-Regular', color: buttonBgColor, fontSize: fs(12) }}>
                                        View all coupons &gt;
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={removeCoupan}
                            style={couponActionBtnStyle}>
                            <Text style={{ fontFamily: 'Poppins-Medium', color: textColor, fontSize: fs(13) }}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                        paddingHorizontal: 12, paddingVertical: 2,
                        borderTopWidth: 0, borderTopColor: categorySaperator
                    }}>
                        {/* {console.log("Offers List", offersList)} */}

                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 }}>
                            <View style={{width: 30, height: 30, justifyContent: 'center', alignItems: 'center',
                                 borderRadius: 5, borderWidth:1 , borderColor:"#D0D0D0"}}>
                                <Image
                                    source={require('../../assets/icons/percent_icon.png')}
                                    style={{ width: 24, height: 24, resizeMode: 'contain' }}
                                />
                            </View>

                            <View style={{ marginLeft: 8, flex: 1 }}>
                                {offersList && offersList.filter(o => o.sticky_on_cart).length > 0 ? (
                                    <>
                                        <Text numberOfLines={1} style={{ fontFamily: 'Poppins-SemiBold', color: coupanGreen, fontSize: fs(13) }}>
                                            Save ₹{offersList.find(o => o.sticky_on_cart)?.discount} with {offersList.find(o => o.sticky_on_cart)?.coupon_code}
                                        </Text>
                                        <TouchableOpacity onPress={openCouponScreen}>
                                            <Text style={{ fontFamily: 'Poppins-Regular', color: buttonBgColor, fontSize: fs(12) }}>
                                                View all coupons &gt;
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <Text numberOfLines={1} style={{ fontFamily: 'Poppins-Regular', color: textColor, fontSize: fs(13) }}>
                                        {userData ? "Apply a coupon code" : "Login to unlock all Offers!"}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                if (!userData) {
                                    navigation.navigate("LoginFlow", { from: "cart" })
                                    return
                                }
                                const sticky = offersList?.find(o => o.sticky_on_cart)
                                if (sticky) {
                                    applyCoupan(sticky.coupon_code, "coupan")
                                } else {
                                    openCouponScreen()
                                }
                            }}
                            style={couponActionBtnStyle}>
                            <Text style={{ fontFamily: 'Poppins-Medium', color: textColor, fontSize: fs(13) }}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        )
    }

    /** Free / Steal Deals horizontal scroll (image 5) */
    const renderStealDeals = () => {
        // console.log("Free Deal Data", freeDealData)
        if (!freeDealData || freeDealData.length === 0) return null;
        return (
            <View style={{
                marginHorizontal: 10, marginTop: 12,
                borderRadius: 10, borderWidth: 1, borderColor: categorySaperator,
                backgroundColor: '#fff', overflow: 'hidden'
            }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 }}>
                    <View style={{
                        backgroundColor: coupanGreen, borderRadius: 6,
                        paddingHorizontal: 10, paddingVertical: 3, marginRight: 8
                    }}>
                        <Text style={{ color: '#fff', fontFamily: 'Poppins-Bold', fontSize: 11 }}>STEAL DEALS</Text>
                    </View>
                    <Text style={{ fontFamily: 'Poppins-SemiBold', color: textColor, fontSize: 14 }}>More Deals for you</Text>
                </View>
                {/* Horizontal list */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 12, paddingBottom: 10 }} contentContainerStyle={{ paddingRight: 12 }}>
                    {(() => { const dealUnlockAmount = getNonDealAmount(cartData) - Number(coupanDiscount); return freeDealData.map((item, idx) => {
                        const isUnlocked = parseFloat(dealUnlockAmount) >= parseFloat(item.free_deal_on)
                        return (
                            <View key={"deal" + idx} style={{
                                width: 245, marginRight: 10, borderRadius: 14,
                                borderWidth: 1, borderColor: categorySaperator,
                                backgroundColor: '#fff', overflow: 'hidden', marginBottom: 10
                            }}>
                                <View style={{ flex: 1, flexDirection: 'row', padding: 10 }}>
                                    <TouchableOpacity onPress={() => navigation.navigate("ProductDetails", { product: item })}>
                                        <Image
                                            source={{ uri: item.image_first }}
                                            style={{
                                                width: 66, height: 66, borderRadius: 8, resizeMode: 'contain',
                                                borderWidth: 1, borderColor: categorySaperator
                                            }}
                                        />
                                    </TouchableOpacity>
                                    <View style={{ flex: 1, marginLeft: 10, justifyContent: 'space-between' }}>
                                        <Text numberOfLines={2} style={{
                                            fontFamily: 'Poppins-Regular', color: textColor, fontSize: 11, lineHeight: 15, minHeight: 30
                                        }}>{item.title}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={{ fontFamily: 'Poppins-Bold', color: textColor, fontSize: 12 }}>
                                                    ₹{item.selling_price}
                                                </Text>
                                                <Text style={{
                                                    fontFamily: 'Poppins-Regular', color: '#575757',
                                                    fontSize: 9, textDecorationLine: 'line-through', marginLeft: 4
                                                }}>₹{item.mrp_price}</Text>
                                            </View>
                                            <AddButton
                                                isAddedToCart={item.isAddedTOCart}
                                                stealDealTheme={true}
                                                isAddBlocked={!isUnlocked}
                                                callBack={getCartData}
                                                changeLoadingState={changeLoadingState}
                                                addItem={addItem}
                                                minusItem={minusItem}
                                                item={{ ...item, qty_added_in_cart: item.QTY }}
                                            />
                                        </View>
                                    </View>
                                </View>
                                <View style={{ backgroundColor: '#EAF7EC', paddingVertical: 7, alignItems: 'center' }}>
                                    <Text style={{
                                        fontFamily: 'Poppins-Medium', color: "#0d662b", fontSize: 11
                                    }}>Shop for ₹{item.free_deal_on} to unlock this deal</Text>
                                </View>
                            </View>
                        )
                    }) })()}
                </ScrollView>
            </View>
        )
    }
    const [titleWidths, setTitleWidths] = useState({});
    /** Bill Summary section with dynamic fees (images 5, 6) */
    const renderBillSummary = () => {
        // Determine which fees to show from aApplicableFeeDetails
        // active=true  → show; active=false → hide
        // amount=0 & active=true → show "FREE"
        // late_night_fee shown only if isLateNight() or backend sends it active
        const feeRows = applicableFees.filter(f => f.active || f.status_active)

        return (
            <View style={{
                marginHorizontal: 0, marginTop: 12,
                borderRadius: 10, borderWidth: 0, borderColor: categorySaperator,
                overflow: 'hidden', marginBottom: 4,
            }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingTop: 6, paddingBottom: 10 }}>
                    <Image
                        source={require('../../assets/icons/bill_summary.png')}
                        style={{ width: 30, height: 30, resizeMode: 'contain' }}
                    />
                    <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16, color: textColor, marginLeft: 8, marginTop: 2 }}>
                        Bill Summary
                    </Text>
                </View>
                <View style={{ height: 1, backgroundColor: categorySaperator }} />

                {/* Item Total */}
                <BillRow
                    label="Item Total"
                    mrpValue={(() => {
                        let mrp = 0;
                        cartData.forEach(i => { mrp += parseFloat(i.mrp_price) * Number(i.QTY) })
                        return mrp
                    })()}
                    value={subTotal}

                />

                {/* Coupon line – shown always when applied (image 5 right) */}
                {appliedCoupan && coupanDiscount > 0 && (
                    <>
                        <View style={{
                            flexDirection: 'row', justifyContent: 'space-between',
                            paddingHorizontal: 12, paddingVertical: 6
                        }}>
                            <View>
                                <Text style={{ fontFamily: 'Poppins-SemiBold', color: coupanGreen, fontSize: 13 }}>
                                    {appliedCoupan} Coupon Applied
                                </Text>
                                <Text style={{ fontFamily: 'Poppins-Regular', color: textInputColor, fontSize: 11 }}>
                                    Some items are not eligible
                                </Text>
                            </View>
                            <Text style={{ fontFamily: 'Poppins-SemiBold', color: coupanGreen, fontSize: 13 }}>
                                -{currency}{coupanDiscount}
                            </Text>
                        </View>
                    </>
                )}

                {/* Dynamic fee rows from backend */}
                {console.log("Fee Rows", feeRows)}
                {feeRows.map((fee, idx) => {
                    if (fee.code === 'late_night_fee' && !fee.active) return null;
                    const isFree = fee.amount === 0 || fee.amount === "0"
                    if (fee.code === 'small_cart_fee' && isFree) return null;

                    const hasSubHeading = fee.sub_heading && String(fee.sub_heading).trim().length > 0;

                    return (
                        <View key={"fee" + idx} style={{
                            flexDirection: 'row', justifyContent: 'space-between',
                            paddingHorizontal: 12, paddingVertical: 6
                        }}>
                            <View style={{ flexShrink: 1 }}>
                                <Text style={{ fontFamily: 'Poppins-Regular', color: textColor, fontSize: 13 }}>
                                    {fee.title}
                                    {fee.applicable === false ? (
                                        <Text style={{ color: textInputColor, fontSize: 11 }}>
                                            {fee.code === 'small_cart_fee'
                                                ? `\nNo small cart fee on orders above ₹${fee.condition_amount}`
                                                : ""}
                                        </Text>
                                    ) : null}
                                </Text>

                                {hasSubHeading && (
                                    <>
                                        <View
                                            style={{
                                                width: SCREEN_WIDTH * 0.5,
                                                borderBottomWidth: 1,
                                                borderStyle: 'dashed',
                                                borderColor: categorySaperator,
                                                marginVertical: 3,
                                            }}
                                        />
                                        <Text style={{ fontFamily: 'Poppins-Regular', color: textInputColor, fontSize: 11 }}>
                                            {fee.sub_heading}
                                        </Text>
                                    </>
                                )}
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {fee.configured_amount && Number(fee.configured_amount) !== Number(fee.amount) ? (
                                    <Text style={{
                                        fontFamily: 'Poppins-Regular', color: textInputColor,
                                        textDecorationLine: 'line-through', fontSize: 12, marginRight: 4
                                    }}>
                                        ₹{fee.configured_amount}
                                    </Text>
                                ) : null}
                                <Text style={{
                                    fontFamily: 'Poppins-Medium',
                                    color: isFree ? coupanGreen : textColor,
                                    fontSize: 13
                                }}>
                                    {isFree ? "FREE" : `${currency}${fee.amount}`}
                                </Text>
                            </View>
                        </View>
                    )
                })}

                {/* Delivery Tip – fixed options 10, 20, 30 (image 6) */}
                <View style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'Poppins-Regular', color: textColor, fontSize: 13 }}>
                                Delivery Tip
                            </Text>
                            {selectedTip ? (
                                <TouchableOpacity
                                    onPress={removeTip}
                                    style={{
                                        marginLeft: 10, borderRadius: 6, borderWidth: 1,
                                        borderColor: allCategoryPink, backgroundColor: '#FDEAF0',
                                        paddingHorizontal: 14, paddingVertical: 5
                                    }}>
                                    <Text style={{ fontFamily: 'Poppins-Medium', color: allCategoryPink, fontSize: 12 }}>
                                        Remove
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    onPress={() => setTipPanelOpen(true)}
                                    style={{
                                        marginLeft: 10, borderRadius: 6, borderWidth: 1,
                                        borderColor: coupanGreen, backgroundColor: '#F0FFF4',
                                        paddingHorizontal: 14, paddingVertical: 5
                                    }}>
                                    <Text style={{ fontFamily: 'Poppins-Medium', color: coupanGreen, fontSize: 12 }}>
                                        Add
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        {selectedTip ? (
                            <Text style={{ fontFamily: 'Poppins-SemiBold', color: textColor, fontSize: 14 }}>
                                ₹{selectedTip}
                            </Text>
                        ) : null}
                    </View>
                    <Text style={{ fontFamily: 'Poppins-Regular', color: textInputColor, fontSize: 11, marginTop: 2 }}>
                        A small tip means a lot...
                    </Text>

                    {/* Tip options – only shown once the panel is opened via Add */}
                    {tipPanelOpen && (
                        <View style={{ flexDirection: 'row', marginTop: 8 }}>
                            {TIP_OPTIONS.map(amount => (
                                <TouchableOpacity
                                    key={"tip" + amount}
                                    onPress={() => handleTip(amount)}
                                    style={{
                                        marginRight: 8, borderRadius: 6, borderWidth: 1,
                                        borderColor: selectedTip === amount ? coupanGreen : categorySaperator,
                                        paddingHorizontal: 12, paddingVertical: 5,
                                        backgroundColor: selectedTip === amount ? coupanGreen : '#fff'
                                    }}>
                                    <Text style={{
                                        fontFamily: 'Poppins-Medium',
                                        color: selectedTip === amount ? '#fff' : textColor,
                                        fontSize: 13
                                    }}>₹{amount}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: categorySaperator, marginHorizontal: 12, marginVertical: 4 }} />

                {/* To Pay */}
                <View style={{
                    flexDirection: 'row', justifyContent: 'space-between',
                    paddingHorizontal: 12, paddingVertical: 10
                }}>
                    <Text style={{ fontFamily: 'Poppins-SemiBold', color: textColor, fontSize: 16 }}>To Pay</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{
                            fontFamily: 'Poppins-Regular', color: textInputColor,
                            textDecorationLine: 'line-through', fontSize: 14, marginRight: 6
                        }}>
                            {currency}{noDiscountTotal}
                        </Text>
                        <Text style={{ fontFamily: 'Poppins-SemiBold', color: textColor, fontSize: 16 }}>
                            {currency}{grandAmount}
                        </Text>
                    </View>
                </View>

                {/* Savings badge */}
                {totalSaved > 0 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'center', paddingBottom: 10 }}>
                        <Image
                            style={{ width: 18, height: 18, tintColor: coupanGreen }}
                            source={require('../../assets/discount.png')}
                        />
                        <Text style={{
                            color: coupanGreen, fontFamily: 'Poppins-SemiBold',
                            alignSelf: 'center', fontSize: 13, marginLeft: 4
                        }}>
                            ₹ {totalSaved} Saved!
                            <Text style={{ fontSize: 11, fontFamily: 'Poppins-Regular' }}> on this order</Text>
                        </Text>
                    </View>
                )}
            </View>
        )
    }

    /** Single cart item row */
    const renderItem = ({ item }) => {
        if (!item.QTY || item.QTY === "0") return null;
        return (
            <View style={{
                flexDirection: "row", marginTop: 0, padding: 10,
                alignItems: 'flex-start'
            }}>
                {/* Product image – pinned to top */}
                <TouchableOpacity
                    onPress={() => navigation.navigate("ProductDetails", { product: item })}
                    style={{ marginRight: 10 }}>
                    <Image
                        style={{
                            width: 76, height: 76, borderWidth: 1,
                            borderColor: categorySaperator, borderRadius: 8,
                            resizeMode: 'contain'
                        }}
                        source={{ uri: item.FIRST_IMAGE }}
                    />
                </TouchableOpacity>

                {/* Middle – title, size, badges */}
                <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text numberOfLines={2} style={{
                        fontFamily: 'Poppins-Medium', color: textColor, fontSize: fs(11), lineHeight: fs(15)
                    }}>{item.title}</Text>

                    {item.product_size ? (
                        <Text style={{ fontFamily: 'Poppins-Regular', color: darkGrayColor, fontSize: fs(13), marginTop: 2 }}>
                            {item.product_size}
                        </Text>
                    ) : null}

                    {item.is_deal_product === '1' && (
                        <View style={{
                            flexDirection: 'row', alignItems: 'center', marginTop: 5,
                            alignSelf: 'flex-start', backgroundColor: dealTagBg,
                            borderWidth: 1, borderColor: dealTagBorder, borderRadius: 6,
                            paddingHorizontal: 8, paddingVertical: 3
                        }}>
                            <Image
                                source={require('../../assets/icons/check_right.png')}
                                style={{ width: 14, height: 14, resizeMode: 'contain', }}
                            />

                            <Text style={{ color: coupanGreen, fontSize: fs(12), fontFamily: 'Poppins-Medium', marginLeft: 5 }}>
                                Deal applied
                            </Text>
                        </View>
                    )}

                    {Number(item?.inventory) <= Number(item?.QTY) && (
                        <View style={{
                            marginTop: 5, alignSelf: 'flex-start', paddingHorizontal: 6,
                            paddingVertical: 2, borderWidth: 1, borderRadius: 5, borderColor: offPurpleColor
                        }}>
                            <Text style={{ color: offPurpleColor, fontSize: fs(11) }}>
                                Only {item?.inventory} left
                            </Text>
                        </View>
                    )}
                </View>

                {/* Right – Add button on top, price on a single line below */}
                <View style={{ alignItems: 'flex-end' }}>
                    <AddButton
                        isAddedToCart={true}
                        cartTheme={true}
                        style={{ alignSelf: 'flex-end' }}
                        callBack={getCartData}
                        changeLoadingState={changeLoadingState}
                        addItem={addItem}
                        minusItem={minusItem}
                        item={{ ...item, qty_added_in_cart: item.QTY }}
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, marginRight: 6 }}>
                        <Text style={{
                            fontFamily: 'Poppins-Regular', color: darkGrayColor,
                            textDecorationLine: 'line-through', fontSize: fs(12), marginRight: 6
                        }}>
                            {currency}{(Number(item.mrp_price) * Number(item.QTY)).toFixed(0)}
                        </Text>
                        <Text style={{ fontFamily: 'Poppins-SemiBold', color: textColor, fontSize: fs(14) }}>
                            {currency}{item.subtotal}
                        </Text>
                    </View>
                </View>
            </View>
        )
    }

    /** Address item */
    const renderAddressItem = ({ item, index }) => (
        <View style={{
            width: '95%', borderWidth: 1, borderRadius: 10,
            borderColor: selectedAddress === index ? buttonBgColor : categorySaperator,
            marginTop: 12, padding: 16, marginHorizontal: 10
        }}>
            <Text style={{ fontFamily: 'Poppins-Medium', color: textColor }}>{item.Name}</Text>
            <Text style={{ marginTop: 3, fontFamily: 'Poppins-Regular', color: textInputColor }}>
                {item.Address + ", " + item.City + ", " + item.State + ", " + item.Pincode}
            </Text>
            <Text style={{
                borderRadius: 5, fontFamily: 'Poppins-Regular', color: textColor,
                backgroundColor: categorySaperator, width: '20%', textAlign: 'center', padding: 5, marginTop: 10
            }}>{item.Address_Type}</Text>
            <View style={{ position: 'absolute', bottom: 10, right: 5, flexDirection: 'row', marginRight: 10 }}>
                <TouchableOpacity onPress={() => navigation.navigate("MyAddress", { editItemFromPrevious: item, cart: true })}>
                    <Text style={{ color: buttonBgColor }}>EDIT</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                onPress={() => setSelectedAddress(index)}
                style={{
                    justifyContent: 'center', alignItems: 'center',
                    position: 'absolute', borderColor: buttonBgColor,
                    height: 22, width: 22, borderRadius: 11, borderWidth: 4,
                    right: 8, top: 10
                }}>
                {selectedAddress === index && (
                    <View style={{ width: 8, height: 8, backgroundColor: buttonBgColor, borderRadius: 4 }} />
                )}
            </TouchableOpacity>
        </View>
    )

    // ─────────────────────────────────────────────────────────────────────────
    // MAIN RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <View style={{ flex: 1, backgroundColor: '#F7F7F7' }}>

            {/* Header */}
            <View style={{
                width: "100%", backgroundColor: '#FFFFFF',
                flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingTop: 15
            }}>
                <TouchableOpacity
                    onPress={() => {
                        if (iAddress) { setIsCart(true); setAddress(false) }
                        else navigation.goBack()
                    }}
                    style={{ marginLeft: 10, height: 28, justifyContent: 'center' }}>
                    <Image
                        source={require('../../assets/icons/back.png')}
                        style={{ width: 28, height: 28, resizeMode: 'contain', tintColor: '#000000' }}
                    />
                </TouchableOpacity>
                <Text style={{
                    fontFamily: 'Poppins-SemiBold', color: 'black', fontSize: 18, marginLeft: 10,
                    height: 28, lineHeight: 28, textAlignVertical: 'center'
                }}>
                    {iAddress ? "Checkout" : "Checkout"}
                </Text>
            </View>

            {/* ── CART SCREEN ─────────────────────────────────────────── */}
            {isCart && cartData && cartData.length > 0 && (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1, backgroundColor: '#F7F7F7' }}
                    contentContainerStyle={{ paddingBottom: 30 }}>

                    {/* Out-of-stock box always shown first if any (image 4) */}
                    {renderOutOfStockBox()}

                    {/* Coupons & Offers (image 5) */}
                    {renderCouponSection()}

                    {/* Cart items in a card */}
                    <View style={{
                        marginHorizontal: 10, marginTop: 12,
                        borderRadius: 10, borderWidth: 1, borderColor: categorySaperator,
                        backgroundColor: '#fff', overflow: 'hidden'
                    }}>
                        <FlatList
                            scrollEnabled={false}
                            data={cartData}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => "cart_" + index}
                        />
                    </View>

                    {/* Steal Deals (image 5) */}
                    {renderStealDeals()}

                    {/* Bill Summary with dynamic fees + tip (images 5, 6) */}
                    <View style={{
                        marginHorizontal: 10, marginTop: 12,
                        borderRadius: 10, borderWidth: 1, borderColor: categorySaperator,
                        backgroundColor: '#fff', overflow: 'hidden'
                    }}>
                        {renderBillSummary()}
                    </View>

                    {/* Continue to Payment */}
                    <TouchableOpacity
                        onPress={redirectToAddress}
                        style={{
                            backgroundColor: allCategoryPink, paddingVertical: 16,
                            marginHorizontal: 20, borderRadius: 8, marginTop: 20
                        }}>
                        <Text style={{
                            color: whiteTxtColor, fontFamily: 'Poppins-SemiBold',
                            alignSelf: 'center', fontSize: 16, letterSpacing: 1
                        }}>CONTINUE TO PAYMENT</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {/* ── ADDRESS + SLOT SCREEN ───────────────────────────────── */}
            {iAddress && cartData && cartData.length > 0 && (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1, backgroundColor: '#F7F7F7' }}
                    contentContainerStyle={{ paddingBottom: 30 }}>

                    <TouchableOpacity
                        onPress={() => navigation.navigate("MyAddress", { editItemFromPrevious: null, cart: true })}>
                        <Text style={{
                            color: buttonBgColor, fontSize: 16,
                            fontFamily: 'Poppins-SemiBold', margin: 10
                        }}>+ ADD NEW ADDRESS</Text>
                    </TouchableOpacity>

                    <FlatList
                        scrollEnabled={false}
                        data={addresses}
                        renderItem={renderAddressItem}
                        keyExtractor={(item, index) => 'addr_' + index}
                    />

                    {addresses?.length > 0 && !isShippingAvailable && (
                        <Text style={{
                            marginTop: 10, alignSelf: 'center', fontSize: 16,
                            fontFamily: 'Poppins-SemiBold', color: allCategoryPink
                        }}>Sorry, we are not delivering here</Text>
                    )}

                    {/* Instant delivery */}
                    {instantDeliveryText && showInstantDelivery == '1' && (
                        <TouchableOpacity
                            onPress={() => setInstantDelivery(true)}
                            style={{
                                backgroundColor: '#fff', padding: 10, marginBottom: 5,
                                borderRadius: 8, margin: 10, marginTop: 15,
                                flexDirection: 'row',
                                borderColor: instantDelivery ? allCategoryPink : '#a1a1a1',
                                borderWidth: 1
                            }}>
                            <RadioButton isSelected={instantDelivery ? true : false} />
                            <Text style={{
                                fontSize: 13, alignSelf: 'center',
                                color: instantDelivery ? allCategoryPink : '#a1a1a1', marginLeft: 6
                            }}>{instantDeliveryText}</Text>
                        </TouchableOpacity>
                    )}

                    {/* Delivery slots */}
                    <FlatList
                        scrollEnabled={false}
                        data={days}
                        keyExtractor={item => item.DAYS_ID}
                        renderItem={({ item }) => (
                            <SlotSelection
                                setSelectedSlot={setSelectedSlot}
                                setSelectedDay={setSelectedDay}
                                day={item}
                                selectedSlot={selectedSlot}
                            />
                        )}
                    />

                    {/* Bill summary (read-only) in address screen */}
                    <View style={{
                        marginHorizontal: 10, marginTop: 16,
                        borderRadius: 10, borderWidth: 1, borderColor: categorySaperator,
                        backgroundColor: '#fff', overflow: 'hidden'
                    }}>
                        {renderBillSummary()}
                    </View>

                    {/* Payment method */}
                    {isShippingAvailable && (
                        <View style={{ marginHorizontal: 10, marginTop: 16 }}>
                            <Text style={{ fontFamily: 'Poppins-SemiBold', color: textColor, fontSize: 15, marginBottom: 8 }}>
                                Payment Method
                            </Text>
                            {[
                                { key: "ONLINE", label: "Credit/Debit Card / Netbanking & UPI" },
                                ...(isCodAvailable ? [{ key: "COD", label: "Cash on Delivery" }] : [])
                            ].map(opt => (
                                <TouchableOpacity
                                    key={opt.key}
                                    onPress={() => setType(opt.key)}
                                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                    <View style={{
                                        borderColor: buttonBgColor, height: 22, width: 22,
                                        borderRadius: 11, borderWidth: 4,
                                        justifyContent: 'center', alignItems: 'center'
                                    }}>
                                        {type === opt.key && (
                                            <View style={{ width: 8, height: 8, backgroundColor: buttonBgColor, borderRadius: 4 }} />
                                        )}
                                    </View>
                                    <Text style={{
                                        color: textColor, fontSize: 14,
                                        fontFamily: 'Poppins-SemiBold', marginLeft: 10
                                    }}>{opt.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {isShippingAvailable && (
                        <TouchableOpacity
                            onPress={placeOrder}
                            style={{
                                backgroundColor: allCategoryPink, paddingVertical: 16,
                                marginHorizontal: 20, borderRadius: 8, marginTop: 10
                            }}>
                            <Text style={{
                                color: whiteTxtColor, fontFamily: 'Poppins-SemiBold',
                                alignSelf: 'center', fontSize: 16, letterSpacing: 1
                            }}>PROCEED</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            )}

            {/* ── ORDER SUCCESS SCREEN ────────────────────────────────── */}
            {isSummary && cartData && cartData.length > 0 && (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1, backgroundColor: '#fff' }}>
                    <View style={{ justifyContent: 'center', marginTop: 50, alignSelf: 'center' }}>
                        <Image
                            resizeMode={'contain'}
                            style={{ height: 100, width: 100, alignSelf: 'center', marginTop: '40%' }}
                            source={require('../../assets/succ.png')}
                        />
                        <Text style={{ fontSize: 38, alignSelf: 'center', color: coupanGreen, fontFamily: 'Poppins-Regular' }}>
                            Thank you!
                        </Text>
                        <Text style={{ fontSize: 18, alignSelf: 'center', color: textColor, fontFamily: 'Poppins-Regular' }}>
                            Order No. {orderNumber}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("HomeStack")}
                            style={{
                                backgroundColor: allCategoryPink, borderRadius: 8,
                                paddingHorizontal: 24, height: 40, justifyContent: 'center',
                                alignItems: 'center', alignSelf: 'center', marginTop: 24
                            }}>
                            <Text style={{ color: 'white', fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>
                                Go Home
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}

            {/* ── EMPTY CART ──────────────────────────────────────────── */}
            {isCart && (!cartData || cartData.length === 0) && (
                <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                        resizeMode={'contain'}
                        style={{ height: 120, width: 120 }}
                        source={require('../../assets/empty-cart-new.png')}
                    />
                    {!loadingData && (
                        <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 18, marginTop: 20 }}>
                            Your cart is empty
                        </Text>
                    )}
                    <TouchableOpacity
                        onPress={() => navigation.navigate("HomeStack")}
                        style={{
                            padding: 12, borderRadius: 8, borderWidth: 1,
                            borderColor: allCategoryPink, marginTop: 16
                        }}>
                        <Text style={{ fontFamily: "Poppins-Medium", fontSize: 16, color: allCategoryPink }}>
                            Browse Products
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    )
}

// ── BillRow helper component ──────────────────────────────────────────────────
function BillRow({ label, value, mrpValue, color, note }) {
    const showStrike = mrpValue && mrpValue > value
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 6 }}>
            <View>
                <Text style={{ fontFamily: 'Poppins-Regular', color: color || textColor, fontSize: 13 }}>{label}</Text>
                {note ? <Text style={{ fontFamily: 'Poppins-Regular', color: textInputColor, fontSize: 11 }}>{note}</Text> : null}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {showStrike && (
                    <Text style={{
                        fontFamily: 'Poppins-Regular', color: textInputColor,
                        textDecorationLine: 'line-through', fontSize: 12, marginRight: 4
                    }}>₹{mrpValue}</Text>
                )}
                <Text style={{ fontFamily: 'Poppins-Medium', color: color || textColor, fontSize: 13 }}>
                    ₹{value}
                </Text>
            </View>
        </View>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
const mapStateToProps = () => ({})
const mapDispatchToProps = (dispatch) => ({
    dispatch,
    ...bindActionCreators({ changeLoadingState, changeCartCount, setPopup }, dispatch),
})

const Cart = connect(mapStateToProps, mapDispatchToProps)(CartScreen)
export default Cart