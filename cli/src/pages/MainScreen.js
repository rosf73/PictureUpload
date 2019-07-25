import React, { Component } from 'react';
import { StyleSheet, Image, View, TouchableNativeFeedback } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { createMaterialTopTabNavigator, createAppContainer } from 'react-navigation';

import RecommendScreen from './RecommendScreen'
import HotScreen from './HotScreen'
import FollowingsScreen from './FollowingsScreen'
import MyDrawer from '../tabs/MyDrawer/MyDrawer'
import NewsFeedTab from '../tabs/NewsFeedTab/NewsFeedTab'

import { Actions } from 'react-native-router-flux'; 

const TabNavigator = createMaterialTopTabNavigator({
    HomeTab: { screen: HotScreen },
    HotTab: { screen: RecommendScreen },
    SubscribeTab: { screen: FollowingsScreen },
    NewsFeedTab: { screen: NewsFeedTab },
    MyTab: { screen: MyDrawer, navigationOptions : {
        tabBarIcon: ({ tintColor }) => (
            <FontAwesome name="inbox" size={27} color={tintColor}/>
        )
      } }
}, {
    animationEnabled: true,
    swipeEnabled: true,
    tabBarPosition: "bottom",
    tabBarOptions: {
        style: {
            backgroundColor: 'white'
        },
        iconStyle: { height: 35 },
        activeTintColor: '#000',
        inactiveTintColor: '#d1cece',
        upperCaseLabel: false,
        showLabel: false,
        showIcon: true
    }
});

const TabContainer = createAppContainer(TabNavigator);

export default class MainScreen extends Component {
    static navigationOptions = {
        headerTitle:
            <TouchableNativeFeedback 
                onPress={()=>{Actions.reset('main');}}
                background={TouchableNativeFeedback.Ripple("", true)}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Image style={{ width: 45, height: 45, resizeMode: 'stretch' }} source={require('../../resources/imgs/Picup.png')}/>
                </View>
            </TouchableNativeFeedback>,
        headerLeft: 
            <TouchableNativeFeedback 
                onPress={()=>{Actions.upload();}}
                background={TouchableNativeFeedback.Ripple("", true)}>
                <View style={{ marginLeft: 15, padding: 5 }}>
                    <Ionicons color="#888" name="md-camera" size={25}/>
            </View></TouchableNativeFeedback>,
        headerRight:
            <TouchableNativeFeedback 
                onPress={()=>{Actions.search();}}
                background={TouchableNativeFeedback.Ripple("", true)}>
                <View style={{ marginRight: 15, padding: 5 }}>
                    <Ionicons color="#888" name="md-search" size={25}/>
            </View></TouchableNativeFeedback>
    }

    render() {
        return <TabContainer/>;
    }
}