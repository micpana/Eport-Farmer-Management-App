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
            loading: false,
        }

        this.HandleChange = (value, state) => {
            this.setState({ [state]: value })
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
            <ScrollView style={styles.scroll_view}>

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