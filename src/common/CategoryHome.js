import React, { useState, useRef } from 'react';
import { Dimensions ,Image} from 'react-native';
import { Text, TouchableOpacity, StyleSheet,FlatList } from 'react-native';

const CategoryHome = (props) => {
    const { topCategoryData, navigateToCategories } = props;

    return (
        <FlatList
            data={topCategoryData}
            renderItem={({ item }, index) => <TouchableOpacity
                onPress={() => navigateToCategories(item)}
                key={"top" + index}
                style={{ justifyContent: 'space-between', alignItems: 'center', width: Dimensions.get('window').width * .25, padding: 5 }}
            >
                <Image
                    style={{
                        marginTop: 5, width: Dimensions.get('window').width * .25 - 10
                        , height: Dimensions.get('window').width * .33 - 10,
                    }}
                    source={{ uri: item.image_url }}
                />

            </TouchableOpacity>}
            keyExtractor={item => item.id}
            numColumns={4}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 0,
        backgroundColor: '#fff',
    },
    section: {
        marginBottom: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingRight: 10,
        paddingVertical: 8,
        borderRadius: 5,
        borderBottomColor: 'gray',
        borderBottomWidth: 1
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionContent: {
        marginTop: 5,
        paddingHorizontal: 10,
        paddingVertical: 8,
        //borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    sectionText: {
        fontSize: 14,
    },
});

export default CategoryHome;
