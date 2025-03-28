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
                    // store user role
                    await SecureStore.setItemAsync('user_role', result.role);
                    
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
            return<View style={styles.container}>
                <View style={{marginTop: 'auto', marginBottom: 'auto', marginLeft: 20, marginRight: 20}}>
                    <Text style={{color: '#40744d', fontWeight: 'bold', textAlign: 'center'}}>
                        Loading ...
                    </Text>
                </View>
            </View>
        }
        
        return<View style={styles.container}>
            <ScrollView style={styles.scroll_view}>
                <View>
                    <Image source={require('../assets/signin-top-background.png')} 
                        style={{
                            width: '100%', height: 174, marginLeft: 'auto', marginRight: 'auto', resizeMode: 'contain'
                        }}
                    />
                </View>
                <View style={{marginLeft: 20, marginRight: 20}}>
                    <Text style={{color: '#40744d', fontWeight: 'bold', textAlign: 'center', fontSize: 30, marginTop: 40}}>
                        Welcome Back
                    </Text>
                    <Text style={{color: 'grey', textAlign: 'center', fontSize: 15, marginTop: 20}}>
                        Sign in to continue
                    </Text>
                    <TextInput
                        // autoFocus={true}
                        onChangeText={(text) => this.HandleChange(text, "email")}
                        placeholder="Email"
                        placeholderTextColor='#40744d'
                        value={this.state.email}
                        style={{
                            alignSelf: 'center', width: '100%', marginTop: 50, borderWidth: 0, borderColor: 'transparent',
                            backgroundColor: '#dae5dd', color: '#40744d', borderRadius: 10
                        }}
                    />
                    <TextInput
                        // autoFocus={true}
                        onChangeText={(text) => this.HandleChange(text, "password")}
                        placeholder="Password"
                        placeholderTextColor='grey'
                        value={this.state.password}
                        secureTextEntry={true}
                        style={{
                            alignSelf: 'center', width: '100%', marginTop: 20, borderWidth: 0, borderColor: 'transparent',
                            backgroundColor: '#dae5dd', color: '#40744d', borderRadius: 10
                        }}
                    />
                    <TouchableOpacity
                        key='Login'
                        onPress={() => this.Login()}
                        style={{
                            backgroundColor: '#40744d', marginLeft: 'auto', marginRight: 'auto', marginTop: 170, width: '90%', height: 50, 
                            borderRadius: 10, borderWidth: 1, borderColor: '#40744d'
                        }}
                    >
                        <Text 
                            style={{
                                textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', fontWeight: 'bold', color: '#FFFFFF', fontSize: 17
                            }}
                        >
                            Login
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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