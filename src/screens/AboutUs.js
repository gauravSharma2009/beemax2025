import React, { useEffect, useState } from "react"
import { ScrollView, Text, View } from "react-native"
import Header from "../components/Header";
import { server } from '../common/apiConstant'
function AboutUsScreen(props) {
    const { navigation } = props
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

        fetch(`${server}cmspages`, requestOptions)
            .then(response => response.json())
            .then(result => {
                 console.log("result about us : ", JSON.stringify(result))
                if (result && result.status) {
                    setData(result.data)
                    setAboutUsDesc(result.data?.aAboutUs[0]?.DESCRIPTION)
                    setAboutUsTitle(result.data?.aAboutUs[0]?.TITLE)
                    //alert(JSON.stringify(result.data?.aAboutUs))
                }
            })
            .catch(error => console.log('error', error));
    }
    return (
        <View style={{ flex: 1 }}><Header
            navigation={navigation}
            name={"About Us"}
        />
            <ScrollView style={{ paddingHorizontal: 10, height: '93%', }}>
                {data?.aAboutUs && <View style={{ marginTop: 20, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 18 }}>{data?.aAboutUs[0].TITLE}</Text>
                    <Text style={{ fontFamily: "Poppins-Regular", fontSize: 15 }}>{data?.aAboutUs[0].DESCRIPTION}</Text>

                </View>}
                {data?.aFaq && <View style={{ marginTop: 20, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 18 }}>{data?.aFaq[0].TITLE}</Text>
                    <Text style={{ fontFamily: "Poppins-Regular", fontSize: 15 }}>{data?.aFaq[0].DESCRIPTION}</Text>

                </View>}
                {data?.aCareer && <View style={{ marginTop: 20, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 18 }}>{data?.aCareer[0].TITLE}</Text>
                    <Text style={{ fontFamily: "Poppins-Regular", fontSize: 15 }}>{data?.aCareer[0].DESCRIPTION}</Text>

                </View>}
            </ScrollView>
        </View>
    )
}
const AboutUs = AboutUsScreen;
export default AboutUs;