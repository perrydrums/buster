import React from 'react';
import {Image, ScrollView, StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import SpotifyAuth from '../services/Spotify/SpotifyAuth';

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
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/splash.png')}
              style={styles.logo}
            />
            <Text> {this.state.username} </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={SpotifyAuth.logout}
            >
              <Text style={styles.buttonText}>
                LOGOUT
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
  },
});
