import React, { useRef, useEffect, useState } from 'react';
import { View, Image, Dimensions, TouchableOpacity, FlatList } from 'react-native';
// import Carousel from 'react-native-snap-carousel';
import FastImage from 'react-native-fast-image'

const SliderComponent = (props) => {
    const { navigation, bannerData } = props;
    const flatListRef = useRef(null);
    const screenWidth = Dimensions.get('window').width;
    const [currentIndex, setCurrentIndex] = useState(0);

    // Use bannerData prop or fallback to default images
    const images = bannerData && bannerData.length > 0 ? bannerData : [
        {
            "id": "1",
            "title": "Banner 1",
            "image": "1681295327_b1.jpg",
            "redirection_type": "product",
            "redirection_id": "116",
            "image_url": "https:\/\/www.beemax.in\/demo\/dynamic1\/media\/uploads\/app_banner\/1681295327_b1.jpg"
        },
        {
            "id": "2",
            "title": "Banner 2",
            "image": "1681295335_b2.jpg",
            "redirection_type": "category",
            "redirection_id": "26",
            "image_url": "https:\/\/www.beemax.in\/demo\/dynamic1\/media\/uploads\/app_banner\/1681295335_b2.jpg"
        },
        {
            "id": "3",
            "title": "Banner 3",
            "image": "1681295343_b3.jpg",
            "redirection_type": "category",
            "redirection_id": "27",
            "image_url": "https:\/\/www.beemax.in\/demo\/dynamic1\/media\/uploads\/app_banner\/1681295343_b3.jpg"
        }
    ];

    useEffect(() => {
        if (images.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex(prevIndex => {
                    const nextIndex = (prevIndex + 1) % images.length;
                    flatListRef.current?.scrollToIndex({
                        index: nextIndex,
                        animated: true,
                    });
                    return nextIndex;
                });
            }, 3000); // Auto-scroll every 3 seconds

            return () => clearInterval(timer);
        }
    }, [images.length]);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
                console.log("item  :  ", item)
                // item.redirection_type === 'category' ? navigation.navigate("ProductListing", { item, from: 'banner' }) : navigation.navigate("ProductDetails", { product: item, from: 'banner' })
                item.redirection_type === 'category' ? navigation.navigate("ProductListing", { item: item, from: 'banner' }) : navigation.navigate("ProductDetails", { product: item, from: 'banner' })

            }}
            style={{ width: screenWidth, height: 180, padding: 3 }}>
            <FastImage
                style={{ width: screenWidth-10, height: 180 , borderRadius: 15 , alignSelf:'center',}}
                source={{
                    uri: item.image_url,
                    //headers: { Authorization: 'someAuthToken' },
                    priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.cover}
            />
            {/* <Image source={{ uri: item.image_url }} style={{ flex: 1, borderRadius: 10 }} resizeMode="cover" /> */}
        </TouchableOpacity>
    );

    const onScrollEnd = (event) => {
        const contentOffset = event.nativeEvent.contentOffset;
        const viewSize = event.nativeEvent.layoutMeasurement;
        const pageNum = Math.floor(contentOffset.x / viewSize.width);
        setCurrentIndex(pageNum);
    };

    return (
        <View style={{ height: 180 }}>
            <FlatList
                ref={flatListRef}
                data={images}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id || index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onScrollEnd}
                getItemLayout={(data, index) => ({
                    length: screenWidth,
                    offset: screenWidth * index,
                    index,
                })}
            />
        </View>
    );
};

export default SliderComponent;
