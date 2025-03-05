import { StatusBar } from 'expo-status-bar';
import React, { Component }  from 'react';
import { StyleSheet, Text, View, Button, Picker, ImageBackground, TextInput, TouchableOpacity, Pressable, FlatList, ScrollView, Alert} from 'react-native';
import { Image } from 'expo-image';
import { Octicons, FontAwesome, AntDesign, Ionicons, Feather, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import {Backend_Url} from './backend_url'
// secure store import
import * as SecureStore from 'expo-secure-store';

class Landing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        }

        this.HandleChange = (value, state) => {
            this.setState({ [state]: value })
        }
    };

    componentDidMount() {
        
    }


    render() {
        if (this.state.loading === true){
            return <View style={styles.container}>
                <View style={{borderTopColor: 'silver', borderTopWidth: 1}}></View>
                <View style={{marginTop: 'auto', marginBottom: 'auto', marginLeft: 20, marginRight: 20}}>
                    <Text style={{color: '#5c708b', fontWeight: 'bold', textAlign: 'center'}}>
                        Loading ...
                    </Text>
                </View>
            </View>
        }
        
        return <ImageBackground
            source={require('./assets/splash.png')} 
            style={{flex: 1, width: null, height: null, resizeMode: 'cover'}}
        >
            <View style={styles.container}>
                <Text style={{textAlign: 'left', marginTop: 50, fontSize: 40}}>
                    The future of farming, today
                </Text>
                <TouchableOpacity
                    key='Sign in'
                    onPress={() => this.props.navigation.navigate('Login')}
                    style={{
                        backgroundColor: '#40744dff', marginLeft: 'auto', marginRight: 'auto', marginTop: 200, width: '90%', height: 50, 
                        borderRadius: 10, borderWidth: 1, borderColor: '#40744dff'
                    }}
                >
                    <Text 
                        style={{
                            textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', fontWeight: 'bold', color: '#FFFFFF', fontSize: 17
                        }}
                    >
                        Sign in
                    </Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    }

}

export default Landing;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
    //   textAlign: 'left',
    //   justifyContent: 'center'
    },
    scroll_view: {
        height: 2
    },
    bottom_bar: {
        // borderTopWidth: 1,
        // borderTopColor: 'gold',
        // flexDirection: 'row',
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        position: 'absolute', 
        left: 0, 
        right: 0, 
        bottom: 0
    }
});