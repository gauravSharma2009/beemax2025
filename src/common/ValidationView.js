import React, { useEffect, useState } from 'react';
import { View, Text, } from 'react-native';
import { buttonBgColor } from './colours';



export default ValidationView = (props) => {
    const { inputComponent, name, value, error, messages } = props
    useEffect(() => {
        console.log("error : ", error)
    })
    return (
        <View style={{ width: '100%', paddingBottom: 8, }}>
            {inputComponent}
            {error && error[name] ? <View style={{ width: '100%',paddingHorizontal:10 }}><Text style={{ color: buttonBgColor,marginTop:5 }}>{error[name]}</Text></View> : null}
        </View>
    );
}



