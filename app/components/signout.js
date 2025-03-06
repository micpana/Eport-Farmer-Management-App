import { StatusBar } from 'expo-status-bar';
import React, { Component }  from 'react';
import { Linking, StyleSheet, Text, View, Button, Picker, Image, TextInput, TouchableOpacity, Pressable, FlatList, ScrollView, Alert} from 'react-native';
import { Octicons, FontAwesome, AntDesign, Ionicons, Feather, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import {Backend_Url} from './backend_url'
// secure store import
import * as SecureStore from 'expo-secure-store';

class Signout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            user_access_token: '',
            user_name: ''
        }

        this.HandleChange = (value, state) => {
            this.setState({ [state]: value })
        }

        this.Signout = async () => {
            // delete token key
            await SecureStore.deleteItemAsync('token')
            // delete username key
            await SecureStore.deleteItemAsync('user_name')
            // redirect to login page
            this.props.navigation.navigate('Landing')
        }

        this.Signout_ = () => {
            this.setState({loading: true})
            axios.post(Backend_Url + 'signout', null, { headers: { 'Access-Token': this.state.user_access_token }  })
            .then(async(res) => {
                let result = res.data
                this.setState({ loading: false })
                this.Signout()
                alert('Sign out successful')
            }).catch((error) => {
                console.log(error)
                if (error.response){ // server responded with a non-2xx status code
                    let status_code = error.response.status
                    let result = error.response.data
                    if(result === 'invalid token' || result === 'access token disabled via signout' || result === 'access token expired' || result === 'not authorized to access this'){ 
                        this.Signout()
                    }
                    else{
                        this.setState({ loading: false })
                        alert('Something went wrong. Please try again.')
                    }
                }else if (error.request){ // request was made but no response was received ... network error
                    // automatically retry
                    this.Signout_()
                }else{ // error occured during request setup ... no network access
                    // automatically retry
                    this.Signout_()
                }
            })
        }

        this.GetUserDetails = async () => {
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

            if (should_reload == true){  const timeoutId = setTimeout(() => {this.GetUserDetails()}, 1000) }
        }
    };

    componentDidMount() {
        // get user details
        this.GetUserDetails()
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
                <Text style={{color: '#40744d', fontWeight: 'bold', fontSize: 18, marginTop: 180, textAlign: 'center'}}>
                    {this.state.user_name}
                </Text>
                <TouchableOpacity
                    key='Signout'
                    onPress={() => this.Signout_()}
                    style={{backgroundColor: '#40744d', marginLeft: 'auto', marginRight: 'auto', marginTop: 100, marginBottom: 0, width: '90%', height: 50, borderRadius: 5, borderWidth: 1, borderColor: '#40744d'}}
                >
                    <Text style={{textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', fontWeight: 'bold', color: '#FFFFFF', fontSize: 17}}>
                        Signout
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    }

}

export default Signout;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
    //   textAlign: 'left',
    //   justifyContent: 'center'
    },
    header: {
        height: 40
    },
    search_bar: {
        // borderBottomWidth: 0.1,
        // borderBottomColor: '#eaeaea',
        flexDirection: 'row',
        backgroundColor: '#f2f2f2',
        // alignItems: 'center',
        // justifyContent: 'center',
        height: 50,
        marginTop: 50,
        position: 'absolute', 
        left: 0, 
        right: 0, 
        top: 0
    },
    top_bar: {
        borderBottomWidth: 0.1,
        borderBottomColor: '#eaeaea',
        // flexDirection: 'row',
        backgroundColor: '#ffffff',
        // alignItems: 'center',
        // justifyContent: 'center',
        height: 100,
        position: 'absolute', 
        left: 0, 
        right: 0, 
        top: 0
    },
    scroll_view: {
        height: 2,
        marginLeft: 10,
        marginRight: 10
    },
    bottom_bar: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        height: 70,
        position: 'absolute', 
        left: 0, 
        right: 0, 
        bottom: 0
    }
});