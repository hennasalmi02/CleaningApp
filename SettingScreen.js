import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SettingScreen({ navigation }) {

  const styles = StyleSheet.create({
    container: {
      padding: 20,
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        Settings
      </Text>
    </View>
  );
}