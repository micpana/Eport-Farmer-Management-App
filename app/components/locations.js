import { StatusBar } from 'expo-status-bar';
import React, { Component }  from 'react';
import { Linking, StyleSheet, Text, View, Button, Picker, TextInput, TouchableOpacity, Pressable, FlatList, ScrollView, Alert} from 'react-native';
import { Image } from 'expo-image';
import { Octicons, FontAwesome, AntDesign, Ionicons, Feather, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import {Backend_Url} from './backend_url'
// secure store import
import * as SecureStore from 'expo-secure-store';

class Locations extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            user_access_token: '',
            user_name: '',
            locations: [],
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
            else{ this.GetLocations() }
        }

        this.Signout = async () => {
            // delete token key
            await SecureStore.deleteItemAsync('token')
            // delete username key
            await SecureStore.deleteItemAsync('user_name')

            alert('Your access token is no longer active. Signing you out.')
            this.props.navigation.navigate('Login')
        }

        this.GetLocations = () => {
            this.setState({loading: true})
            axios.post(Backend_Url + 'getLocations', null, { headers: { 'Access-Token': this.state.user_access_token }  })
            .then((res) => {
                let result = res.data
                this.setState({locations: result, loading: false})
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
                        this.GetLocations()
                    }
                }else if (error.request){ // request was made but no response was received ... network error
                    // automatically retry
                    this.GetLocations()
                }else{ // error occured during request setup ... no network access
                    // automatically retry
                    this.GetLocations()
                }
            })
        }

        this.HandleDelete = (location_id) => {
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
                    onPress: () => this.RemoveLocation(location_id),
                    style: 'destructive',
                    },
                ],
                { cancelable: true }
            );
        };

        this.RemoveLocation = (location_id) => {
            this.setState({loading: true})
    
            var data = new FormData() 
            data.append('location_id', location_id)

            axios.post(Backend_Url + 'deleteLocation', data, { headers: { 'Access-Token': this.state.user_access_token }  })
            .then((res) => {
                let result = res.data
                this.GetLocations()
                alert('Location removed successfully')
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
        
        return<View style={styles.container}>
            <ScrollView style={styles.scroll_view}>
                <View style={{marginLeft: 20, marginRight: 20, marginTop: 50}}>
                    <View style={{flexDirection: 'row', marginBottom: 50}}>
                        <View style={{flexDirection: 'column', backgroundColor: '#ffffff', width: '30%', height: 80}}>
                            <TouchableOpacity
                                key='Add-Location-Nav'
                                onPress={() => this.props.navigation.navigate('Add Locations')}
                                style={{
                                    backgroundColor: 'inherit', marginLeft: 'auto', marginRight: 'auto'
                                }}
                            >
                                <Feather name='plus' color={'#40744d'} size={25}
                                    style={{marginLeft: 'auto', marginRight: 'auto', marginTop: 10}}
                                />
                                <Text 
                                    style={{
                                        textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', color: '#40744d', fontSize: 13,
                                        marginTop: 5
                                    }}
                                >
                                    Add Location
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {
                        this.state.locations.length === 0
                        ? <View style={{marginTop: 'auto', marginBottom: 'auto', marginLeft: 20, marginRight: 20}}>
                            <Text style={{color: '#40744d', fontWeight: 'bold', textAlign: 'center'}}>
                                No locations found.
                            </Text>
                        </View>
                        : this.state.locations.map((item, index) => {
                            return <View key={'Location-'+index.toString()}
                                style={{
                                    borderColor: 'silver', borderWidth: 1, borderRadius: 10, marginBottom: 30
                                }}
                            >
                                <Text key={'Location'+index.toString()}
                                    style={{
                                        textAlign: 'left', margin: 10,
                                        color: '#40744d'
                                    }} 
                                >
                                    <TouchableOpacity
                                        key='RemoveCrop'
                                        onPress={() => this.HandleDelete(item._id.$oid)}
                                        style={{
                                            backgroundColor: 'inherit', paddingRight: 20
                                        }}
                                    >
                                        <Feather name='trash-2' color={'red'} size={20} />
                                    </TouchableOpacity>
                                    {item.name}
                                </Text>
                            </View>
                        })
                    }
                </View>
            </ScrollView>
        </View>
    }

}

export default Locations;

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