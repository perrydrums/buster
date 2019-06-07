import React from 'react';
import {ScrollView, Text, StyleSheet, View, Image, Button, AlertIOS} from 'react-native';
import {Font} from 'expo';
import * as firebase from 'firebase';
import SpotifyAuth from '../../services/Spotify/SpotifyAuth';
import Track from './Track';
import PropTypes from 'prop-types';
import Colors from '../../constants/Colors';

class Preview extends React.Component {
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
        <Track track={track} key={i} />
      );
    });
  }

  render() {
    return (
      <View style={styles.container}>
          {
            this.state.fontLoaded ? (
              <Text style={styles.title}>
                New Playlist
              </Text>
            ) : null
          }
          <ScrollView style={styles.tracks}>
            {this.tracks()}
          </ScrollView>
        <View style={styles.buttons}>
          <Button
            style={styles.button}
            title="Save Playlist"
            color='#ffffff'
            onPress={this.chooseName.bind(this)}
          />
          <Button
            style={styles.button}
            title="Cancel"
            color='#ffffff'
            onPress={this.props.close}
          />
        </View>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: Colors.tintColor,
  },
  title: {
    fontFamily: 'ProximaNova',
    fontSize: 28,
    color: 'white',
    marginBottom: 50,
    marginTop: 50,
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 70,
  },
  button: {
    width: '50%',
    height: 70,
    color: 'white',
    backgroundColor: 'white',
    textAlign: 'center',
  },
});

Preview.propTypes = {
  tracks: PropTypes.array.isRequired,
  track_ids: PropTypes.array.isRequired,
  close: PropTypes.func.isRequired,
};

export default Preview;
