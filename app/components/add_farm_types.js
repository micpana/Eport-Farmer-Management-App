import { StatusBar } from 'expo-status-bar';
import React, { Component }  from 'react';
import { StyleSheet, Text, SafeAreaView, View, Button, Picker, TextInput, TouchableOpacity, Pressable, FlatList, ScrollView, Alert} from 'react-native';
import { Image } from 'expo-image';
import { Octicons, FontAwesome, AntDesign, Ionicons, Feather, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import {Backend_Url} from './backend_url'
// secure store import
import * as SecureStore from 'expo-secure-store';

class AddFarmTypes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            user_access_token: '',
            user_name: '',
            type: ''
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

        this.AddFarmType = () => {
            var type = this.state.type

            if (type === ''){
                alert("Farm type is required")
            }else{
                this.setState({loading: true})

                var data = new FormData() 
                data.append('type', type)
                
                axios.post(Backend_Url + 'addFarmType', data, { 
                    headers: { 'Access-Token': this.state.user_access_token }
                })
                .then((res) => {
                    let result = res.data
                    this.setState({
                        type: '',
                        loading: false
                    })
                    alert('Farm Type added successfully.')
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
            <ScrollView style={styles.scroll_view}>
                <View style={{marginLeft: 20, marginRight: 20}}>
                    <TextInput
                        // autoFocus={true}
                        onChangeText={(text) => this.HandleChange(text, "type")}
                        placeholder="Farm type"
                        placeholderTextColor='#40744d'
                        value={this.state.type}
                        style={{
                            alignSelf: 'center', width: '100%', marginTop: 80, borderWidth: 0, borderColor: 'transparent',
                            backgroundColor: '#dae5dd', color: '#40744d', borderRadius: 10
                        }}
                    />
                    <TouchableOpacity
                        key='Add-Farm-Type'
                        onPress={() => this.AddFarmType()}
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
                            Add
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    }

}

export default AddFarmTypes;

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