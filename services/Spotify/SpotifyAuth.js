import {AuthSession} from 'expo';
import {spotifyCredentials} from '../../secret';
import {encode as btoa} from 'base-64';
import SpotifyWebAPI from 'spotify-web-api-js';
import Storage from '../Storage';
import * as firebase from 'firebase';
import '@firebase/firestore';

const scopesArr = ['user-modify-playback-state','user-read-currently-playing','user-read-playback-state','user-library-modify',
  'user-library-read','playlist-read-private','playlist-read-collaborative','playlist-modify-public',
  'playlist-modify-private','user-read-recently-played','user-top-read'];

const scopes = scopesArr.join(' ');

export default class SpotifyAuth {

  /**
   * Check if an access token is set.
   *
   * @returns {Promise<boolean>}
   */
  static async isLoggedIn() {
    return !!(await Storage.getUserData('accessToken'));
  }

  /**
   * Get an authorization code from Spotify API.
   *
   * @returns {Promise<*>}
   */
  static async getAuthorizationCode() {
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
      return null;
    }
  };

  /**
   * Get Spotify tokens by fetching Spotify API.
   *
   * @returns {Promise<null>}
   */
  static async getTokens() {
    try {
      const authorizationCode = await SpotifyAuth.getAuthorizationCode();
      if (!authorizationCode) {
        return null;
      }
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
      await Storage.setUserData('accessToken', accessToken);
      await Storage.setUserData('refreshToken', refreshToken);
      await Storage.setUserData('expirationTime', expirationTime);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Refresh tokens and save on device.
   *
   * @returns {Promise<void>}
   */
  static async refreshTokens() {
    try {
      const credsB64 = btoa(`${spotifyCredentials.clientId}:${spotifyCredentials.clientSecret}`);
      const refreshToken = await Storage.getUserData('refreshToken');
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
        await SpotifyAuth.getTokens();
      } else {
        const {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          expires_in: expiresIn,
        } = responseJson;

        const expirationTime = new Date().getTime() + expiresIn * 1000;
        await Storage.setUserData('accessToken', newAccessToken);

        if (newRefreshToken) {
          await Storage.setUserData('refreshToken', newRefreshToken);
        }
        await Storage.setUserData('expirationTime', expirationTime);
      }
    }
    catch (err) {
      console.error(err)
    }
  }

  /**
   * Get the SpotifyWebAPI object.
   *
   * @returns {Promise<SpotifyWebApi | SpotifyWebApi.SpotifyWebApiJs>}
   */
  static async getValidSPObj() {
    const tokenExpirationTime = await Storage.getUserData('expirationTime') || 0;

    if (new Date().getTime() > tokenExpirationTime) {
      await SpotifyAuth.refreshTokens();
    }
    const accessToken = await Storage.getUserData('accessToken');
    let sp = new SpotifyWebAPI();
    await sp.setAccessToken(accessToken);
    return sp;
  }

  /**
   * Trigger oAuth login flow. Set loggedIn state.
   * 
   * @param context
   *
   * @returns {Promise<void>}
   */
  static async login(context) {
    const sp = await SpotifyAuth.getValidSPObj();
    const { id } = await sp.getMe();
    if (id) {
      context.setState({loggedIn: true});
    }

    // Save user in Firebase.
    const dbh = firebase.firestore();
    dbh.collection('users').doc(id).set({
      username: id,
      lastAccess: Math.floor(Date.now() / 1000),
    })
  }

  /**
   * Unset Spotify Auth tokens.
   * 
   * TODO: Set state loggedIn to false.
   * TODO: Redirect user.
   */
  static logout() {
    Storage.unsetUserData([
      'accessToken',
      'refreshToken',
      'expirationTime',
    ]);
  }

}
