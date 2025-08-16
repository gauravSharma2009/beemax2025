import React, { useRef, useEffect } from 'react';
import { View, Image, Dimensions, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import FastImage from 'react-native-fast-image'

const SliderComponent = (props) => {
    const { navigation, bannerData } = props;
    const carouselRef = useRef(null);
    const screenWidth = Dimensions.get('window').width;

    // Your list of images
    const images = [
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
        // Start auto-scrolling after 2 seconds
        const timer = setTimeout(() => {
            carouselRef.current?.snapToNext();
        }, 2000);

        // Clear the timer on component unmount
        return () => clearTimeout(timer);
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
                console.log("item  :  ", item)
                // item.redirection_type === 'category' ? navigation.navigate("ProductListing", { item, from: 'banner' }) : navigation.navigate("ProductDetails", { product: item, from: 'banner' })
                item.redirection_type === 'category' ? navigation.navigate("ProductListing", { item: item, from: 'banner' }) : navigation.navigate("ProductDetails", { product: item, from: 'banner' })

            }}
            style={{ width: screenWidth, height: 180, padding: 3 }}>
            {/* <FastImage
                style={{ width: screenWidth, height: 180 }}
                source={{
                    uri: item.image_url,
                    //headers: { Authorization: 'someAuthToken' },
                    priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.cover}
            /> */}
            <Image source={{ uri: item.image_url }} style={{ flex: 1, borderRadius: 10 }} resizeMode="cover" />
        </TouchableOpacity>
    );

    return (
        <Carousel
            ref={carouselRef}
            data={bannerData}
            renderItem={renderItem}
            sliderWidth={screenWidth}
            itemWidth={screenWidth}
            autoplay
            autoplayDelay={2000} // The delay before the auto-scrolling starts (in milliseconds)
            autoplayInterval={5000} // The interval between each auto-scroll (in milliseconds)
            loop
        />
    );
};

export default SliderComponent;
