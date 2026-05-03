import React from "react";
import * as SQLite from "expo-sqlite";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Button,
  TextInput,
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";

export default function ListScreen({ navigation }) {
  const db = SQLite.openDatabaseSync("cleaning.db");

  const [title, setTitle] = React.useState("");
  const [room, setRoom] = React.useState("");
  const [todos, setTodos] = React.useState([]);

  const [date, setDate] = React.useState(new Date());
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const [frequencyType, setFrequencyType] = React.useState("daily");
  const [interval, setInterval] = React.useState("1");
  const [unit, setUnit] = React.useState("days");

  const types = ["daily", "weekly", "monthly", "custom"];

  const [refreshing, setRefreshing] = React.useState(false);

  const initialize = async () => {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS todo (
          id INTEGER PRIMARY KEY NOT NULL,
          title TEXT,
          room TEXT,
          startDate TEXT,
          frequencyType TEXT,
          frequencyInterval INTEGER,
          frequencyUnit TEXT
        );
  
        CREATE TABLE IF NOT EXISTS todo_done (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          todoId INTEGER,
          date TEXT
        );
      `);
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await updateList();
    setRefreshing(false);
  };
  
  const saveItem = async () => {
    try {
      await db.runAsync(
        `INSERT INTO todo (title, room, startDate, frequencyType, frequencyInterval, frequencyUnit)
         VALUES (?, ?, ?, ?, ?, ?)`,
        title,
        room,
        date.toISOString(),
        frequencyType,
        frequencyType === "custom" ? parseInt(interval) : null,
        frequencyType === "custom" ? unit : null
      );

      await updateList();
      setTitle("");
      setRoom("");
      setInterval("1");
      setFrequencyType("daily");
    } catch (error) {
      console.error("SAVE ERROR:", error);
    }
  };

  const updateList = async () => {
    const list = await db.getAllAsync("SELECT * from todo");

    const doneRows = await db.getAllAsync("SELECT * FROM todo_done");

    const doneSet = new Set(doneRows.map((r) => `${r.todoId}_${r.date}`));

    const merged = list.map((t) => ({
      ...t,
      _doneToday: doneSet.has(
        `${t.id}_${new Date().toISOString().split("T")[0]}`
      ),
    }));

    setTodos(merged);
  };

  const deleteItem = async (id) => {
    try {
      await db.runAsync("DELETE FROM todo WHERE id=?", id);
      await updateList();
    } catch (error) {
      console.error(error);
    }
  };

  const markDone = async (id) => {
    const today = new Date().toISOString().split("T")[0];

    await db.runAsync("INSERT INTO todo_done (todoId, date) VALUES (?, ?)", [
      id,
      today,
    ]);

    await updateList();
  };

  React.useEffect(() => {
    const init = async () => {
      await initialize();
      await updateList();
    };
    init();
  }, []);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setDate(selectedDate);
  };

  const styles = StyleSheet.create({
    container: {
      padding: 20,
      alignItems: "center",
    },
    input: {
      width: "100%",
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 10,
      padding: 10,
      marginTop: 10,
      fontSize: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 10,
    },
    sectionTitle: {
      marginTop: 15,
      fontSize: 16,
      fontWeight: "600",
    },
    chipContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginTop: 8,
    },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderRadius: 20,
      margin: 5,
    },
    chipActive: {
      backgroundColor: "#2196F3",
      borderColor: "#2196F3",
    },
    chipText: {
      fontSize: 14,
    },
    chipTextActive: {
      color: "white",
      fontWeight: "bold",
    },
    listItem: {
      padding: 15,
      marginHorizontal: 20,
      marginVertical: 6,
      borderRadius: 12,
      backgroundColor: "#f5f5f5",
    },
    doneButton: {
      marginTop: 8,
      backgroundColor: "#4CAF50",
      padding: 8,
      borderRadius: 8,
      alignItems: "center",
    },
    taskHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    roomTag: {
      marginTop: 6,
      alignSelf: "flex-start",
      backgroundColor: "#e3f2fd",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },

    roomText: {
      fontSize: 12,
      color: "#1565c0",
      fontWeight: "500",
    },

    frequencyTag: {
      marginTop: 6,
      alignSelf: "flex-start",
      backgroundColor: "#e3f2fd",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },

    frequencyTagText: {
      fontSize: 12,
      color: "#1565c0",
      fontWeight: "500",
    },

    checkButton: {
      marginTop: 10,
      alignSelf: "flex-start",
    },
    customContainer: {
      width: "100%",
      marginTop: 10,
    },
    customRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    customInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 10,
      padding: 10,
      fontSize: 16,
      marginRight: 8,
    },
    unitChip: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderRadius: 20,
      marginRight: 6,
    },
    unitChipActive: {
      backgroundColor: "#2196F3",
      borderColor: "#2196F3",
    },
    unitText: {
      fontSize: 14,
    },
    unitTextActive: {
      color: "white",
      fontWeight: "bold",
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Add todo</Text>

        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.input}
          placeholder="Room"
          value={room}
          onChangeText={setRoom}
        />

        <Text style={styles.sectionTitle}>Start date</Text>

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.input}
        >
          <Text style={{ fontSize: 16 }}>{date.toDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker value={date} mode="date" onChange={onChangeDate} />
        )}

        <Text style={styles.sectionTitle}>Frequency</Text>

        <View style={styles.chipContainer}>
          {types.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setFrequencyType(t)}
              style={[styles.chip, frequencyType === t && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  frequencyType === t && styles.chipTextActive,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {frequencyType === "custom" && (
          <View style={styles.customContainer}>
            <View style={styles.customRow}>
              <TextInput
                style={styles.customInput}
                placeholder="Interval (e.g. 3)"
                keyboardType="numeric"
                value={interval}
                onChangeText={setInterval}
              />
              <View style={{ flexDirection: "row" }}>
                {["days", "weeks", "months"].map((u) => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setUnit(u)}
                    style={[
                      styles.unitChip,
                      unit === u && styles.unitChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        unit === u && styles.unitTextActive,
                      ]}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={saveItem}
          style={{
            marginTop: 20,
            backgroundColor: "#2196F3",
            paddingVertical: 12,
            paddingHorizontal: 25,
            borderRadius: 25,
            alignItems: "center",
            alignSelf: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 16,
              letterSpacing: 0.5,
            }}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2196F3"
            colors={["#2196F3"]}
          />
        }
      >
        {todos.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <View style={styles.taskHeader}>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  textDecorationLine: item._done ? "line-through" : "none",
                }}
              >
                {item.title}
              </Text>
              <Ionicons
                name="trash"
                size={20}
                color="#999"
                onPress={() => deleteItem(item.id)}
              />
            </View>

            <View style={styles.roomTag}>
              <Text style={styles.roomText}>🏠 {item.room}</Text>
            </View>

            <View style={styles.frequencyTag}>
              <Text style={styles.frequencyTagText}>
                ⏰{" "}
                {item.frequencyType === "custom"
                  ? `Every ${item.frequencyInterval} ${
                      item.frequencyInterval === 1
                        ? item.frequencyUnit.slice(0, -1)
                        : item.frequencyUnit
                    }`
                  : item.frequencyType}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
