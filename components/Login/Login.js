import React from 'react';
import {Image, StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import SpotifyAuth from '../../services/Spotify/SpotifyAuth';
import {LinearGradient, Font} from 'expo';

export default class Login extends React.Component {

  state = {
    fontLoaded: false,
  };

  async componentDidMount() {
    await Font.loadAsync({
      'ProximaNova': require('../../assets/fonts/ProximaNovaBold.otf'),
    });

    this.setState({ fontLoaded: true });
  }

  render() {
    // AsyncStorage.clear();
    return (
      <LinearGradient
        colors={['#e5127d', '#e9316c', '#fff500']}
        style={styles.gradient}
        start={{x: 0, y: 0}}
        end={{ x: 1, y: 1 }}
        locations={[0.1, 0.4, 0.9]}
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo-white.png')}
              style={styles.logo}
            />
            {
              this.state.fontLoaded ? (
                <Text style={styles.subTitle}>
                  BUST YOUR BUBBLE
                </Text>
              ) : null
            }
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => SpotifyAuth.login(this.props.context)}
          >
          {
            this.state.fontLoaded ? (
              <Text style={styles.buttonText}>
                log in with Spotify
              </Text>
            ) : null
          }
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: '70%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 100,
  },
  logo: {
    width: '100%',
    height: 50,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  subTitle: {
    fontFamily: 'ProximaNova',
    fontSize: 27,
    color: '#fff',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
    borderRadius: 50,
    height: 70,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontFamily: 'ProximaNova',
    fontSize: 24,
  }
});
