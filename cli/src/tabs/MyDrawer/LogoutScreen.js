import React from 'react'
import { StyleSheet, View } from 'react-native'

import { connect } from 'react-redux';

import { setToken } from '../../actions/auth';

import {AsyncStorage} from 'react-native';

import { Actions } from 'react-native-router-flux'; // New code

class LogoutScreen extends React.Component {
  componentDidMount() {
    this.props.setToken('');
    this.removeTokenData();
    Actions.reset('main');
  }

  removeTokenData = async () => {
    try {
      //alert(token);
      await AsyncStorage.setItem('Token', '');
    } catch (error) {
      // Error saving data
    }
  };

  render() {
    return (
      <View style={styles.container}>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})

const mapStateToProps = state => {
  return {
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setToken: (token) => dispatch(setToken(token)),
  }
}

//export default HomeScreen;
export default connect(mapStateToProps, mapDispatchToProps)(LogoutScreen);