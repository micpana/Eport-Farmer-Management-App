import { registerRootComponent } from 'expo';
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Picker, Image, TextInput, TouchableOpacity} from 'react-native';
import { Octicons, FontAwesome, FontAwesome5, AntDesign, Ionicons, Feather, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import {Backend_Url} from './components/backend_url'
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigationState, useRoute } from '@react-navigation/native';
// secure store import
import * as SecureStore from 'expo-secure-store';
// screens
import Splash from './components/splash';
import Landing from './components/landing';
import Login from './components/login';
import Dashboard from './components/dashboard';
import AddFarmer from './components/add_farmer';
import Farmers from './components/farmers';
import EditFarmer from './components/edit_farmer';
import Crops from './components/crops';
import AddCrops from './components/add_crops';
import FarmTypes from './components/farm_types';
import AddFarmTypes from './components/add_farm_types';
import Locations from './components/locations';
import AddLocations from './components/add_locations';
import AddUser from './components/add_user';
import Users from './components/users';
import Signout from './components/signout';

const Stack = createStackNavigator();

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            user_name: '',
            user_access_token: '',
            splash_screen: true
        }

        this.CheckLogin = async () => {
            // get access token
            let token = await SecureStore.getItemAsync('token');
            if (token){
              this.setState({user_access_token: token})
            }else{ this.setState({user_access_token: ''}) }

            // get username
            let user_name = await SecureStore.getItemAsync('user_name');
            if (user_name){
              this.setState({user_name: user_name})
            }else{ this.setState({user_name: ''}) }

            const timeoutId = setTimeout(() => {this.CheckLogin()}, 1000);
        }
    };

    async componentDidMount() {
        this.CheckLogin()
        setTimeout (() => {this.setState({splash_screen: false})}, 5000);
    }


    render() {
        if (this.state.splash_screen === true){
            return <Splash />
        }

        if (this.state.loading === true){
            return<View style={styles.container}>
                <StatusBar style="auto" hidden={false} />
                <View style={{marginTop: 'auto', marginBottom: 'auto', marginLeft: 20, marginRight: 20}}>
                    <Text style={{color: '#40744d', fontWeight: 'bold', textAlign: 'center'}}>
                        Loading ...
                    </Text>
                </View>
            </View>
        }

        return(
            <NavigationContainer>
                <StatusBar style="auto" hidden={true} />
                <Stack.Navigator initialRouteName="Dashboard">
                    <Stack.Screen name="Landing" component={Landing} options={{ headerShown: false }} />
                    <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                    <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
                    <Stack.Screen name="Add Farmer" component={AddFarmer} options={{ headerShown: true }} />
                    <Stack.Screen name="Farmers" component={Farmers} options={{ headerShown: true }} />
                    <Stack.Screen name="Edit Farmer" component={EditFarmer} options={{ headerShown: true }} />
                    <Stack.Screen name="Crops" component={Crops} options={{ headerShown: true }} />
                    <Stack.Screen name="Add Crops" component={AddCrops} options={{ headerShown: true }} />
                    <Stack.Screen name="Farm Types" component={FarmTypes} options={{ headerShown: true }} />
                    <Stack.Screen name="Add Farm Types" component={AddFarmTypes} options={{ headerShown: true }} />
                    <Stack.Screen name="Locations" component={Locations} options={{ headerShown: true }} />
                    <Stack.Screen name="Add Locations" component={AddLocations} options={{ headerShown: true }} />
                    <Stack.Screen name="Add User" component={AddUser} options={{ headerShown: true }} />
                    <Stack.Screen name="Users" component={Users} options={{ headerShown: true }} />
                    <Stack.Screen name="Signout" component={Signout} options={{ headerShown: true }} />
                </Stack.Navigator>
            </NavigationContainer>
        );
    }

}

export default App;

registerRootComponent(App);

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