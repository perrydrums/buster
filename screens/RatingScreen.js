import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import { NavigationEvents } from "react-navigation";
import {Audio, Font, LinearGradient} from 'expo';
import SpotifyAuth from '../services/Spotify/SpotifyAuth';
import * as firebase from 'firebase';
import Swiper from 'react-native-deck-swiper';

export default class RatingScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    fontLoaded: false,
    currentAudio: null,
    currentTrack: null,
    tracks: [],
    audios: [],
    playingStatus: 'stopped',
    loading: false,
  };

  async componentDidMount() {
    await Font.loadAsync({
      'ProximaNova': require('../assets/fonts/ProximaNovaBold.otf'),
    });
    this.setState({ fontLoaded: true });
  }

  async next() {
    this.setState({ loading: true });
    this.stop();

    if (this.state.tracks.length < 2) {
      const sp = await SpotifyAuth.getValidSPObj();

      const getRandomSongsArray = ['%a%', 'a%', '%e%', 'e%', '%i%', 'i%', '%o%', 'o%'];
      const getRandomSongs = getRandomSongsArray[Math.floor(Math.random() * getRandomSongsArray.length)];
      const getRandomOffset = Math.floor(Math.random() * 1000);

      const response = await sp.search(getRandomSongs, ['track'], {
        offset: getRandomOffset,
        limit: 5,
      });

      const tracks = response.tracks.items;
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].preview_url) {
          this.state.tracks.push(tracks[i]);

          const { sound } = await Audio.Sound.createAsync(
            {uri: tracks[i].preview_url},
          );
          this.state.audios.push(sound);
        }
      }
    }

    const sound = this.state.audios.splice(0, 1);
    const track = this.state.tracks.splice(0, 1);

    this.setState({
      currentAudio: sound[0],
      currentTrack: track[0],
      playingStatus: 'playing'
    });

    this.state.currentAudio.playAsync().then(() => {
      this.setState({ loading: false });
    });
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
      rated_on: Math.floor(Date.now() / 1000),
    });

    this.next();
  }

  stop() {
    if (this.state.playingStatus === 'playing') {
      this.state.currentAudio.stopAsync();
      this.setState({
        currentAudio: null,
        currentTrack: null,
        playingStatus: 'stopped'
      });
    }
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
        <View style={styles.loading}>
          <ActivityIndicator
            animating={this.state.loading}
            size="large"
            color="#ffffff"
          />
        </View>
        <NavigationEvents
          onDidFocus={this.next.bind(this)}
          onDidBlur={this.stop.bind(this)}
        />
        <View style={styles.container}>
          {
            this.state.currentTrack &&
            <Swiper
              cards={[0]}
              renderCard={() => {
                return (
                  <View style={styles.card}>

                  </View>
                )
              }}
              onSwipedLeft={() => this.rate(false)}
              onSwipedRight={() => this.rate(true)}
              cardIndex={0}
              backgroundColor={'transparent'}
              stackSize={1}>
            </Swiper>
          }
        </View>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  card: {
    flex: 1,
    borderRadius: 50,
    borderWidth: 5,
    borderColor: 'white',
    marginBottom: 50,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
