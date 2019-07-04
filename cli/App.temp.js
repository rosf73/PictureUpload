// app/index.js

import React, { Component } from 'react';
import { Router, Scene } from 'react-native-router-flux';

//import ScarletScreen from './components/ScarletScreen';
//import GrayScreen from './components/GrayScreen';
import LoginScreen from './src/pages/LoginScreen';
import HomeScreen from './src/pages/HomeScreen';
import RegisterScreen from './src/pages/RegisterScreen';
import EmailLoginScreen from './src/pages/EmailLoginScreen';
import FacebookLoginScreen from './src/pages/FacebookLoginScreen';
import DetailPostScreen from './src/pages/DetailPostScreen';
import LibraryScreen from './src/pages/LibraryScreen';

import { createBottomTabNavigator, createAppContainer } from 'react-navigation';

import {
  StyleSheet,
} from 'react-native';


const TabNavigator = createBottomTabNavigator({
  Home: HomeScreen,
  Login: LoginScreen,
  Register: RegisterScreen,
  EmailLogin: EmailLoginScreen,
  DetailPost: DetailPostScreen,
  Library: LibraryScreen
});

const App = () => {
  return (
    <Router>
      <Scene key="root">
        <Scene key="login"
          component={LoginScreen}
          title="Vlap"
          hideNavBar={HIDE_NAVBAR}
        />
        <Scene
          key="home"
          navigationBarTitleImage={require('./resources/imgs/Vlap.png')}
          navigationBarTitleImageStyle={styles.backimage}
          component={HomeScreen}
          hideNavBar={HIDE_NAVBAR}
          title="Vlap"
          initial
        />
        <Scene
          key="register"
          component={RegisterScreen}
          hideNavBar={HIDE_NAVBAR}
          title="Vlap"
        />
        <Scene
          key="emaillogin"
          component={EmailLoginScreen}
          hideNavBar={HIDE_NAVBAR}
          title="Vlap"
        />
        <Scene
          key="detailpost"
          component={DetailPostScreen}
          hideNavBar={true}
          title="Vlap"
        />
        <Scene
          key="library"
          component={LibraryScreen}
          hideNavBar={true}
          title="Vlap"
        />
      </Scene>
    </Router>
  );
  /*
  return (
    <Router>
      <Scene key="root">
        <Scene key="scarlet"
          component={ScarletScreen}
          title="Scarlet"
          initial
        />
        <Scene
          key="gray"
          component={GrayScreen}
          title="Gray"
        />
      </Scene>
    </Router>
  );
  */
}

const styles = StyleSheet.create({
  backimage: {
    resizeMode: 'cover',
    width: 45,
    height: 45,
    margin: 10
  },
});

export default App;