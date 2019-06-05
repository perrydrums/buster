import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {Font, LinearGradient} from 'expo';
import * as firebase from 'firebase';
import SpotifyAuth from '../services/Spotify/SpotifyAuth';
import Spotify from '../services/Spotify/Spotify';

export default class BuildScreen extends React.Component {
  static navigationOptions = {
    title: 'Build',
  };

  state = {
    fontLoaded: false,
    track_ids: [],
    track_id_chunks: [],
    recommendations: [],
  };

  async componentDidMount() {
    await Font.loadAsync({
      'ProximaNova': require('../assets/fonts/ProximaNovaBold.otf'),
    });
    this.setState({ fontLoaded: true });
  }

  async generate() {
    const db = firebase.firestore();
    const user = await SpotifyAuth.getCurrentUser();

    // Clear state track_ids.
    this.setState({ track_ids: [], track_id_chunks: [] });

    // Get all ratings by the current user.
    const response = await db.collection('ratings')
      .where('user_id', '==', user.id)
      .where('like', '==', true)
      .get();

    // Save all track_ids in state.
    response.forEach(snap => {
      this.state.track_ids.push(snap.data().track_id)
    });

    // Split track_ids in groups of 5.
    while (this.state.track_ids.length) {
      this.state.track_id_chunks.push(
        this.state.track_ids.splice(0, 5)
      );
    }

    // Get song recommendations per 5 track_ids and save in state.
    for (let i = 0; i < this.state.track_id_chunks.length; i ++) {
      const ids = this.state.track_id_chunks[i];
      const limit = Math.floor(100 / this.state.track_id_chunks.length);
      const recommendations = await Spotify.getRecommendationsByTracks(ids, limit);
      recommendations.tracks.forEach(track => {
        this.state.recommendations.push(
          db.collection('tracks').doc(track.id)
        );
      });
    }

    // Save playlist.
    db.collection('playlists').doc().set({
      user_id: db.collection('users').doc(user.id),
      name: 'Test Playlist',
      tracks: this.state.recommendations,
      count: this.state.recommendations.length,
    });
  }

  render() {
    return (
      <LinearGradient
        colors={['#e5127d', '#e9316c', '#fff500']}
        style={styles.container}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        locations={[0.1, 0.4, 0.9]}
      >
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.generate()}
          >
            {
              this.state.fontLoaded ? (
                <Text style={styles.buttonText}>
                  Build Playlist
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
  buttons: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
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
