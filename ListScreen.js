import React from "react";
import * as SQLite from "expo-sqlite";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Button,
  FlatList,
  TextInput,
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function ListScreen({ navigation }) {
  const db = SQLite.openDatabaseSync("cleaning.db");

  const [title, setTitle] = React.useState("");
  const [todos, setTodos] = React.useState([]);
  const [room, setRoom] = React.useState("");

  const initialize = async () => {
    try {
      await db.execAsync(`
            CREATE TABLE IF NOT EXISTS todo (id INTEGER PRIMARY KEY NOT NULL, room TEXT, title TEXT);
          `);
    } catch (error) {
      console.error("Could not open database", error);
    }
  };

  const saveItem = async () => {
    try {
      await db.runAsync(
        "INSERT INTO todo (title, room) VALUES (?, ?)",
        title,
        room
      );
      await updateList();
      setTitle("");
      setRoom("");
    } catch (error) {
      console.error("Could not add item", error);
    }
  };

  const updateList = async () => {
    try {
      const list = await db.getAllAsync("SELECT * from todo");
      setTodos(list);
    } catch (error) {
      console.error("Could not get items", error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await db.runAsync("DELETE FROM todo WHERE id=?", id);
      await updateList();
    } catch (error) {
      console.error("Could not delete item", error);
    }
  };

  React.useEffect(() => {
    const init = async () => {
      await initialize();
      await updateList();
    };
    init();
  }, []);

  const styles = StyleSheet.create({
    container: {
      padding: 20,
    },
  });

  return (
    <View>
      <View style={styles.container}>
        <Text>Add a todo</Text>
        <TextInput
          placeholder="Title"
          onChangeText={(title) => setTitle(title)}
          value={title}
        />
        <TextInput
          placeholder="Room"
          onChangeText={(room) => setRoom(room)}
          value={room}
        />
        <Button onPress={saveItem} title="Save" />
      </View>
      <View>
        <FlatList
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View>
              <Text>{item.title}</Text>
              <Text>{item.room} </Text>
              <Ionicons
                name="minus-circle"
                size={24}
                color="red"
                onPress={() => deleteItem(item.id)}
              />
            </View>
          )}
          data={todos}
        />
      </View>
    </View>
  );
}
