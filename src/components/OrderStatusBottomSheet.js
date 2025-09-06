import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  PanResponder,
  Image,
} from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = 200;

const OrderStatusBottomSheet = ({
  visible,
  onClose,
  orderId,
  deliveryTime,
  orderdta,
  currentStatus = 'Order Placed', // 'Order Placed', 'Accepted', 'Shipped', 'Delivered'
}) => {
  const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const [data, setData] = useState(null)
  useEffect(() => {
    if (orderdta && orderdta?.aRecentOrderData && Array.isArray(orderdta?.aRecentOrderData) && orderdta.aRecentOrderData.length > 0) {
      setData(orderdta?.aRecentOrderData[0])
    }
  }, [orderdta])

  // Generate status steps from ORDER_TRACK_DETAILS
  const generateStatusSteps = () => {
    if (!data || !data.ORDER_TRACK_DETAILS) return [];

    const trackDetails = data.ORDER_TRACK_DETAILS;
    const steps = [];

    // Order is important: 1=Order Placed, 2=Accepted, 3=Shipped, 4=Delivered
    const orderKeys = ['1', '2', '3', '4'];

    // Find the active step
    let activeStepIndex = -1;
    for (let i = orderKeys.length - 1; i >= 0; i--) {
      const key = orderKeys[i];
      if (trackDetails[key] && trackDetails[key].is_active === 1) {
        activeStepIndex = i;
        break;
      }
    }

    // Create steps array
    orderKeys.forEach((key, index) => {
      if (trackDetails[key]) {
        let status = 'pending';

        // If this step is active or any previous step is active, mark as completed
        if (index <= activeStepIndex) {
          status = 'completed';
        }
        // If this is the next step after active, mark as active
        else if (index === activeStepIndex + 1) {
          status = 'active';
        }

        steps.push({
          id: key,
          label: trackDetails[key].order_status,
          status: status,
          iconSource: getIconSource(key, status)
        });
      }
    });

    return steps;
  };

  // Get appropriate icon based on step and status
  const getIconSource = (stepId, status) => {
    if (status === 'completed') {
      return require('../../assets/check.png');
    }

    switch (stepId) {
      case '2': // Accepted
        return require('../../assets/accepted.png');
      case '3': // Shipped
        return require('../../assets/shipped.png');
      case '4': // Delivered
        return require('../../assets/deliver.png');
      default:
        return null;
    }
  };

  const statusSteps = generateStatusSteps();

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 20;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 100) {
        hideBottomSheet();
      } else {
        showBottomSheet();
      }
    },
  });

  useEffect(() => {
    if (visible) {
      showBottomSheet();
    } else {
      hideBottomSheet();
    }
  }, [visible]);

  const showBottomSheet = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideBottomSheet = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: BOTTOM_SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose && onClose();
    });
  };

  const renderStatusIcon = (step, index) => {
    const isCompleted = step.status === 'completed';
    const isActive = step.status === 'active';

    return (
      <View style={[
        styles.statusIconContainer,
        isCompleted && styles.completedIcon,
        isActive && styles.activeIcon,
      ]}>
        {isCompleted ? (
          <Image
            source={require('../../assets/check.png')}
            style={styles.statusImage}
          />
        ) : step.iconSource ? (
          <Image
            source={step.iconSource}
            style={styles.statusImage}
          />
        ) : (
          <View style={[
            styles.pendingDot,
            isActive && styles.activeDot,
          ]} />
        )}
      </View>
    );
  };

  const renderConnectorLine = (index) => {
    // This function is no longer used for vertical lines
    // Horizontal connectors are now rendered directly in the JSX
    return null;
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        <TouchableOpacity
          style={styles.backdropTouch}
          onPress={hideBottomSheet}
          activeOpacity={1}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.bottomSheet,
          { transform: [{ translateY }] }
        ]}
        {...panResponder.panHandlers}
      >
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Order Placed</Text>
            <Text style={styles.orderId}>Order ID ({data?.DISPLAY_PRIMARY_ORDER_ID})</Text>
            <TouchableOpacity onPress={hideBottomSheet} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryLabel}>Delivery slot:</Text>
            <Text style={styles.deliveryTime}>{data?.GROCERY_DELIVERY_SLOT}</Text>
          </View>
        </View>

        {/* Status Progress - Horizontal Layout */}
        <View style={styles.statusContainer}>
          <View style={styles.horizontalStatusRow}>
            {statusSteps.map((step, index) => (
              <View key={step.id} style={styles.horizontalStatusStep}>
                <View style={styles.statusIconWrapper}>
                  {renderStatusIcon(step, index)}
                  {index < statusSteps.length - 1 && (
                    <View style={[
                      styles.horizontalConnectorLine,
                      step.status === 'completed' && styles.completedLine,
                    ]} />
                  )}
                </View>
                <Text 
                  numberOfLines={2}
                  style={[
                    styles.horizontalStatusLabel,
                    step.status === 'completed' && styles.completedLabel,
                    step.status === 'active' && styles.activeLabel,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouch: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_SHEET_HEIGHT,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 2,
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 10,
  },
  closeIcon: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '300',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  deliveryTime: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
    marginLeft: 6,
  },
  statusContainer: {
    flex: 1,
  },
  horizontalStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  horizontalStatusStep: {
    alignItems: 'center',
    width: '25%', // For 4 steps
  },
  statusIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    width: '100%',
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  completedIcon: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  activeIcon: {
    backgroundColor: '#ffffff',
    borderColor: '#3B82F6',
    borderWidth: 3,
  },
  checkIcon: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pendingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
  },
  activeDot: {
    backgroundColor: '#3B82F6',
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  completedLabel: {
    color: '#374151',
    fontWeight: '600',
  },
  activeLabel: {
    color: '#1F2937',
    fontWeight: '600',
  },
  horizontalConnectorLine: {
    width: SCREEN_WIDTH * 0.12, // Adjust based on screen width
    height: 2,
    backgroundColor: '#E5E7EB',
    position: 'absolute',
    right: -SCREEN_WIDTH * 0.06,
    top: 20,
  },
  completedLine: {
    backgroundColor: '#10B981',
  },
  horizontalStatusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  statusImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  horizontalStatusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    width: '100%',
  },
});

export default OrderStatusBottomSheet;