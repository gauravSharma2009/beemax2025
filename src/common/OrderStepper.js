import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OrderStepper = ({ orderTrackDetails }) => {
  // Generate status steps from ORDER_TRACK_DETAILS
  const generateStatusSteps = () => {
    if (!orderTrackDetails) return [];

    const trackDetails = orderTrackDetails;
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

  if (!orderTrackDetails || statusSteps.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 10,
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
  pendingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
  },
  activeDot: {
    backgroundColor: '#3B82F6',
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
    width: SCREEN_WIDTH * 0.13, // Reduced from 0.15 to 0.13 (smaller)
    height: 6, // Increased from 4 to 6 (thicker)
    backgroundColor: '#E5E7EB',
    position: 'absolute',
    right: -SCREEN_WIDTH * 0.065, // Adjusted from 0.075 to 0.065
    top: 19, // Adjusted slightly to center the thicker line
  },
  completedLine: {
    backgroundColor: '#10B981',
  },
  horizontalStatusLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    width: '100%',
  },
  statusImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});

export default OrderStepper;