import React from 'react';
import {ScrollView, StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import SpotifyAuth from '../services/Spotify/SpotifyAuth';
import Logo from '../assets/images/logo-white.svg';
import Colors from '../constants/Colors';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    username: 'loading...',
  };

  async componentDidMount() {
    const sp = await SpotifyAuth.getValidSPObj();
    const { id: username } = await sp.getMe();
    this.setState({ username });
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Logo
              viewBox='0 0 350 100'
            />
          </View>
          <Text> {this.state.username} </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={SpotifyAuth.logout}
          >
            <Text style={styles.buttonText}>
              LOGOUT
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.tintColor,
  },
  contentContainer: {
    paddingTop: 30,
  },
  logoContainer: {
    marginTop: 50,
    marginBottom: 50,
  },
});
