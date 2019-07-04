import { createDrawerNavigator } from 'react-navigation'
import LogoutScreen from './LogoutScreen'
import LibraryScreen from '../../pages/LibraryScreen'
import DrawerScreen from './DrawerScreen';

// drawer stack
const MyDrawer = createDrawerNavigator({
  screen1: { screen: LibraryScreen },
  screen2: { screen: LogoutScreen },
},{
  initialRouteName: 'screen1',
  contentComponent: DrawerScreen,
  drawerWidth: 200,
  drawerPosition:'right',
})

export default MyDrawer