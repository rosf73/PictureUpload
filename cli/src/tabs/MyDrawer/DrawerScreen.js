import React, {Component} from 'react';
import {NavigationActions} from 'react-navigation';
import PropTypes from 'prop-types';
import {ScrollView, Text, View, StyleSheet} from 'react-native';
import { DrawerActions } from 'react-navigation';

import Icon from 'react-native-vector-icons/Ionicons';

class DrawerScreen extends Component {
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => (
        <Icon name="ios-person" size={30} color={tintColor}/>
    )
  }

  navigateToScreen = (route) => () => {
    const navigateAction = NavigationActions.navigate({
      routeName: route
    });
    this.props.navigation.dispatch(navigateAction);
    this.props.navigation.dispatch(DrawerActions.closeDrawer())
  }

  render () {
    return (
      <View>
        <ScrollView>
          <View>
            <View style={styles.menuItem}>
              <Text style={styles.logoutText} onPress={this.navigateToScreen('screen2')}>
               로그아웃
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  menuItem:{
      padding: 10,
      borderWidth: 0.5,
      borderColor: '#d6d7da'
  },
  logoutText:{
    fontSize:15,
}
});

DrawerScreen.propTypes = {
  navigation: PropTypes.object
};

export default DrawerScreen;
