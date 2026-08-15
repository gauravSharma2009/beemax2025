import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  Image,
} from 'react-native';
import { server } from '../common/apiConstant';
import { getData } from '../common/asyncStore';
import { coupanGreen, textColor } from '../common/colours';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Scale font sizes relative to a 375pt-wide baseline design, clamped so text
// never gets too cramped on small phones or too large on tablets/big phones.
const FONT_SCALE = Math.min(Math.max(SCREEN_WIDTH / 375, 0.85), 1.08);
const rf = (size) => Math.round(size * FONT_SCALE);

// Bumped from 160 -> 210 to match the client's reference design: larger
// header text, extra line-gap between the header rows, and a bigger call
// icon all add vertical height. Keep this in sync if the header design changes.
const CARD_AREA_HEIGHT = 210; // fallback header + steps height, refined once measured on-device
const EXPANDED_HEIGHT = 210; // fixed outer sheet height — must stay constant across minimize/expand
const MINIMIZED_HEIGHT = 80; // height of the compact white card

const POLL_INTERVAL_MS = 30_000;

/**
 * OrderStatusBottomSheet
 *
 * Props
 * ─────
 * visible              {boolean}
 * setShowOrderStatus   {function}  – parent setState, called true when orders arrive
 * onClose              {function}  – optional
 * onDataLoaded         {function}  – optional
 * focusTrigger         {number}    – increment from useFocusEffect to re-fetch
 * userId               {string|number}
 * tabBarHeight         {number}    – height of bottom tab bar (default 60)
 */
const OrderStatusBottomSheet = ({
  visible,
  setShowOrderStatus,
  onClose,
  onDataLoaded,
  focusTrigger = 0,
  // userId = 32,
  tabBarHeight = 60,
}) => {
  const translateY = useRef(new Animated.Value(EXPANDED_HEIGHT)).current;

  const [orders, setOrders] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // FIX 3: track minimized in a ref so polling never re-expands when user minimized
  const [isMinimized, setIsMinimized] = useState(false);
  const isMinimizedRef = useRef(false);

  const [loading, setLoading] = useState(false);

  // Real measured height of an order card — the fallback constant above is
  // only used until the first layout pass reports in. This only sizes the
  // inner ScrollView, never the sheet's own fixed outer box (see minimize()).
  const [cardH, setCardH] = useState(CARD_AREA_HEIGHT);

  const pollerRef = useRef(null);
  const scrollRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearInterval(pollerRef.current);
    };
  }, []);

  // ── animation helpers ───────────────────────────────────────────────────────
  const animateTo = useCallback((toValue, callback) => {
    Animated.timing(translateY, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(callback);
  }, [translateY]);

  const expand = useCallback(() => {
    isMinimizedRef.current = false;
    setIsMinimized(false);
    animateTo(0);
  }, [animateTo]);

  const minimize = useCallback(() => {
    isMinimizedRef.current = true;
    setIsMinimized(true);
    // slide down so only MINIMIZED_HEIGHT peeks above tabBar. The sheet's
    // outer box must stay a fixed EXPANDED_HEIGHT at all times (even while
    // showing the mini card) for this slide distance to stay correct —
    // letting the box auto-size to whichever child is rendered breaks it.
    animateTo(EXPANDED_HEIGHT - MINIMIZED_HEIGHT);
  }, [animateTo]);

  // Track the tallest order card so the horizontal pager sizes to the real
  // content instead of stretching to fill the whole fixed sheet height.
  const onCardLayout = useCallback((e) => {
    const h = Math.ceil(e.nativeEvent.layout.height);
    setCardH(prev => (h > prev ? h : prev));
  }, []);

  // ── fetch ───────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (showLoader = false) => {
    if (showLoader && isMounted.current) setLoading(true);
    try {
        const loginData = await getData("loginData")
              const userData = JSON.parse(loginData)
      const url = `${server}recent_order_history/${userData?.USER_ID}`;
      console.log('[OrderStatusBottomSheet] fetching:', url);
      const res = await fetch(url);
       const json = await res.json();
       console.log('[OrderStatusBottomSheet] response:', json);
      //let json = { "status": true, "data": { "aRecentOrderData": [{ "ORDER_DETAILS_ID": "5964", "PRIMARY_ORDER_ID": "6004", "DISPLAY_PRIMARY_ORDER_ID": "BM-6004", "GROCERY_DELIVERY_DATE": "2026-04-27", "GROCERY_DELIVERY_SLOT": "3:00 PM - 4:00 PM", "ORDER_STATUS": "Pending", "DBOY_ORDER_STATUS": "0", "DBOY_ID": "19", "DBOY_NAME": "Dinesh patro", "DBOY_MOBILE": "7735297858", "ORDER_STATUS_TEXT": "Order Accepted", "ORDER_TRACK_DETAILS": { "1": { "order_status": "Order Placed", "is_active": 0 }, "2": { "order_status": "Accepted", "is_active": 0 }, "3": { "order_status": "Shipped", "is_active": 1 }, "4": { "order_status": "Delivered", "is_active": 0 } }, "DELIVERY_BOY": { "id": 19, "name": "Dinesh patro", "mobile": "7735297858" } }, { "ORDER_DETAILS_ID": "5963", "PRIMARY_ORDER_ID": "6003", "DISPLAY_PRIMARY_ORDER_ID": "BM-6003", "GROCERY_DELIVERY_DATE": "2026-04-26", "GROCERY_DELIVERY_SLOT": "Delivery in 19 minutes *", "ORDER_STATUS": "Pending", "DBOY_ORDER_STATUS": null, "DBOY_ID": null, "DBOY_NAME": null, "DBOY_MOBILE": null, "ORDER_STATUS_TEXT": "Order Placed", "ORDER_TRACK_DETAILS": { "1": { "order_status": "Order Placed", "is_active": 1 }, "2": { "order_status": "Accepted", "is_active": 0 }, "3": { "order_status": "Shipped", "is_active": 0 }, "4": { "order_status": "Delivered", "is_active": 0 } }, "DELIVERY_BOY": null }, { "ORDER_DETAILS_ID": "5962", "PRIMARY_ORDER_ID": "6002", "DISPLAY_PRIMARY_ORDER_ID": "BM-6002", "GROCERY_DELIVERY_DATE": "2026-04-26", "GROCERY_DELIVERY_SLOT": "9:00 PM - 10:00 PM", "ORDER_STATUS": "Pending", "DBOY_ORDER_STATUS": null, "DBOY_ID": null, "DBOY_NAME": null, "DBOY_MOBILE": null, "ORDER_STATUS_TEXT": "Order Placed", "ORDER_TRACK_DETAILS": { "1": { "order_status": "Order Placed", "is_active": 1 }, "2": { "order_status": "Accepted", "is_active": 0 }, "3": { "order_status": "Shipped", "is_active": 0 }, "4": { "order_status": "Delivered", "is_active": 0 } }, "DELIVERY_BOY": null }] }, "message": "Please find data", "statusCode": 200 }
      if (!isMounted.current) return;

      if (json?.status && json?.data?.aRecentOrderData?.length > 0) {
        setOrders(json.data.aRecentOrderData);
        setShowOrderStatus && setShowOrderStatus(true);
        onDataLoaded && onDataLoaded(json.data);
        // FIX 3: only expand if user has NOT manually minimized
        if (!isMinimizedRef.current) {
          expand();
        }
      } else {
        setOrders([]);
        animateTo(EXPANDED_HEIGHT); // no orders — hide fully
      }
    } catch (e) {
      console.error('[OrderStatusBottomSheet] fetch error:', e);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [ onDataLoaded, expand, animateTo, setShowOrderStatus]);

  // ── focusTrigger ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (focusTrigger > 0) {
      fetchOrders(orders.length === 0);
    }
  }, [focusTrigger]);

  // ── visible: start/stop polling ─────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      fetchOrders(orders.length === 0);
      clearInterval(pollerRef.current);
      pollerRef.current = setInterval(() => fetchOrders(false), POLL_INTERVAL_MS);
    } else {
      clearInterval(pollerRef.current);
    }
    return () => clearInterval(pollerRef.current);
  }, [visible]);

  // ── status helpers ──────────────────────────────────────────────────────────
  const getActiveStepIndex = (trackDetails) => {
    let idx = -1;
    for (let i = 3; i >= 0; i--) {
      if (trackDetails?.[String(i + 1)]?.is_active === 1) { idx = i; break; }
    }
    return idx;
  };

  const getStatusSteps = (trackDetails) => {
    if (!trackDetails) return [];
    const activeIdx = getActiveStepIndex(trackDetails);
    return ['1', '2', '3', '4'].map((key, index) => {
      if (!trackDetails[key]) return null;
      let status = index <= activeIdx ? 'completed' : index === activeIdx + 1 ? 'active' : 'pending';
      return { id: key, label: trackDetails[key].order_status, status };
    }).filter(Boolean);
  };

  const getHeaderText = (order) => {
    const i = getActiveStepIndex(order.ORDER_TRACK_DETAILS);
    const texts = [
      'Your order is placed . . .',
      'Your order is getting packed . . .',
      `${order.DBOY_NAME || 'Delivery partner'} is on the way . . .`,
      'Your order is delivered!',
    ];
    return texts[Math.min(Math.max(i, 0), texts.length - 1)];
  };

  const isShipped = (order) => getActiveStepIndex(order.ORDER_TRACK_DETAILS) >= 2;

  const onScrollEnd = (e) => {
    setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
  };

  // ── guard ───────────────────────────────────────────────────────────────────
  if (orders.length === 0) return null;

  // ── minimized card ──────────────────────────────────────────────────────────
  const renderMiniCard = () => {
    const order = orders[currentIndex];
    if (!order) return null;
    const steps = getStatusSteps(order.ORDER_TRACK_DETAILS);
    const MINI_ICON = 30;
    const MINI_CONN = (SCREEN_WIDTH - 64 - MINI_ICON * 4) / 3;

    return (
      <TouchableOpacity style={styles.miniCard} activeOpacity={0.9} onPress={expand}>
        <View style={styles.miniStepsRow}>
          {steps.map((step, stepIdx) => {
            const isCompleted = step.status === 'completed';
            const isActive = step.status === 'active';
            return (
              <View key={step.id} style={styles.miniStepWrapper}>
                <View style={styles.miniIconRow}>
                  <View style={[
                    styles.miniIcon,
                    { width: MINI_ICON, height: MINI_ICON, borderRadius: MINI_ICON / 2 },
                    isCompleted && styles.miniIconCompleted,
                    isActive && styles.miniIconActive,
                  ]}>
                    {isCompleted
                      ? <Text style={styles.miniCheck}>✓</Text>
                      : isActive
                        ? <View style={styles.miniActiveDot} />
                        : <View style={styles.miniPendingDot} />}
                  </View>
                  {stepIdx < steps.length - 1 && (
                    <View style={[
                      styles.miniConnector,
                      {
                        width: MINI_CONN,
                        right: -(MINI_CONN / 2 + MINI_ICON / 2 - 4),
                        top: MINI_ICON / 2 - 2.5,
                      },
                      isCompleted && styles.miniConnectorDone,
                    ]} />
                  )}
                </View>
                <Text numberOfLines={1} style={[
                  styles.miniLabel,
                  isCompleted && styles.miniLabelDone,
                  isActive && styles.miniLabelActive,
                ]}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>

        {orders.length > 1 && (
          <View style={styles.miniDotsRow}>
            {orders.map((_, idx) => (
              <View key={idx} style={[styles.miniDot, idx === currentIndex && styles.miniDotActive]} />
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // ── expanded order card ─────────────────────────────────────────────────────
  const renderOrderCard = (order) => {
    const steps = getStatusSteps(order.ORDER_TRACK_DETAILS);
    const shipped = isShipped(order);
    // Client's design shows a clean 3-line header once a delivery partner is
    // assigned (Order ID / partner name / slot) — no separate generic status
    // line. Before that point (no partner yet) we still need the generic
    // status line since there's nothing else to tell the user what's going on.
    const hasDboyLine = shipped && !!order.DBOY_NAME;

    return (
      <View key={order.PRIMARY_ORDER_ID} style={styles.orderCard} onLayout={onCardLayout}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.orderIdRow}>
              <Text style={styles.orderIdLabel}>Order ID - </Text>
              <Text style={styles.orderIdValue}>{order.DISPLAY_PRIMARY_ORDER_ID}</Text>
            </View>
            {hasDboyLine ? (
              <View style={styles.dboyRow}>
                <Text style={styles.dboyName}>{order.DBOY_NAME?.split(" ")?.[0]}</Text>
                <Text style={styles.dboyRole}>, is your delivery partner</Text>
              </View>
            ) : (
              <Text style={styles.statusText}>{getHeaderText(order)}</Text>
            )}
            <View style={styles.slotRow}>
              <Text style={styles.slotLabel}>Delivery slot: </Text>
              <Text style={styles.slotValue}>{order.GROCERY_DELIVERY_SLOT}</Text>
            </View>
          </View>

          {/* NOTE 2 fix: bigger size + correct (vertically centered, clear of
              the close button) position for the call/delivery-partner icon */}
          {shipped && order.DBOY_MOBILE ? (
            <TouchableOpacity
              style={styles.dboyActions}
              onPress={() => Linking.openURL(`tel:${order.DBOY_MOBILE}`)}
            >
              <Image
                source={require('../../assets/icons/new-call.png')}
                style={styles.callDeliveryImg}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.stepsRow}>
          {steps.map((step, stepIdx) => {
            const isCompleted = step.status === 'completed';
            const isActive = step.status === 'active';
            return (
              <View key={step.id} style={styles.stepWrapper}>
                <View style={styles.iconAndLine}>
                  <View style={[
                    styles.stepIcon,
                    isCompleted && styles.stepIconCompleted,
                    isActive && styles.stepIconActive,
                  ]}>
                    {isCompleted
                      ? <Text style={styles.checkMark}>✓</Text>
                      : isActive
                        ? <View style={styles.activeDot} />
                        : <View style={styles.pendingDot} />}
                  </View>
                  {stepIdx < steps.length - 1 && (
                    <View style={[styles.connectorLine, isCompleted && styles.connectorLineDone]} />
                  )}
                </View>
                <Text numberOfLines={2} style={[
                  styles.stepLabel,
                  isCompleted && styles.stepLabelDone,
                  isActive && styles.stepLabelActive,
                ]}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // ── main render ─────────────────────────────────────────────────────────────
  return (
    // FIX 2: pointerEvents is 'auto' while expanded so the full card blocks touches
    // behind it, but 'box-none' while minimized so the empty space above the mini
    // card (left behind once the sheet translates down) lets scroll/tap events
    // through to the Home screen instead of swallowing them.
    <View
      style={[styles.outerContainer, { bottom: tabBarHeight }]}
      pointerEvents={isMinimized ? 'box-none' : 'auto'}
    >
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>

        {isMinimized ? (
          // FIX 1: white card with shadow — not transparent
          renderMiniCard()
        ) : (
          <>
            <View style={styles.handleBar} />

            {/* <TouchableOpacity style={styles.closeBtnAbsolute} onPress={minimize}>
              <Image
                source={require('../../assets/icons/nw-cross.png')}
                style={styles.closeIcon}
                resizeMode="contain"
              />
            </TouchableOpacity> */}

              <TouchableOpacity style={styles.closeBtnAbsolute} onPress={minimize}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>

            {loading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator color="#059669" />
              </View>
            ) : (
              <>
                <ScrollView
                  ref={scrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={onScrollEnd}
                  style={[styles.pager, { height: cardH }]}
                  contentContainerStyle={{ width: SCREEN_WIDTH * orders.length, alignItems: 'flex-start' }}
                >
                  {orders.map((order) => renderOrderCard(order))}
                </ScrollView>

                {orders.length > 1 && (
                  <View style={styles.dotsRow}>
                    {orders.map((_, idx) => (
                      <View key={idx} style={[styles.dot, idx === currentIndex && styles.dotActive]} />
                    ))}
                  </View>
                )}
              </>
            )}
          </>
        )}
      </Animated.View>
    </View>
  );
};

// ── styles ──────────────────────────────────────────────────────────────────────
const SHEET_H_PADDING = 22; // must match styles.sheet.paddingHorizontal below
const ICON_SIZE = 38;
const CONNECTOR_WIDTH = (SCREEN_WIDTH - SHEET_H_PADDING * 2 - ICON_SIZE * 4) / 3;

const styles = StyleSheet.create({

  // FIX 2: solid container, no pointerEvents pass-through
  outerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },

  sheet: {
    height: EXPANDED_HEIGHT,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // NOTE: client reference shows a visible border around the card —
    // bottom edge is harmless to include since it sits flush against the
    // tab bar and is never actually exposed.
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 22,
    paddingTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'visible',
  },

  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },

  closeBtnAbsolute: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#9CA3AF',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    // justifyContent: 'center',
    zIndex: 10,
  },
  closeIcon: { width: 36, height: 36, color: '#fff', fontSize: 16, textAlign: 'center', alignSelf: 'center' },

  // ── FIX 1: minimized white card ─────────────────────────────────────────────
  miniCard: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  miniStepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  miniStepWrapper: { alignItems: 'center', width: '25%' },
  miniIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    marginBottom: 4,
  },
  miniIcon: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniIconCompleted: { backgroundColor: '#10B981', borderColor: '#10B981' },
  miniIconActive: { backgroundColor: '#fff', borderColor: '#D1D5DB', borderWidth: 2.5 },
  miniCheck: { color: '#fff', fontSize: 13, fontWeight: '700' },
  miniActiveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#3B82F6' },
  miniPendingDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#D1D5DB' },
  miniConnector: { position: 'absolute', height: 5, backgroundColor: '#E5E7EB', borderRadius: 3 },
  miniConnectorDone: { backgroundColor: '#10B981' },
  miniLabel: { fontSize: rf(10), color: '#9CA3AF', textAlign: 'center' },
  miniLabelDone: { color: '#374151', fontWeight: '600' },
  miniLabelActive: { color: '#1F2937', fontWeight: '600' },
  miniDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    gap: 5,
  },
  miniDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB' },
  miniDotActive: { backgroundColor: '#10B981', width: 14, borderRadius: 3 },

  // ── expanded ─────────────────────────────────────────────────────────────────
  pager: { flexGrow: 0 },
  orderCard: { width: SCREEN_WIDTH - SHEET_H_PADDING * 2 },

  // NOTE 1 fix ("Line Gap"): each header row now carries its own marginBottom
  // instead of being packed edge-to-edge, matching the breathing room in the
  // client's reference. headerRow itself centers its two columns so the
  // (now bigger) call icon lines up with the middle of the text block.
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  orderIdLabel: { fontSize: rf(17), color: textColor, fontWeight: '600', lineHeight: rf(21) },
  orderIdValue: { fontSize: rf(17), color: coupanGreen, fontWeight: '700', lineHeight: rf(21) },
  statusText: { fontSize: rf(15), fontWeight: '700', color: '#1F2937', lineHeight: rf(19), marginBottom: 6 },
  dboyRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 },
  dboyName: { fontSize: rf(14), color: '#FF5C8A', fontWeight: '700', lineHeight: rf(19) },
  dboyRole: { fontSize: rf(13), color: '#374151', fontWeight: '500', lineHeight: rf(19) },
  slotRow: { flexDirection: 'row', alignItems: 'center' },
  slotLabel: { fontSize: rf(14), color: textColor, fontWeight: '500', lineHeight: rf(18) },
  slotValue: { fontSize: rf(14), color: coupanGreen, fontWeight: '700', lineHeight: rf(18) },

  // NOTE 2 fix ("Bigger size with correct position"): scaled up with rf() and
  // centered against the header block instead of pinned to the top corner,
  // so it no longer crowds the close button.
  dboyActions: { alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  callDeliveryImg: { width: rf(80), height: rf(40), resizeMode: 'contain', marginRight: 2 },

  stepsRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  stepWrapper: { alignItems: 'center', width: '25%' },
  iconAndLine: {
    flexDirection: 'row', alignItems: 'center',
    width: '100%', justifyContent: 'center', marginBottom: 6,
  },
  stepIcon: {
    width: ICON_SIZE, height: ICON_SIZE, borderRadius: ICON_SIZE / 2,
    backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  stepIconCompleted: { backgroundColor: '#10B981', borderColor: '#10B981' },
  stepIconActive: { backgroundColor: '#fff', borderColor: '#D1D5DB', borderWidth: 2.5 },
  checkMark: { color: '#fff', fontSize: 17, fontWeight: '700' },
  activeDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#3B82F6' },
  pendingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#D1D5DB' },
  connectorLine: {
    position: 'absolute',
    right: -(CONNECTOR_WIDTH / 2 + ICON_SIZE / 2 - 4),
    top: ICON_SIZE / 2 - 3,
    width: CONNECTOR_WIDTH, height: 6,
    backgroundColor: '#E5E7EB', borderRadius: 3,
  },
  connectorLineDone: { backgroundColor: '#10B981' },
  stepLabel: { fontSize: rf(11), fontWeight: '600', color: '#9CA3AF', textAlign: 'center', lineHeight: rf(16) },
  stepLabelDone: { color: '#374151', fontWeight: '600' },
  stepLabelActive: { color: '#1F2937', fontWeight: '600' },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 6, gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#D1D5DB' },
  dotActive: { backgroundColor: '#10B981', width: 18, borderRadius: 4 },

  loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default OrderStatusBottomSheet;