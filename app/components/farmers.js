import { StatusBar } from 'expo-status-bar';
import React, { Component }  from 'react';
import { Linking, StyleSheet, Text, View, Button, Picker, Image, TextInput, TouchableOpacity, Pressable, FlatList, ScrollView, Alert} from 'react-native';
import { Octicons, FontAwesome, AntDesign, Ionicons, Feather, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import {Backend_Url} from './backend_url'
// dropdown picker
import DropDownPicker from 'react-native-dropdown-picker';
// secure store import
import * as SecureStore from 'expo-secure-store';

class Farmers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            user_access_token: '',
            user_name: '',
            user_details: {},
            farmers: []
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
            else{ this.GetAccountDetails(); this.GetFarmers() }
        }

        this.Signout = async () => {
            // delete token key
            await SecureStore.deleteItemAsync('token')
            // delete username key
            await SecureStore.deleteItemAsync('user_name')

            alert('Your access token is no longer active. Signing you out.')
            this.props.navigation.navigate('Login')
        }

        this.GetAccountDetails = () => {
            this.setState({loading: true})
            axios.post(Backend_Url + 'getAccountDetails', null, { headers: { 'Access-Token': this.state.user_access_token }  })
            .then((res) => {
                let result = res.data
                this.setState({user_details: result, loading: false})
            }).catch((error) => {
                console.log(error)
                if (error.response){ // server responded with a non-2xx status code
                    let status_code = error.response.status
                    let result = error.response.data
                    if(result === 'invalid token' || result === 'access token disabled via signout' || result === 'access token expired' || result === 'not authorized to access this'){ 
                        this.Signout()
                    }
                    else{
                        // automatically retry
                        this.GetAccountDetails()
                    }
                }else if (error.request){ // request was made but no response was received ... network error
                    // automatically retry
                    this.GetAccountDetails()
                }else{ // error occured during request setup ... no network access
                    // automatically retry
                    this.GetAccountDetails()
                }
            })
        }

        this.GetFarmers = () => {
            this.setState({loading: true})
            axios.post(Backend_Url + 'getFarmers', null, { headers: { 'Access-Token': this.state.user_access_token }  })
            .then((res) => {
                let result = res.data
                this.setState({farmers: result, loading: false})
            }).catch((error) => {
                console.log(error)
                if (error.response){ // server responded with a non-2xx status code
                    let status_code = error.response.status
                    let result = error.response.data
                    if(result === 'invalid token' || result === 'access token disabled via signout' || result === 'access token expired' || result === 'not authorized to access this'){ 
                        this.Signout()
                    }
                    else{
                        // automatically retry
                        this.GetFarmers()
                    }
                }else if (error.request){ // request was made but no response was received ... network error
                    // automatically retry
                    this.GetFarmers()
                }else{ // error occured during request setup ... no network access
                    // automatically retry
                    this.GetFarmers()
                }
            })
        }

        this.HandleDelete = (farmer_id) => {
            Alert.alert(
                'Are you sure?', // Title
                'Do you really want to delete this item?', // Message
                [
                    {
                    text: 'Cancel',
                    onPress: () => console.log('Deletion cancelled'),
                    style: 'cancel',
                    },
                    {
                    text: 'Delete',
                    onPress: () => this.RemoveFarmer(farmer_id),
                    style: 'destructive',
                    },
                ],
                { cancelable: true }
            );
        };

        this.RemoveFarmer = (farmer_id) => {
            this.setState({loading: true})
    
            var data = new FormData() 
            data.append('farmer_id', farmer_id)

            axios.post(Backend_Url + 'removeFarmer', data, { headers: { 'Access-Token': this.state.user_access_token }  })
            .then((res) => {
                let result = res.data
                this.GetFarmers()
                alert('Farmer removed successfully')
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
            })
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

        if (this.state.farmers.length === 0){
            return<View style={styles.container}>
                <View style={{marginTop: 'auto', marginBottom: 'auto', marginLeft: 20, marginRight: 20}}>
                    <Text style={{color: '#40744d', fontWeight: 'bold', textAlign: 'center'}}>
                        No farmers found.
                    </Text>
                </View>
            </View>
        }

        var farmers_map = this.state.farmers.map((item, index) => {
            return <View key={'Farmer_'+index.toString()}
                style={{
                    borderColor: 'silver', borderWidth: 1, borderRadius: 10, marginBottom: 20
                }}
            >
                <View style={{margin: 10}}>
                    <Text style={{color: '#40744d', fontWeight: 'bold', fontSize: 15, textAlign: 'left'}}>
                        {item.name}
                    </Text>
                    <View style={{flexDirection: 'row', marginTop: 20}}>
                        <View style={{flexDirection: 'column', width: '50%'}}>
                            <Text style={{color: '#40744d', fontSize: 12, textAlign: 'left'}}>
                                National ID: {item.national_id}
                            </Text>
                        </View>
                        <View style={{flexDirection: 'column', width: '50%'}}>
                            <Text style={{color: '#40744d', fontSize: 12, textAlign: 'left'}}>
                                Farm ID: {item.farm_id}
                            </Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 20}}>
                        <View style={{flexDirection: 'column', width: '50%'}}>
                            <Text style={{color: '#40744d', fontSize: 12, textAlign: 'left'}}>
                                Farm Type: {item.farm_type}
                            </Text>
                        </View>
                        <View style={{flexDirection: 'column', width: '50%'}}>
                            <Text style={{color: '#40744d', fontSize: 12, textAlign: 'left'}}>
                                Crop: {item.crop}
                            </Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 20}}>
                        <View style={{flexDirection: 'column', width: '50%'}}>
                            <Text style={{color: '#40744d', fontSize: 12, textAlign: 'left'}}>
                                Location: {item.location}
                            </Text>
                        </View>
                        <View style={{flexDirection: 'column', width: '25%'}}>
                            <TouchableOpacity
                                key='EditFarmer'
                                onPress={() => this.props.navigation.navigate('Edit Farmer', {farmer: item})}
                                style={{
                                    backgroundColor: 'inherit'
                                }}
                            >
                                <Feather name='edit' color={'red'} size={20} />
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection: 'column', width: '25%'}}>
                            <TouchableOpacity
                                key='RemoveFarmer'
                                onPress={() => this.HandleDelete(item._id.$oid)}
                                style={{
                                    backgroundColor: 'inherit'
                                }}
                            >
                                <Feather name='trash-2' color={'red'} size={20} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        })

        return<View style={styles.container}>
            <ScrollView style={styles.scroll_view}>
                <View style={{
                        marginLeft: 20, marginRight: 20, marginTop: 50
                    }}
                >
                    {farmers_map}
                </View>
            </ScrollView>
        </View>
    }

}

export default Farmers;

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