import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  PanResponder,
} from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = 300;

const OrderStatusBottomSheet = ({
  visible,
  onClose,
  orderId,
  deliveryTime,
  currentStatus = 'Order Placed', // 'Order Placed', 'Accepted', 'Shipped', 'Delivered'
}) => {
  const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const statusSteps = [
    {
      id: 'placed',
      label: 'Order Placed',
      icon: '✓',
      status: 'completed'
    },
    {
      id: 'accepted',
      label: 'Accepted',
      icon: '✓',
      status: getCurrentStepStatus('Accepted', currentStatus)
    },
    {
      id: 'shipped',
      label: 'Shipped',
      icon: '🚚',
      status: getCurrentStepStatus('Shipped', currentStatus)
    },
    {
      id: 'delivered',
      label: 'Delivered',
      icon: '📦',
      status: getCurrentStepStatus('Delivered', currentStatus)
    }
  ];

  function getCurrentStepStatus(stepName, currentStatus) {
    const statusOrder = ['Order Placed', 'Accepted', 'Shipped', 'Delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepName);
    
    if (stepIndex <= currentIndex) return 'completed';
    if (stepIndex === currentIndex + 1) return 'active';
    return 'pending';
  }

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
          <Text style={styles.checkIcon}>✓</Text>
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
    if (index === statusSteps.length - 1) return null;
    
    const currentStep = statusSteps[index];
    const isCompleted = currentStep.status === 'completed';
    
    return (
      <View style={[
        styles.connectorLine,
        isCompleted && styles.completedLine,
      ]} />
    );
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
            <Text style={styles.orderId}>Order ID ({orderId})</Text>
            <TouchableOpacity onPress={hideBottomSheet} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryLabel}>Delivery slot:</Text>
            <Text style={styles.deliveryTime}>{deliveryTime}</Text>
          </View>
        </View>

        {/* Status Progress */}
        <View style={styles.statusContainer}>
          {statusSteps.map((step, index) => (
            <View key={step.id} style={styles.statusStep}>
              <View style={styles.statusRow}>
                {renderStatusIcon(step, index)}
                <Text style={[
                  styles.statusLabel,
                  step.status === 'completed' && styles.completedLabel,
                  step.status === 'active' && styles.activeLabel,
                ]}>
                  {step.label}
                </Text>
              </View>
              {renderConnectorLine(index)}
            </View>
          ))}
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
    color: '#9CA3AF',
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
  statusStep: {
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
  connectorLine: {
    position: 'absolute',
    left: 19,
    top: 48,
    width: 2,
    height: 24,
    backgroundColor: '#E5E7EB',
    zIndex: -1,
  },
  completedLine: {
    backgroundColor: '#10B981',
  },
});

export default OrderStatusBottomSheet;