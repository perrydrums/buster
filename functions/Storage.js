import {AsyncStorage} from 'react-native';

export default class Storage {

  static async setUserData(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
    catch (e) {
      // Error.
    }
  }

  static async getUserData(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value);
      }
    } catch (error) {
      return null;
    }
  }

  static unsetUserData(keys) {
    keys.forEach(key => {
      AsyncStorage.removeItem(key);
    });
  }

}
