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

class AddFarmer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            user_access_token: '',
            user_name: '',
            name: '',  
            national_id: '',   
            farm_id: '',  
            farm_type: '',  
            crop: '',  
            location: '',
            crops: [
                {label: 'Choose a crop', value: ''}
            ],
            farm_types: [
                {label: 'Choose a farm type', value: ''}
            ],
            locations: [
                {label: 'Choose a location', value: ''}
            ],
            screen: 1,
            total_screens: 4
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

        this.GetCrops = () => {
            this.setState({loading: true})
            axios.post(Backend_Url + 'getCrops', null, { headers: { 'Access-Token': this.state.user_access_token }  })
            .then((res) => {
                let result = res.data
                let crops = this.state.crops
                result.map((item, index) => {
                    crops.append(
                        {label: item.name, value: item.name}
                    )
                })
                this.setState({crops: crops, loading: false})
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
                        this.GetCrops()
                    }
                }else if (error.request){ // request was made but no response was received ... network error
                    // automatically retry
                    this.GetCrops()
                }else{ // error occured during request setup ... no network access
                    // automatically retry
                    this.GetCrops()
                }
            })
        }

        this.GetFarmTypes = () => {
            this.setState({loading: true})
            axios.post(Backend_Url + 'getFarmTypes', null, { headers: { 'Access-Token': this.state.user_access_token }  })
            .then((res) => {
                let result = res.data
                let farm_types = this.state.farm_types
                result.map((item, index) => {
                    farm_types.append(
                        {label: item.type, value: item.type}
                    )
                })
                this.setState({farm_types: farm_types, loading: false})
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
                        this.GetFarmTypes()
                    }
                }else if (error.request){ // request was made but no response was received ... network error
                    // automatically retry
                    this.GetFarmTypes()
                }else{ // error occured during request setup ... no network access
                    // automatically retry
                    this.GetFarmTypes()
                }
            })
        }

        this.GetLocations = () => {
            this.setState({loading: true})
            axios.post(Backend_Url + 'getLocations', null, { headers: { 'Access-Token': this.state.user_access_token }  })
            .then((res) => {
                let result = res.data
                let locations = this.state.locations
                result.map((item, index) => {
                    locations.append(
                        {label: item.name, value: item.name}
                    )
                })
                this.setState({locations: locations, loading: false})
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

        this.setOpen1 = (open) => {
            this.setState({
                dropdown1_open: open
            });
        }

        this.setValue1 = (callback) => {
            this.setState(state => ({
                crop: callback(state.crop)
            }));
        }

        this.setItems1 = (callback) => {
            this.setState(state => ({
                crops: callback(state.crops)
            }));
        }

        this.setOpen2 = (open) => {
            this.setState({
                dropdown2_open: open
            });
        }

        this.setValue2 = (callback) => {
            this.setState(state => ({
                farm_type: callback(state.farm_type)
            }));
        }

        this.setItems2 = (callback) => {
            this.setState(state => ({
                farm_types: callback(state.farm_types)
            }));
        }

        this.setOpen3 = (open) => {
            this.setState({
                dropdown3_open: open
            });
        }

        this.setValue3 = (callback) => {
            this.setState(state => ({
                location: callback(state.location)
            }));
        }

        this.setItems3 = (callback) => {
            this.setState(state => ({
                locations: callback(state.locations)
            }));
        }

        this.AddFarmer = () => {
            var name = this.state.name
            var national_id = this.state.national_id
            var farm_id = this.state.farm_id
            var farm_type = this.state.farm_type
            var crop = this.state.crop
            var location = this.state.location

            if (name === ''){
                alert("Farmer's name is required")
            }else if(national_id === ''){
                alert("National ID is required")
            }else if(farm_id === ''){
                alert("Farm ID is required")
            }else if(farm_type === ''){
                alert("Farm Type is required")
            }else if(crop === ''){
                alert("Crop is required")
            }else if(location === ''){
                alert("Location is required")
            }else{
                this.setState({loading: true})

                var data = new FormData() 
                data.append('name', name)
                data.append('national_id', national_id)
                data.append('farm_id', farm_id)
                data.append('farm_type', farm_type)
                data.append('crop', crop)
                data.append('location', location)
                
                axios.post(Backend_Url + 'addFarmer', data, { 
                    headers: { 'Access-Token': this.state.user_access_token }
                })
                .then((res) => {
                    let result = res.data
                    this.setState({
                        name: '',  
                        national_id: '',   
                        farm_id: '',  
                        farm_type: '',  
                        crop: '',  
                        location: '',
                        loading: false
                    })
                    alert('Farmer added successfully.')
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
            <View
                style={{marginLeft: 20, marginRight: 20}}
            >
                {
                    this.state.screen === 1
                    ? <View>
                        <TextInput
                            // autoFocus={true}
                            onChangeText={(text) => this.HandleChange(text, "name")}
                            placeholder="Farmer's name"
                            placeholderTextColor='#40744d'
                            value={this.state.name}
                            style={{
                                alignSelf: 'center', width: '100%', marginTop: 80, borderWidth: 0, borderColor: 'transparent',
                                backgroundColor: '#dae5dd', color: '#40744d', borderRadius: 10
                            }}
                        />
                        <TextInput
                            // autoFocus={true}
                            onChangeText={(text) => this.HandleChange(text, "national_id")}
                            placeholder="National ID"
                            placeholderTextColor='#40744d'
                            value={this.state.national_id}
                            style={{
                                alignSelf: 'center', width: '100%', marginTop: 30, borderWidth: 0, borderColor: 'transparent',
                                backgroundColor: '#dae5dd', color: '#40744d', borderRadius: 10
                            }}
                        />
                        <TextInput
                            // autoFocus={true}
                            onChangeText={(text) => this.HandleChange(text, "farm_id")}
                            placeholder="Farm ID"
                            placeholderTextColor='#40744d'
                            value={this.state.farm_id}
                            style={{
                                alignSelf: 'center', width: '100%', marginTop: 30, borderWidth: 0, borderColor: 'transparent',
                                backgroundColor: '#dae5dd', color: '#40744d', borderRadius: 10
                            }}
                        />
                    </View>
                    : this.state.screen === 2
                    ? <View>
                        <Text style={{textAlign: 'left', color: '#40744d', marginTop: 50}}>
                            Farm Type
                        </Text>
                        <DropDownPicker
                            // multiple={true}
                            // min={1}
                            // max={5}
                            open={this.state.dropdown2_open}
                            value={this.state.farm_type}
                            items={this.state.farm_types}
                            setOpen={this.setOpen2}
                            setValue={this.setValue2}
                            // setItems={this.setItems2}
                            style={{
                                marginTop: 30, marginBottom: 15, backgroundColor: '#dae5dd', color: '#40744d', borderRadius: 10
                            }}
                        />
                    </View>
                    : this.state.screen === 3
                    ? <View>
                        <Text style={{textAlign: 'left', color: '#40744d', marginTop: 50}}>
                            Crop
                        </Text>
                        <DropDownPicker
                            // multiple={true}
                            // min={1}
                            // max={5}
                            open={this.state.dropdown1_open}
                            value={this.state.crop}
                            items={this.state.crops}
                            setOpen={this.setOpen1}
                            setValue={this.setValue1}
                            // setItems={this.setItems1}
                            style={{
                                marginTop: 30, marginBottom: 15, backgroundColor: '#dae5dd', color: '#40744d', borderRadius: 10
                            }}
                        />
                    </View>
                    : this.state.screen === 4
                    ? <View>
                        <Text style={{textAlign: 'left', color: '#40744d', marginTop: 50}}>
                            Location
                        </Text>
                        <DropDownPicker
                            // multiple={true}
                            // min={1}
                            // max={5}
                            open={this.state.dropdown3_open}
                            value={this.state.location}
                            items={this.state.locations}
                            setOpen={this.setOpen3}
                            setValue={this.setValue3}
                            // setItems={this.setItems3}
                            style={{
                                marginTop: 30, marginBottom: 15, backgroundColor: '#dae5dd', color: '#40744d', borderRadius: 10
                            }}
                        />
                    </View>
                    : <View></View>
                }
                {
                    this.state.screen === 1
                    ? <TouchableOpacity
                        key='Next'
                        onPress={() => this.setState({screen: this.state.screen+1})}
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
                            Next
                        </Text>
                    </TouchableOpacity>
                    : this.state.screen === 4
                    ?  <View style={{marginTop: 50, flexDirection: 'row'}}>
                        <View style={{flexDirection: 'column', width: '50%'}}>
                            <TouchableOpacity
                                key='Previous'
                                onPress={() => this.setState({screen: this.state.screen-1})}
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
                                    Previous
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection: 'column', width: '50%'}}>
                            <TouchableOpacity
                                key='Submit-Farmer-Data'
                                onPress={() => this.AddFarmer()}
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
                                    Add Farmer
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    : <View style={{marginTop: 50, flexDirection: 'row'}}>
                        <View style={{flexDirection: 'column', width: '50%'}}>
                            <TouchableOpacity
                                key='Previous'
                                onPress={() => this.setState({screen: this.state.screen-1})}
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
                                    Previous
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection: 'column', width: '50%'}}>
                            <TouchableOpacity
                                key='Next'
                                onPress={() => this.setState({screen: this.state.screen+1})}
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
                                    Next
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            </View>
        </View>
    }

}

export default AddFarmer;

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