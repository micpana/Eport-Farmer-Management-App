import { StatusBar } from 'expo-status-bar';
import React, { Component }  from 'react';
import { StyleSheet, Text, View, Button, Picker, Image, TextInput, TouchableOpacity, Pressable, FlatList, ScrollView, Alert} from 'react-native';
import { Octicons, FontAwesome, AntDesign, Ionicons, Feather, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import {Backend_Url} from './backend_url'
// secure store import
import * as SecureStore from 'expo-secure-store';
// navigation
import { CommonActions } from '@react-navigation/native';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            email: '',
            password: ''
        }

        this.HandleChange = (value, state) => {
            this.setState({ [state]: value })
        }

        this.Login = () => {
            var email = this.state.email
            var password = this.state.password

            if (email === ''){
                alert('Email is required.')
            }else if (password === ''){
                alert('Password is required.')
            }else{
                this.setState({loading: true})
    
                var data = new FormData() 
                data.append('email', email)
                data.append('password', password)
                
                axios.post(Backend_Url + 'signin', data)
                .then(async (res) => {
                    let result = res.data
                    // store access token
                    await SecureStore.setItemAsync('token', result.token);
                    // store username
                    await SecureStore.setItemAsync('user_name', result.username);
                    
                    alert('Signin successful.')
                    this.setState({stage: 'email', email: '', password: '', loading: false})
                    this.props.navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'Dashboard' }],
                        })
                    );
                    this.props.navigation.navigate('Dashboard')
                }).catch((error) => {
                    console.log(error)
                    if (error.response){ // server responded with a non-2xx status code
                        let status_code = error.response.status
                        let result = error.response.data
                        if(result === 'invalid credentials'){ alert('Invalid credentials entered.') }
                        else{
                            alert('(Error '+status_code.toString()+': '+result.toString()+')')
                        }
                    }else if (error.request){ // request was made but no response was received ... network error
                        alert('Something went wrong. Please check your connection and try again.')
                    }else{ // error occured during request setup ... no network access
                        alert('No internet connection found. Please check your connection and try again.')
                    }
                    this.setState({loading: false})
                })
            }
        }
    };

    componentDidMount() {

    }


    render() {
        if (this.state.loading === true){
            return<View style={styles.container}>
                <View style={{borderTopColor: 'silver', borderTopWidth: 1}}></View>
                <View style={{marginTop: 'auto', marginBottom: 'auto', marginLeft: 20, marginRight: 20}}>
                    <Text style={{color: '#5c708b', fontWeight: 'bold', textAlign: 'center'}}>
                        Loading ...
                    </Text>
                </View>
            </View>
        }
        
        return<View style={styles.container}>
            
        </View>
    }

}

export default Login;

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
        flexDirection: 'row',
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