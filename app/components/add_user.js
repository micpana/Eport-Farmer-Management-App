import { StatusBar } from 'expo-status-bar';
import React, { Component }  from 'react';
import { Linking, StyleSheet, Text, View, Button, Picker, TextInput, TouchableOpacity, Pressable, FlatList, ScrollView, Alert} from 'react-native';
import { Image } from 'expo-image';
import { Octicons, FontAwesome, AntDesign, Ionicons, Feather, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import {Backend_Url} from './backend_url'
// dropdown picker
import DropDownPicker from 'react-native-dropdown-picker';
// secure store import
import * as SecureStore from 'expo-secure-store';

class AddUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            user_access_token: '',
            user_name: '',
            firstname: '',
            lastname: '',
            email: '',
            password: '',
            role: '',
            roles: [
                {label: 'Clerk', value: 'clerk'},
                {label: 'Admin', value: 'admin'}
            ]
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
        }

        this.Signout = async () => {
            // delete token key
            await SecureStore.deleteItemAsync('token')
            // delete username key
            await SecureStore.deleteItemAsync('user_name')

            alert('Your access token is no longer active. Signing you out.')
            this.props.navigation.navigate('Login')
        }

        this.setOpen1 = (open) => {
            this.setState({
                dropdown1_open: open
            });
        }

        this.setValue1 = (callback) => {
            this.setState(state => ({
                role: callback(state.role)
            }));
        }

        this.setItems1 = (callback) => {
            this.setState(state => ({
                roles: callback(state.roles)
            }));
        }

        this.AddUser = () => {
            var firstname = this.state.firstname
            var lastname = this.state.lastname
            var email = this.state.email
            var password = this.state.password
            var role = this.state.role

            if (firstname === ''){
                alert("Firstname is required")
            }else if(lastname === ''){
                alert("Lastname is required")
            }else if(email === ''){
                alert("Email is required")
            }else if(password === ''){
                alert("Password is required")
            }else if(role === ''){
                alert("Role is required")
            }else{
                this.setState({loading: true})

                var data = new FormData() 
                data.append('firstname', firstname)
                data.append('lastname', lastname)
                data.append('email', email)
                data.append('password', password)
                data.append('role', role)
                
                axios.post(Backend_Url + 'addAccount', data, { 
                    headers: { 'Access-Token': this.state.user_access_token }
                })
                .then((res) => {
                    let result = res.data
                    this.setState({
                        firstname: '',
                        lastname: '',
                        email: '',
                        password: '',
                        role: '',
                        loading: false
                    })
                    alert('User added successfully.')
                }).catch((error) => {
                    console.log(error)
                    if (error.response){ // server responded with a non-2xx status code
                        let status_code = error.response.status
                        let result = error.response.data
                        if(result === 'invalid token' || result === 'access token disabled via signout' || result === 'access token expired' || result === 'not authorized to access this'){ 
                            this.Signout()
                        }else{
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
            <View style={{marginLeft: 20, marginRight: 20}}>
                <Text style={{textAlign: 'left', color: '#40744d', marginTop: 50}}>
                    Role
                </Text>
                <DropDownPicker
                    // multiple={true}
                    // min={1}
                    // max={5}
                    open={this.state.dropdown1_open}
                    value={this.state.role}
                    items={this.state.roles}
                    setOpen={this.setOpen1}
                    setValue={this.setValue1}
                    // setItems={this.setItems1}
                    style={{
                        marginTop: 15, marginBottom: 15, backgroundColor: '#dae5dd', color: '#40744d', borderRadius: 10
                    }}
                />
            </View>
            <ScrollView style={styles.scroll_view}>
                <View style={{marginLeft: 20, marginRight: 20}}>
                    <TextInput
                        // autoFocus={true}
                        onChangeText={(text) => this.HandleChange(text, "firstname")}
                        placeholder="Firstname"
                        placeholderTextColor='#40744d'
                        value={this.state.firstname}
                        style={{
                            alignSelf: 'center', width: '100%', marginTop: 20, borderWidth: 0, borderColor: 'transparent',
                            backgroundColor: '#dae5dd', color: '#40744d', borderRadius: 10
                        }}
                    />
                    <TextInput
                        // autoFocus={true}
                        onChangeText={(text) => this.HandleChange(text, "lastname")}
                        placeholder="Lastname"
                        placeholderTextColor='#40744d'
                        value={this.state.lastname}
                        style={{
                            alignSelf: 'center', width: '100%', marginTop: 20, borderWidth: 0, borderColor: 'transparent',
                            backgroundColor: '#dae5dd', color: '#40744d', borderRadius: 10
                        }}
                    />
                    <TextInput
                        // autoFocus={true}
                        onChangeText={(text) => this.HandleChange(text, "email")}
                        placeholder="Email"
                        placeholderTextColor='#40744d'
                        value={this.state.email}
                        style={{
                            alignSelf: 'center', width: '100%', marginTop: 20, borderWidth: 0, borderColor: 'transparent',
                            backgroundColor: '#dae5dd', color: '#40744d', borderRadius: 10
                        }}
                    />
                    <TextInput
                        // autoFocus={true}
                        onChangeText={(text) => this.HandleChange(text, "password")}
                        placeholder="Password"
                        placeholderTextColor='#40744d'
                        value={this.state.password}
                        secureTextEntry={true}
                        style={{
                            alignSelf: 'center', width: '100%', marginTop: 20, borderWidth: 0, borderColor: 'transparent',
                            backgroundColor: '#dae5dd', color: '#40744d', borderRadius: 10
                        }}
                    />
                    <TouchableOpacity
                        key='AddUser'
                        onPress={() => this.AddUser()}
                        style={{
                            backgroundColor: '#40744d', marginLeft: 'auto', marginRight: 'auto', marginTop: 80, width: '90%', height: 50, 
                            borderRadius: 10, borderWidth: 1, borderColor: '#40744d'
                        }}
                    >
                        <Text 
                            style={{
                                textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', fontWeight: 'bold', color: '#FFFFFF', fontSize: 17
                            }}
                        >
                            AddUser
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    }

}

export default AddUser;

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