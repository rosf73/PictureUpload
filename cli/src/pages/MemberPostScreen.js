import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { createMaterialTopTabNavigator, createAppContainer } from 'react-navigation';

import MapTab from '../tabs/MapTab/MapTab'
import PostListTab from '../tabs/PostListTab/PostListTab'
import TabListTab from '../tabs/TagListTab/TagListTab'

const TabNavigator = createMaterialTopTabNavigator({
    MapTab: { screen: MapTab },
    PostListTab: { screen: PostListTab },
    TabListTab: { screen: TabListTab },
}, {
    animationEnabled: true,
    swipeEnabled: true,
    tabBarPosition: "top",
    tabBarOptions: {
        style: {
            backgroundColor: 'white',
            borderColor: 'transparent'
        },
        indicatorStyle: {
          opacity: 0,
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
    render() {
        return <TabContainer/>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 5,
        alignItems: 'center',
        justifyContent: 'center'
    }
});