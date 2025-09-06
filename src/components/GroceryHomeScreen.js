import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { pinCode } from '../reducer/pincode';
import { server } from '../common/apiConstant';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2; // Accounting for padding and gap

const GroceryHomeScreen = ({ appHeaderColor, address, handlePincodePress, handleSearchPress, handleUserPress, pinCode }) => {
  const [searchText, setSearchText] = useState('');
  const [quantities, setQuantities] = useState({});
  const [deliveryTime, setDeliveryTime] = useState("")

  const fetchDeliveryTime = async () => {
    try {
      const url = server + 'quickdeliverybypincode/' + pinCode
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status && result.statusCode === 200) {
        const deliveryTime = result.data.aQuickDeliveryData.delivery_time;
        setDeliveryTime(deliveryTime);
        console.log('Delivery time set:', deliveryTime);
      } else {
        throw new Error(result.message || 'Failed to fetch delivery data');
      }
    } catch (error) {
      console.error('Error fetching delivery data:', error.message);
      setDeliveryTime('Error fetching delivery time');
    }
  }


  useEffect(() => {
    pinCode && fetchDeliveryTime()
  }, [pinCode])

  const products = [
    {
      id: 1,
      name: 'Plum Indian 250 g',
      weight: '250 g',
      rating: 4,
      originalPrice: 149,
      discountedPrice: 69,
      discount: '54% OFF',
      image: 'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=200&h=200&fit=crop',
    },
    {
      id: 2,
      name: 'Plum Indian 250 g',
      weight: '250 g',
      rating: 4,
      originalPrice: 149,
      discountedPrice: 69,
      discount: '54% OFF',
      image: 'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=200&h=200&fit=crop',
    },
    {
      id: 3,
      name: 'Plum Indian 250 g',
      weight: '250 g',
      rating: 4,
      originalPrice: 149,
      discountedPrice: 69,
      discount: '54% OFF',
      image: 'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=200&h=200&fit=crop',
    },
  ];

  const updateQuantity = (productId, change) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + change)
    }));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text key={i} style={[styles.star, i < rating && styles.starFilled]}>
        ★
      </Text>
    ));
  };

  const renderQuantityControl = (product) => {
    const quantity = quantities[product.id] || 0;

    if (quantity === 0) {
      return (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => updateQuantity(product.id, 1)}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(product.id, -1)}
        >
          <Text style={styles.quantityButtonText}>−</Text>
        </TouchableOpacity>

        <Text style={styles.quantityText}>{quantity}</Text>

        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(product.id, 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderProductCard = (product) => (
    <View key={product.id} style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
      </View>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingNumber}>{product.rating}</Text>
        {renderStars(product.rating)}
      </View>

      <Text style={styles.productWeight}>{product.weight}</Text>
      <Text style={styles.productName}>{product.name}</Text>

      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>{product.discount}</Text>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
        <Text style={styles.discountedPrice}>₹{product.discountedPrice}</Text>
      </View>

      {renderQuantityControl(product)}
    </View>
  );

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: appHeaderColor }}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          style={{ alignSelf: 'flex-start', width: 120, height: 25, resizeMode: 'contain', marginTop: 10 }}
          source={require('../../assets/logo.png')}
        />
        <View style={styles.headerTop}>
          <Text style={styles.deliveryTime}>{deliveryTime}</Text>
          <TouchableOpacity
            onPress={handleUserPress}
            style={styles.profileButton}>
            <View style={styles.profileIcon}>
              {/* <Text style={styles.profileIconText}>👤</Text> */}
              <Image
                source={require('../../assets/user_circle.png')}
                style={{ width: 32, height: 32, resizeMode: 'contain' }}
              />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handlePincodePress}
          style={styles.locationContainer}>
          <Text style={styles.locationText}>{address}</Text>
          {/* <Text style={styles.dropdownIcon}>▼</Text> */}
          <Image
            source={require('../../assets/down-arrow.png')}
            style={{ width: 24, height: 24, resizeMode: 'contain' }}
          />
        </TouchableOpacity>

        {/* Search Bar */}
        <TouchableOpacity
          onPress={handleSearchPress}
          style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            editable={false}
            style={styles.searchInput}
            placeholder={`Search "Atta"`}
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
        </TouchableOpacity>
      </View>

      <View style={{ ...styles.content, backgroundColor: appHeaderColor }} >
        <View style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Weekend</Text>
            <Text style={styles.promoSubtitle}>TWISTERS</Text>
            <Text style={styles.promoDescription}>Not your regular shopping!</Text>
          </View>
          <View style={styles.promoImageContainer}>
            <Text style={styles.promoEmoji}>🧁</Text>
            <Text style={styles.promoEmoji2}>🍰</Text>
          </View>
        </View>

        {/* Products Grid */}
        {/* <ScrollView horizontal={true}>
          {products.map(renderProductCard)}
          <View style={styles.productCard} />
        </ScrollView>
        */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B5CF6',
  },
  header: {
    // backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileButton: {
    padding: 4,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileIconText: {
    color: '#ffffff',
    fontSize: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    // alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 0
  },
  locationText: {
    color: '#ffffff',
    fontSize: 16,
    // flex: 1,
    opacity: 0.9,
    marginLeft:-5,
    marginRight:10
  },
  dropdownIcon: {
    color: '#ffffff',
    fontSize: 12,
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  promoBanner: {
    backgroundColor: '#8B5CF6',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
  },
  promoSubtitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  promoDescription: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
  },
  promoImageContainer: {
    position: 'relative',
    width: 80,
    height: 60,
  },
  promoEmoji: {
    fontSize: 40,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  promoEmoji2: {
    fontSize: 24,
    position: 'absolute',
    right: 20,
    bottom: 0,
  },
  productsContainer: {
    paddingHorizontal: 20,
  },
  productsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginRight: 4,
  },
  star: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  starFilled: {
    color: '#10B981',
  },
  productWeight: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  discountBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  addButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  quantityButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
});

export default GroceryHomeScreen;