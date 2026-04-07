import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SettingScreen({ navigation }) {

  const styles = StyleSheet.create({
    container: {
      padding: 20,
    },
  });
  
    return (
      <View style={styles.container}>
        <Text>Settings</Text>
      </View>
    );
  }