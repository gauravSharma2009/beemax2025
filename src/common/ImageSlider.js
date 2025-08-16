import React, { useState, useRef, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { View, FlatList, Image, StyleSheet } from 'react-native';
import { allCategoryPink } from './colours';

const ImageSlider = ({ images, openModal }) => {
    const flatlistRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (currentPage < images.length - 1) {
                //flatlistRef.current.scrollToIndex({ index: currentPage + 1, animated: true });
                setCurrentPage(currentPage + 1);
            } else {
                //flatlistRef.current.scrollToIndex({ index: 0, animated: true });
                setCurrentPage(0);
            }
        }, 3000);

        return () => {
            clearInterval(interval);
        };
    }, [currentPage, images.length]);

    const renderImage = ({ item }) => {
        return <Image source={item} style={styles.image} />;
    };

    const renderPageIndicator = () => {
        return (
            <View>
                <TouchableOpacity
                    onPress={() => openModal(true)}
                    style={{ width: '100%', height: 200, }}

                >
                    <Image
                        style={{ width: '100%', height: 200, resizeMode: 'contain', padding: 10 }}
                        source={{ uri: images[currentPage] }}
                    />
                </TouchableOpacity>

                <View style={styles.pageIndicatorContainer}>

                    {images.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.pageIndicator,
                                index === currentPage && styles.currentPageIndicator,
                            ]}
                        />
                    ))}
                </View>
            </View>

        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatlistRef}
                data={images}
                renderItem={renderImage}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const { contentOffset, layoutMeasurement } = event.nativeEvent;
                    const pageIndex = Math.floor(contentOffset.x / layoutMeasurement.width);
                    setCurrentPage(pageIndex);
                }}
            />
            {renderPageIndicator()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    image: {
        width: '100%',
    },
    pageIndicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: -5,
        left: 0,
        right: 0,
        // backgroundColor:'red',
        paddingTop: 10
    },
    pageIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
        marginHorizontal: 4,
    },
    currentPageIndicator: {
        backgroundColor: allCategoryPink,
    },
});

export default ImageSlider;



