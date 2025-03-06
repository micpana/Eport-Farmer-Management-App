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
                
        this.GetUserData = async () => {
            var should_reload = false

            // get access token
            let token = await SecureStore.getItemAsync('token');
            if (token){
                this.setState({user_access_token: token})
            }else{ should_reload = true }

            // get username
            let user_name = await SecureStore.getItemAsync('user_name');
            if (user_name){
                this.setState({user_name: user_name})
            }else{ should_reload = true }

            if (should_reload == true){  const timeoutId = setTimeout(() => {this.GetUserData()}, 1000) }
            else{ 
                this.props.navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'Dashboard' }],
                    })
                );
                this.props.navigation.navigate('Dashboard') 
            }
        }
    };

    async componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            // get user data
            this.GetUserData();
        });
        
        // get user data
        this.GetUserData()
    }

    render() {
        if (this.state.loading === true){
            return <View style={styles.container}>
                <View style={{marginTop: 'auto', marginBottom: 'auto', marginLeft: 20, marginRight: 20}}>
                    <Text style={{color: '#5c708b', fontWeight: 'bold', textAlign: 'center'}}>
                        Loading ...
                    </Text>
                </View>
            </View>
        }
        
        return <ImageBackground
            source={require('../assets/landing-background.jpg')} 
            style={{flex: 1, width: null, height: null, resizeMode: 'fit'}}
        >
            <View style={styles.container}>
                <View style={{marginLeft: 20, marginRight: 20}}>
                    <Text style={{
                        textAlign: 'left', marginTop: 90, fontSize: 40, color: '#ffffff', fontWeight: '600'
                    }}>
                        The future of farming, today
                    </Text>
                    <TouchableOpacity
                        key='Sign in'
                        onPress={() => this.props.navigation.navigate('Login')}
                        style={{
                            backgroundColor: '#40744d', marginLeft: 'auto', marginRight: 'auto', marginTop: 200, width: '100%', height: 50, 
                            borderRadius: 20, borderWidth: 0, borderColor: 'transparent'
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
            </View>
        </ImageBackground>
    }

}

export default Landing;

const styles = StyleSheet.create({
    container: {
      flex: 1,
    //   backgroundColor: '#ffffff',
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