// app/index.js

import React from 'react';
import { Router, Scene } from 'react-native-router-flux';

import LoginScreen from './src/pages/LoginScreen';
import RegisterScreen from './src/pages/RegisterScreen';
import EmailLoginScreen from './src/pages/EmailLoginScreen';
import DetailPostScreen from './src/pages/DetailPostScreen';
import LibraryScreen from './src/pages/LibraryScreen';
import MainScreen from './src/pages/MainScreen';
import ProfileScreen from './src/pages/ProfileScreen';
import SearchScreen from './src/pages/SearchScreen';
import ProfileModificationScreen from './src/pages/ProfileModificationScreen';
import CommentScreen from './src/pages/CommentScreen';
import UploadScreen from './src/pages/UploadScreen';
import LocationSettingScreen from './src/pages/LocationSettingScreen';
import FullScreen from './src/pages/FullScreen';

const HIDE_NAVBAR = false;

const App = () => {
  return (
    <Router>
      <Scene key="root">
        <Scene key="login"
          component={LoginScreen}
          title="Vlap"
          hideNavBar={HIDE_NAVBAR}
        />
        <Scene key="main"
          component={MainScreen}
          title="Vlap"
          hideNavBar={HIDE_NAVBAR}
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
        <Scene
          key="profile"
          component={ProfileScreen}
          hideNavBar={false}
          title="Vlap"
        />
        <Scene
          key="search"
          component={SearchScreen}
          hideNavBar={true}
          title="Vlap"
        />
        <Scene
          key="profilemodification"
          component={ProfileModificationScreen}
          hideNavBar={true}
          title="Vlap"
        />
        <Scene
          key="comments"
          component={CommentScreen}
          hideNavBar={true}
          title="Vlap"
        />
        <Scene
          key="upload"
          component={UploadScreen}
          hideNavBar={true}
        />
        <Scene
          key="locset"
          component={LocationSettingScreen}
          hideNavBar={true}
        />
        <Scene
          key="fullscreen"
          component={FullScreen}
          hideNavBar={true}
        />
      </Scene>
    </Router>
  );
}

export default App;