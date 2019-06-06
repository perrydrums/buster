import React from 'react';
import {ScrollView, Text, StyleSheet, View, Image, Button, AlertIOS} from 'react-native';
import {Font} from 'expo';
import * as firebase from 'firebase';
import SpotifyAuth from '../../services/Spotify/SpotifyAuth';

export default class Preview extends React.Component {

  state = {
    fontLoaded: false,
  };

  async componentDidMount() {
    await Font.loadAsync({
      'ProximaNova': require('../../assets/fonts/ProximaNovaBold.otf'),
    });
    this.setState({ fontLoaded: true });

    this.savePlaylist = this.savePlaylist.bind(this)
  }

  chooseName() {
    AlertIOS.prompt(
      'Choose a name for your playlist',
      null,
      this.savePlaylist
    );
  }

  async savePlaylist(name) {
    // Save playlist.
    const db = firebase.firestore();
    const user = await SpotifyAuth.getCurrentUser();
    const sp = await SpotifyAuth.getValidSPObj();

    db.collection('playlists').doc().set({
      user_id: db.collection('users').doc(user.id),
      name,
      tracks: this.props.track_ids,
      count: this.props.track_ids.length,
    });

    sp.createPlaylist(user.id, {
      name,
      description: 'Created by Buster.',
    }).then(res => {
      let uris = [];
      this.props.tracks.forEach(track => {
        uris.push(track.uri);
      });
      sp.addTracksToPlaylist(res.id, uris);
    });

    this.props.close();
  }

  tracks() {
    return this.props.tracks.map((track, i) => {
      return (
        <View key={i} style={styles.track}>
          <Image source={{uri: track.album.images[0].url}}
                 style={styles.trackImage} />
          <Text style={styles.trackTitle}>{track.name}</Text>
        </View>
      );
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.playlist}>
          {
            this.state.fontLoaded ? (
              <Text style={styles.title}>
                New Playlist
              </Text>
            ) : null
          }
          {this.tracks()}
        </ScrollView>
        <Button
          style={styles.saveButton}
          title="Save Playlist"
          onPress={this.chooseName.bind(this)}
        />
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
  },
  playlist: {
    flex: 1,
    height: 500,
    paddingTop: 100,
    paddingLeft: 40,
    paddingRight: 40,
  },
  title: {
    fontFamily: 'ProximaNova',
    fontSize: 28,
    color: 'white',
    marginBottom: 100,
  },
  track: {
    width: '100%',
    height: 100,
    display: 'flex',
    flexDirection: 'row',
  },
  trackTitle: {
    width: '60%',
    fontFamily: 'ProximaNova',
    color: 'white',
    display: 'flex',
    height: 50,
    marginLeft: 20,
  },
  trackImage: {
    width: 50,
    height: 50,
    display: 'flex',
  },
  saveButton: {
    height: 50,
  },
});
