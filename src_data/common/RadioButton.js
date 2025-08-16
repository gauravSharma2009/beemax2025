import React from 'react';
import { View, StyleSheet } from 'react-native';
import { allCategoryPink } from './colours';

const RadioButton = (props) => {
    const { isSelected } = props;
    return (
        <View style={styles.container}>
            <View style={{ ...styles.radioButton, borderColor: isSelected ? allCategoryPink : "#a1a1a1", alignSelf: 'center' }}>
                <View
                    style={[
                        styles.radioButtonInner,
                        isSelected ? styles.radioButtonSelected : "#a1a1a1",
                        { backgroundColor: isSelected ? allCategoryPink : "#fff", alignSelf: 'center' }
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 5
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'gray',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'blue',
    },
    radioButtonSelected: {
        backgroundColor: 'blue',
    },
});

export default RadioButton;
