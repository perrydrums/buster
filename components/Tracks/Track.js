import React from 'react';
import {Text, StyleSheet, View, Image} from 'react-native';
import {Font} from 'expo';
import PropTypes from 'prop-types'

class Track extends React.Component {
  state = {
    fontLoaded: false,
  };

  async componentDidMount() {
    await Font.loadAsync({
      'ProximaNova': require('../../assets/fonts/ProximaNovaBold.otf'),
    });
    this.setState({fontLoaded: true});
  }

  render() {
    const track = this.props.track;

    return (
      <View>
        {
          this.state.fontLoaded ? (
            <View style={styles.track}>
              <Image source={{uri: track.album.images[0].url}}
                     style={styles.trackImage} />
              <Text style={styles.trackTitle}>{track.name}</Text>
            </View>
          ) : null
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 70,
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
});

Track.propTypes = {
  track: PropTypes.object.isRequired,
};

export default Track;
