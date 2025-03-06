import { StatusBar } from 'expo-status-bar';
import React, { Component }  from 'react';
import { StyleSheet, Text, View, Button, Picker, Image, TextInput, TouchableOpacity, Pressable, FlatList, ScrollView, Alert} from 'react-native';
import { Octicons, FontAwesome, AntDesign, Ionicons, Feather, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import {Backend_Url} from './backend_url'
// secure store import
import * as SecureStore from 'expo-secure-store';

class Splash extends Component {
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
            return<View style={styles.container}>
                <StatusBar style="auto" hidden={true} />
                <View style={{marginTop: 'auto', marginBottom: 'auto', marginLeft: 20, marginRight: 20}}>
                    <Text style={{color: '#5c708b', fontWeight: 'bold', textAlign: 'center'}}>
                        Loading ...
                    </Text>
                </View>
            </View>
        }
        
        return<View style={{flex: 1, backgroundColor: '#40744d', width: '100%'}}>
            <StatusBar style="auto" hidden={true} />
            <View>
                <Image source={require('../assets/splash.png')} style={{width: '100%', height: 700, marginLeft: 'auto', marginRight: 'auto', resizeMode: 'contain'}}/>
            </View>
        </View>
    }

}

export default Splash;

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