import React, { useEffect, useState } from "react"
import { ScrollView, Text, View } from "react-native"
import Header from "../components/Header";
import { server } from '../common/apiConstant'
import { TouchableOpacity } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';

import { whiteTxtColor } from "../common/colours";
import { Image } from "react-native";

function CmsPage(props) {
    const { navigation, route } = props
    const { item } = route?.params

    const [data, setData] = useState(null)
    const [aboutUsTitle, setAboutUsTitle] = useState("")
    const [aboutUsDesc, setAboutUsDesc] = useState("")
    // const [data, setData] = useState(null)
    // const [data, setData] = useState(null)
    // const [data, setData] = useState(null)
    // const [data, setData] = useState(null)

    useEffect(() => {
        getData()
    }, [])
    const getData = () => {
        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=23437e2312548766b8a374f1fe83548def9ed297");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        fetch(`${server}cmspagebyid/${item.redirection_id}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                if (result && result.status) {
                    setAboutUsDesc(result.data?.[0]?.DESCRIPTION)
                    setAboutUsTitle(result.data?.[0]?.TITLE)
                }
            })
            .catch(error => console.log('error cms', error));
    }
    return (
        <View style={{ flex: 1 }}>
            <View style={{ justifyContent: 'center', flex: .06, width: "100%", backgroundColor: '#3b006a', flexDirection: 'row', paddingVertical: 15 }}>
                <Ionicons
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: 10, position: 'absolute', left: 0, top: 18 }}
                    name="ios-chevron-back-outline"
                    size={32}
                    color={whiteTxtColor} />
                <Text
                    style={{ fontSize: 15, color: 'white', fontFamily: 'Poppins-SemiBold', alignSelf: 'center' }}>{aboutUsTitle}</Text>

            </View>
            <ScrollView style={{ flex: .94 }}>
                <Text style={{
                    fontFamily: 'Poppins-Regular', padding: 10, justifyContent: 'center'
                }}>{aboutUsDesc}</Text>
            </ScrollView>
        </View>
    )
}
const Cms = CmsPage;
export default Cms;