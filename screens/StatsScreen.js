import React from 'react';
import { View, Text } from 'react-native';
import * as firebase from 'firebase';
import SpotifyAuth from '../services/Spotify/SpotifyAuth';

export default class StatsScreen extends React.Component {
  static navigationOptions = {
    title: 'Statistics',
  };

  state = {
    tracks: [],
  };

  async componentDidMount() {
    const db = firebase.firestore();
    const sp = await SpotifyAuth.getValidSPObj();
    const user = await SpotifyAuth.getCurrentUser();

    db.collection('ratings')
      .where('user_id', '==', user.id)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(async doc => {
          const data = doc.data();
          if (data.like) {
            const track = await sp.getTrack(data.track_id);
            let tracks = this.state.tracks;
            tracks.push(track);
            this.setState({tracks});
          }
      });
    });

  }

  tracks() {
    return this.state.tracks.map(function(track, i){
      return(
        <View key={i}>
          <Text>{track.name}</Text>
        </View>
      );
    });
  }

  render() {
    return(
      <View>
        <Text>Liked tracks:</Text>
        {this.tracks()}
      </View>
    )
  }

}
