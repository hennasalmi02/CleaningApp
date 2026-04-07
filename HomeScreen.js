import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {

    const styles = StyleSheet.create({
        container: {
          padding: 20,
        },
      });

    return (
        <View style={styles.container}>
            <Text>Home</Text>
        </View>
    )
}