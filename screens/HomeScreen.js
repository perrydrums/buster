import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  AsyncStorage,
} from 'react-native';
import {AuthSession} from 'expo';
import {spotifyCredentials} from '../secret';
import { encode as btoa } from 'base-64';
import SpotifyWebAPI from 'spotify-web-api-js';

const scopesArr = ['user-modify-playback-state','user-read-currently-playing','user-read-playback-state','user-library-modify',
  'user-library-read','playlist-read-private','playlist-read-collaborative','playlist-modify-public',
  'playlist-modify-private','user-read-recently-played','user-top-read'];
const scopes = scopesArr.join(' ');

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  async getAuthorizationCode() {
    try {
      const redirectUrl = AuthSession.getRedirectUrl(); //this will be something like https://auth.expo.io/@your-username/your-app-slug
      const result = await AuthSession.startAsync({
        authUrl:
          'https://accounts.spotify.com/authorize' +
          '?response_type=code' +
          '&client_id=' +
          spotifyCredentials.clientId +
          (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
          '&redirect_uri=' +
          encodeURIComponent(redirectUrl),
      });
      return result.params.code;
    } catch (err) {
      console.error(err);
    }
  };

  async getTokens() {
    try {
      const authorizationCode = await this.getAuthorizationCode();
      const credsB64 = btoa(`${spotifyCredentials.clientId}:${spotifyCredentials.clientSecret}`);
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credsB64}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=authorization_code&code=${authorizationCode}&redirect_uri=${
          spotifyCredentials.redirectUri
        }`,
      });
      const responseJson = await response.json();

      const {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expiresIn,
      } = responseJson;

      const expirationTime = new Date().getTime() + expiresIn * 1000;
      await this.setUserData('accessToken', accessToken);
      await this.setUserData('refreshToken', refreshToken);
      await this.setUserData('expirationTime', expirationTime);
    } catch (err) {
      console.error(err);
    }
  }

  async refreshTokens() {
    try {
      const credsB64 = btoa(`${spotifyCredentials.clientId}:${spotifyCredentials.clientSecret}`);
      const refreshToken = await this.getUserData('refreshToken');
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credsB64}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
      });
      const responseJson = await response.json();

      if (responseJson.error) {
        await this.getTokens();
      } else {
        const {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          expires_in: expiresIn,
        } = responseJson;

        const expirationTime = new Date().getTime() + expiresIn * 1000;
        await this.setUserData('accessToken', newAccessToken);

        if (newRefreshToken) {
          await this.setUserData('refreshToken', newRefreshToken);
        }
        await this.setUserData('expirationTime', expirationTime);

        console.log('responseJson REFRESH', responseJson);
      }
    }
    catch (err) {
      console.error(err)
    }
  }

  async getValidSPObj() {
    const tokenExpirationTime = await this.getUserData('expirationTime') || 0;

    if (new Date().getTime() > tokenExpirationTime) {
      await this.refreshTokens();
    }
    const accessToken = await this.getUserData('accessToken');
    let sp = new SpotifyWebAPI();
    await sp.setAccessToken(accessToken);
    return sp;
  }

  async getUserPlaylists() {
    const sp = await this.getValidSPObj();
    const { id: userId } = await sp.getMe();
    const { items: playlists } = await sp.getUserPlaylists(userId, { limit: 50 });
    console.log('playlists', playlists);
    return playlists;
  };

  async setUserData(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
    catch (e) {
      // Error.
    }
  }

  async getUserData(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value);
      }
    } catch (error) {
      return null;
    }
  }

  render() {
    // this.refreshTokens();
    AsyncStorage.clear();
    this.getUserPlaylists();
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/splash.png')}
              style={styles.logo}
            />
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
