import { StatusBar } from 'expo-status-bar';
import React, { Component }  from 'react';
import { Linking, StyleSheet, Text, View, ImageBackground, Button, Picker, TextInput, TouchableOpacity, Pressable, FlatList, ScrollView, Alert} from 'react-native';
import { Image } from 'expo-image';
import { Octicons, FontAwesome, AntDesign, Ionicons, Feather, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import {Backend_Url} from './backend_url'
// secure store import
import * as SecureStore from 'expo-secure-store';
// SQLite
import * as SQLite from 'expo-sqlite';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            user_access_token: '',
            user_name: '',
            user_role: '',
            offline: false,
            user_details: {role: ''},
            data_syncing_in_progress: false
        }

        this.db = null; // Initialize db variable

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

            // get user role
            let user_role = await SecureStore.getItemAsync('user_role');
            if (user_role){
              this.setState({user_role: user_role})
            }else{ should_reload = true }

            if (should_reload == true){  const timeoutId = setTimeout(() => {this.GetUserData()}, 1000) }
            else{ this.GetAccountDetails() }
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
            axios.post(Backend_Url + 'getAccountDetails', null, { 
                headers: { 'Access-Token': this.state.user_access_token }, 
                timeout: 3000
            })
            .then((res) => {
                let result = res.data
                this.setState({user_details: result, loading: false})
            }).catch((error) => {
                console.log(error)
                if (error.response){ // server responded with a non-2xx status code
                    let status_code = error.response.status
                    let result = error.response.data
                    this.setState({offline: true, loading: false})
                    if(result === 'invalid token' || result === 'access token disabled via signout' || result === 'access token expired' || result === 'not authorized to access this'){ 
                        this.Signout()
                    }
                    else{
                        // automatically retry
                        // this.GetAccountDetails()
                        this.setState({offline: true, loading: false})
                    }
                }else if (error.request){ // request was made but no response was received ... network error
                    // automatically retry
                    // this.GetAccountDetails()
                        this.setState({offline: true, loading: false})
                }else{ // error occured during request setup ... no network access
                    // automatically retry
                    // this.GetAccountDetails()
                        this.setState({offline: true, loading: false})
                }
            })
        }
        
        this.OpenLocalDatabase = async () => {
            this.db = SQLite.openDatabaseAsync("farmers.db");
        
            this.db.transaction(tx => {
                tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS farmers (
                        id INTEGER PRIMARY KEY AUTOINCREMENT, 
                        name TEXT, 
                        national_id TEXT, 
                        farm_id TEXT, 
                        farm_type TEXT, 
                        crop TEXT, 
                        location TEXT
                    );`,
                    [],
                    () => {
                        console.log("Farmers table created successfully.");
                        
                        // Initiate data syncing function after ensuring the table exists
                        this.SyncLocalDBFarmersToOnlineDB();
                    },
                    (_, error) => console.error("Error creating table: ", error)
                );
            });
        };

        this.SyncLocalDBFarmersToOnlineDB = () => {
            if (!this.db) {
                alert("Database not initialized");
                return;
            }
            
            this.setState({ data_syncing_in_progress: true });

            this.db.transaction(tx => {
                tx.executeSql(
                    "SELECT * FROM farmers;",
                    [],
                    (_, { rows }) => {
                        let farmers = rows._array;
        
                        if (farmers.length === 0) {
                            alert("No farmers to sync.");
                            return;
                        }
        
                        alert(`Syncing ${farmers.length} farmers to the online database...`);
        
                        farmers.forEach((farmer) => {
                            let data = new FormData();
                            data.append("name", farmer.name);
                            data.append("national_id", farmer.national_id);
                            data.append("farm_id", farmer.farm_id);
                            data.append("farm_type", farmer.farm_type);
                            data.append("crop", farmer.crop);
                            data.append("location", farmer.location);
        
                            axios.post(Backend_Url + "addFarmer", data, {
                                headers: { "Access-Token": this.state.user_access_token }
                            })
                            .then(() => {
                                alert(`Farmer ${farmer.name} synced successfully.`);
        
                                // Delete farmer from local DB after successful sync
                                this.db.transaction(tx => {
                                    tx.executeSql(
                                        "DELETE FROM farmers WHERE id = ?;",
                                        [farmer.id],
                                        () => alert(`Farmer ${farmer.name} removed from local DB.`),
                                        (error) => alert("Error deleting farmer: " + error)
                                    );
                                });
                            })
                            .catch(() => {
                                alert(`Sync error for farmer: ${farmer.name}`);
                            });
                        });
                    },
                    (_, error) => alert("Error retrieving farmers: " + error)
                );
            });

            this.setState({ data_syncing_in_progress: false });

            // run syncing function after every 60 seconds
            const timeoutId = setTimeout(() => {this.SyncLocalDBFarmersToOnlineDB()}, 60000);
        };
    };

    async componentDidMount() {
        this.setState({offline: false})
        this.focusListener = this.props.navigation.addListener('focus', () => {
            // offline db
            this.OpenLocalDatabase()
            // get user data
            this.GetAccountDetails()
        });

        // offline db
        this.OpenLocalDatabase()
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
        
        return <ImageBackground
            source={require('../assets/dashboard-background.png')} 
            style={{flex: 1, width: null, height: null, resizeMode: 'cover'}}
        >
            <View style={styles.container}>
                <View style={{margin: 20}}>
                    <Text
                        style={{
                            textAlign: 'left', color: '#ffffff', marginTop: 20
                        }}
                    >
                        Dashboard
                    </Text>
                </View>
                <ScrollView style={styles.scroll_view}>
                    <View
                        style={{marginLeft: 20, marginRight: 20}}
                    >
                        <View style={{
                                backgroundColor: '#ffffff', width: '100%', height: 100, borderRadius: 10, marginTop: 40
                            }}
                        >
                            <TouchableOpacity
                                key='Signout'
                                onPress={() => this.props.navigation.navigate('Signout')}
                                style={{
                                    backgroundColor: 'inherit'
                                }}
                            >
                                <View style={{margin: 20}}>
                                    <Text
                                        style={{
                                            textAlign: 'left'
                                        }}
                                    >
                                        {this.state.user_name}
                                    </Text>
                                    <Text
                                        style={{
                                            textAlign: 'left', marginTop: 10, color: 'grey'
                                        }}
                                    >
                                        {this.state.user_role}
                                    </Text>
                            </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection: 'row', marginTop: 50}}>
                            <View style={{flexDirection: 'column', backgroundColor: '#ffffff', width: '30%', height: 80}}>
                                <TouchableOpacity
                                    key='Dashboard-Add-Farmer'
                                    onPress={() => this.props.navigation.navigate('Add Farmer')}
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
                                        Add Farmer
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{flexDirection: 'column', backgroundColor: '#ffffff', width: '30%', height: 80, marginLeft: '4%'}}>
                                <TouchableOpacity
                                    key='Dashboard-Farmers'
                                    onPress={() => this.props.navigation.navigate('Farmers')}
                                    style={{
                                        backgroundColor: 'inherit', marginLeft: 'auto', marginRight: 'auto'
                                    }}
                                >
                                    <Feather name='eye' color={'#40744d'} size={25}
                                        style={{marginLeft: 'auto', marginRight: 'auto', marginTop: 10}}
                                    />
                                    <Text 
                                        style={{
                                            textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', color: '#40744d', fontSize: 13,
                                            marginTop: 5
                                        }}
                                    >
                                        Farmers
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {
                                this.state.user_role === 'admin'
                                ? <View style={{flexDirection: 'column', backgroundColor: '#ffffff', width: '30%', height: 80, marginLeft: '4%'}}>
                                    <TouchableOpacity
                                        key='Dashboard-Add-User'
                                        onPress={() => this.props.navigation.navigate('Add User')}
                                        style={{
                                            backgroundColor: 'inherit', marginLeft: 'auto', marginRight: 'auto'
                                        }}
                                    >
                                        <Feather name='user' color={'#40744d'} size={25}
                                            style={{marginLeft: 'auto', marginRight: 'auto', marginTop: 10}}
                                        />
                                        <Text 
                                            style={{
                                                textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', color: '#40744d', fontSize: 13,
                                                marginTop: 5
                                            }}
                                        >
                                            Add User
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                : <View></View>
                            }
                        </View>
                        <View style={{flexDirection: 'row', marginTop: 50}}>
                            {
                                this.state.user_role === 'admin'
                                ? <View style={{flexDirection: 'column', backgroundColor: '#ffffff', width: '30%', height: 80}}>
                                    <TouchableOpacity
                                        key='Dashboard-Users'
                                        onPress={() => this.props.navigation.navigate('Users')}
                                        style={{
                                            backgroundColor: 'inherit', marginLeft: 'auto', marginRight: 'auto'
                                        }}
                                    >
                                        <Feather name='users' color={'#40744d'} size={25}
                                            style={{marginLeft: 'auto', marginRight: 'auto', marginTop: 10}}
                                        />
                                        <Text 
                                            style={{
                                                textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', color: '#40744d', fontSize: 13,
                                                marginTop: 5
                                            }}
                                        >
                                            Users
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                : <View></View>
                            }
                        </View>
                        {
                            this.state.offline === true
                            ? <Text style={{color: '#40744d', fontWeight: 'bold', textAlign: 'center', marginTop: 80}}>
                                You're currently offline. Data will be synced once you're back online.
                            </Text>
                            : <View></View>
                        }
                        {
                            this.state.data_syncing_in_progress === true
                            ? <Text style={{color: '#40744d', fontWeight: 'bold', textAlign: 'center', marginTop: 80}}>
                                Data sync in progress ...
                            </Text>
                            : <View></View>
                        }
                    </View>
                </ScrollView>
            </View>
            {
                this.state.user_role === 'admin'
                ? <View style={styles.bottom_bar}>
                    <View
                        style={{
                            marginLeft: 'auto', marginRight: 'auto', height: 75, width: '90%', backgroundColor: '#ffffff', borderRadius: 20,
                            flexDirection: 'row'
                        }}
                    >
                        <View 
                            style={{
                                flexDirection: 'column', backgroundColor: '#f0f0f0', width: 70, height: 70, borderRadius: 50,
                                margin: 5, marginLeft: 'auto', marginRight: 'auto'
                            }}
                        >
                            <TouchableOpacity
                                key='Dashboard-Crops'
                                onPress={() => this.props.navigation.navigate('Crops')}
                                style={{
                                    backgroundColor: 'inherit', marginLeft: 'auto', marginRight: 'auto'
                                }}
                            >
                                <Feather name='wind' color={'#40744d'} size={20}
                                    style={{marginLeft: 'auto', marginRight: 'auto', marginTop: 10}}
                                />
                                <Text 
                                    style={{
                                        textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', color: '#40744d', fontSize: 12,
                                        marginTop: 2
                                    }}
                                >
                                    Crops
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View 
                            style={{
                                flexDirection: 'column', backgroundColor: '#f0f0f0', width: 70, height: 70, borderRadius: 50,
                                margin: 5, marginLeft: 'auto', marginRight: 'auto'
                            }}
                        >
                            <TouchableOpacity
                                key='Dashboard-Farm-Types'
                                onPress={() => this.props.navigation.navigate('Farm Types')}
                                style={{
                                    backgroundColor: 'inherit', marginLeft: 'auto', marginRight: 'auto'
                                }}
                            >
                                <Feather name='list' color={'#40744d'} size={20}
                                    style={{marginLeft: 'auto', marginRight: 'auto', marginTop: 10}}
                                />
                                <Text 
                                    style={{
                                        textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', color: '#40744d', fontSize: 12,
                                        marginTop: 2
                                    }}
                                >
                                    Farm Types
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View 
                            style={{
                                flexDirection: 'column', backgroundColor: '#f0f0f0', width: 70, height: 70, borderRadius: 50,
                                margin: 5, marginLeft: 'auto', marginRight: 'auto'
                            }}
                        >
                            <TouchableOpacity
                                key='Dashboard-Locations'
                                onPress={() => this.props.navigation.navigate('Locations')}
                                style={{
                                    backgroundColor: 'inherit', marginLeft: 'auto', marginRight: 'auto'
                                }}
                            >
                                <Feather name='map-pin' color={'#40744d'} size={20}
                                    style={{marginLeft: 'auto', marginRight: 'auto', marginTop: 10}}
                                />
                                <Text 
                                    style={{
                                        textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', color: '#40744d', fontSize: 12,
                                        marginTop: 2
                                    }}
                                >
                                    Locations
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                : <View></View>
            }
        </ImageBackground>
    }

}

export default Dashboard;

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
        // backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        height: 80,
        position: 'absolute', 
        left: 0, 
        right: 0, 
        bottom: 0
    }
});