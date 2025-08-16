import React, { useEffect, useState } from "react"
import { Text, View } from "react-native"
// import { textColor } from "styled-system";
import { server } from "../common/apiConstant";
import { whiteTxtColor } from "../common/colours";
import Header from "../components/Header";

function NeedHelpScreen(props) {
    const { navigation } = props
    const [contactInfo, setContactInfo] = useState(null)
    useEffect(() => {
        var myHeaders = new Headers();
        myHeaders.append("Cookie", "ci_session=bd482993a0b971df7891f08325089a2272e98dd6");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        fetch(`${server}contactinfo`, requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log(result)
                if (result && result.status && result.data && result.data.length > 0) {
                    setContactInfo(result.data[0])
                }
            })
            .catch(error => console.log('error', error));
    }, [])
    return (
        <View style={{ flex: 1, backgroundColor: whiteTxtColor }}><Header
            navigation={navigation}
            name={"Need Help?"}
        />
            {/* <Text style={{ marginTop: 50, alignSelf: 'center', fontSize: 18, fontFamily: 'Poppins-SemiBold', color: textColor }}>Contact Us For Any Questions</Text>
            <View style={{ flexDirection: 'row', marginTop: 30 }}>
                <View style={{ flex: .4, paddingHorizontal: 20 }}>
                    <Text style={{ marginTop: 5, fontSize: 16, fontFamily: 'Poppins-SemiBold', color: textColor }}>Phone Support</Text>
                    <Text style={{ marginTop: 5, fontSize: 12, fontFamily: 'Poppins-Regular', color: textColor }}>{contactInfo?.MOBILE}</Text>
                    <Text style={{ marginTop: 5, fontSize: 12, fontFamily: 'Poppins-Regular', color: textColor }}>{contactInfo?.PHONE}</Text>
                </View>
                <View style={{ flex: .6, paddingHorizontal: 10 }}>
                    <Text style={{ marginTop: 5, fontSize: 16, fontFamily: 'Poppins-SemiBold', color: textColor }}>EmailSupport</Text>
                    <Text style={{ marginTop: 5, fontSize: 12, fontFamily: 'Poppins-Regular', color: textColor }}>{contactInfo?.EMAIL}</Text>
                    <Text style={{ marginTop: 5, fontSize: 12, fontFamily: 'Poppins-Regular', color: textColor }}>{contactInfo?.WEBSITE}</Text>
                </View>
            </View>
            <View style={{ flex: 1, paddingHorizontal: 20, marginTop: 50 }}>
                <Text style={{ marginTop: 5, fontSize: 16, fontFamily: 'Poppins-SemiBold', color: textColor }}>Office Address</Text>
                <Text style={{ marginTop: 5, fontSize: 12, fontFamily: 'Poppins-Regular', color: textColor }}>{contactInfo?.ADDRESS}</Text>
            </View> */}
        </View>
    )
}
// Contact Us For Any Questions
// Phone Support
// +91 91234 56789
// +9111 49425953
// EmailSupport
// info@responsivetechno.com
// support@responsivetechno.com
// Office Address
// Responsive Techno Private Limited.
// Ground Floor, C-5/41 & 42. Sector-6, Rohini, Delhi, 110085
const NeedHelp = NeedHelpScreen;
export default NeedHelp;