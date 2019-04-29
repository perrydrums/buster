import React from 'react';
import {Image, ScrollView, StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import Spotify from '../../services/Spotify';

export default class Login extends React.Component {

  render() {
    // AsyncStorage.clear();
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/splash.png')}
              style={styles.logo}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => Spotify.login(this.props.context)}
            >
              <Text style={styles.buttonText}>
                LOGIN WITH SPOTIFY
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
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 15,
    width: '100%',
  },
  buttonText: {
    color: '#000',
    textAlign: 'center',
    fontWeight: '700',
  }
});
