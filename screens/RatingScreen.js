import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View, AsyncStorage} from 'react-native';
import {Audio, Font, LinearGradient} from 'expo';
import SpotifyAuth from '../services/Spotify/SpotifyAuth';
import * as firebase from 'firebase';

export default class RatingScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    fontLoaded: false,
    currentAudio: null,
    currentTrack: null,
    playingStatus: 'stopped',
  };

  async componentDidMount() {
    await Font.loadAsync({
      'ProximaNova': require('../assets/fonts/ProximaNovaBold.otf'),
    });
    this.setState({ fontLoaded: true });

    this.next();
  }

  componentWillUnmount() {

  }

  async next() {
    if (this.state.playingStatus === 'playing') {
      this.state.currentAudio.stopAsync();
      this.setState({
        currentAudio: null,
        currentTrack: null,
        playingStatus: 'stopped'
      });
    }

    const sp = await SpotifyAuth.getValidSPObj();

    const getRandomSongsArray = ['%a%', 'a%', '%e%', 'e%', '%i%', 'i%', '%o%', 'o%'];
    const getRandomSongs = getRandomSongsArray[Math.floor(Math.random() * getRandomSongsArray.length)];
    const getRandomOffset = Math.floor(Math.random() * 1000);

    const rec = await sp.search(getRandomSongs, ['track'], {
      offset: getRandomOffset,
      limit: 10,
    });

    let track = null;
    const tracks = rec.tracks.items;
    for (let i = 0; i < tracks.length; i++) {
      if (tracks[i].preview_url) {
        track = tracks[i];
        break;
      }
    }

    const { sound } = await Audio.Sound.createAsync(
      {uri: track.preview_url},
    );

    this.setState({
      currentAudio: sound,
      currentTrack: track,
      playingStatus: 'playing'
    });

    this.state.currentAudio.playAsync();
  }

  async rate(like) {
    // Save current track in Firebase.
    const track = this.state.currentTrack;
    const sp = await SpotifyAuth.getValidSPObj();

    const dbh = firebase.firestore();
    dbh.collection('tracks').doc(track.id).set({
      spotify_id: track.id,
      track: await JSON.stringify(track),
      audio_features: await sp.getAudioFeaturesForTrack(track.id),
    });

    // Save rating in Firebase.
    const { id } = await sp.getMe();
    dbh.collection('ratings').doc().set({
      user_id: id,
      track_id: track.id,
      like: like,
    });

    this.next();
  }

  render() {
    return (
      <LinearGradient
        colors={['#e5127d', '#e9316c', '#fff500']}
        style={styles.container}
        start={{x: 0, y: 0}}
        end={{ x: 1, y: 1 }}
        locations={[0.1, 0.4, 0.9]}
      >
        {this.state.currentTrack &&
        <View style={styles.icon}>
          <Text>
            {this.state.currentTrack.name}
          </Text>
        </View>
        }
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.rate(false)}
          >
            {
              this.state.fontLoaded ? (
                <Text style={styles.buttonText}>
                  DISLIKE
                </Text>
              ) : null
            }
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.rate(true)}
          >
            {
              this.state.fontLoaded ? (
                <Text style={styles.buttonText}>
                  LIKE
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {

  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    flexDirection: 'row',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 100,
    borderRadius: 200,
    height: 100,
    justifyContent: 'center',
    display: 'flex',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontFamily: 'ProximaNova',
    fontSize: 24,
  }
});
