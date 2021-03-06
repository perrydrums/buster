import React from 'react';
import {Platform, StatusBar, StyleSheet, View} from 'react-native';
import { AppLoading, Asset, Font, Icon } from 'expo';
import AppNavigator from './navigation/AppNavigator';
import Login from './components/Login/Login';
import SpotifyAuth from './services/Spotify/SpotifyAuth';
import * as firebase from 'firebase';

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
    loggedIn: false,
  };

  async componentDidMount() {
    this.setState({ loggedIn: await SpotifyAuth.isLoggedIn() });

    const firebaseConfig = {
      apiKey: "AIzaSyAhOLqpx9cs21BKGjHUIeqrBfYay8FNMPI",
      authDomain: "buster-music.firebaseapp.com",
      databaseURL: "https://buster-music.firebaseio.com",
      projectId: "buster-music",
      storageBucket: "buster-music.appspot.com",
      messagingSenderId: "147749625823",
      appId: "1:147749625823:web:30011ebb726d5037"
    };
    firebase.initializeApp(firebaseConfig);
  }

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      if (!this.state.loggedIn) {
        return (
          <Login context={this}/>
        );
      } else {
        return (
          <View style={styles.container}>
            {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
            <AppNavigator />
          </View>
        );
      }
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Icon.Ionicons.font,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free
        // to remove this if you are not using it in your app
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      }),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
