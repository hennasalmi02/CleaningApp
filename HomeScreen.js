import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, RefreshControl } from "react-native";
import * as SQLite from "expo-sqlite";

export default function HomeScreen() {
  const db = SQLite.openDatabaseSync("cleaning.db");

  const [todos, setTodos] = React.useState([]);
  const [doneSet, setDoneSet] = React.useState(new Set());

  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    init();
  }, []);

  const init = async () => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS todo_done (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todoId INTEGER,
        date TEXT
      );
    `);

    await load();
  };

  const load = async () => {
    const list = await db.getAllAsync("SELECT * FROM todo");
    const doneRows = await db.getAllAsync("SELECT * FROM todo_done");

    const set = new Set(
      doneRows.map(r => `${r.todoId}_${r.date}`)
    );

    setTodos(list);
    setDoneSet(set);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const getToday = () =>
    new Date().toISOString().split("T")[0];

  const markDone = async (id) => {
    const today = getToday();
    const key = `${id}_${today}`;

    if (doneSet.has(key)) {
      await db.runAsync(
        "DELETE FROM todo_done WHERE todoId = ? AND date = ?",
        [id, today]
      );

      const newSet = new Set(doneSet);
      newSet.delete(key);
      setDoneSet(newSet);
      return;
    }

    await db.runAsync(
      "INSERT INTO todo_done (todoId, date) VALUES (?, ?)",
      [id, today]
    );

    const newSet = new Set(doneSet);
    newSet.add(key);
    setDoneSet(newSet);
  };

  const getWeekDays = () => {
    const today = new Date();
    const day = today.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;

    return [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() + mondayOffset + i);
      return d;
    });
  };

  const weekDays = getWeekDays();

  const isTodoForDay = (todo, date) => {
    const start = new Date(todo.startDate);

    if (date < new Date(start.toDateString())) return false;

    if (todo.frequencyType === "daily") return true;

    if (todo.frequencyType === "weekly") {
      return date.getDay() === start.getDay();
    }

    if (todo.frequencyType === "monthly") {
      return date.getDate() === start.getDate();
    }

    return false;
  };

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: "#f7f9fc",
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
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
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        This Week
      </Text>

      <ScrollView
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
        {weekDays.map((day) => {
          const dayTodos = todos.filter((t) => isTodoForDay(t, day));
          const isToday = new Date().toDateString() === day.toDateString();

          if (dayTodos.length === 0) return null;

          return (
            <View
              key={day.toISOString()}
              style={{ marginBottom: 14 }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  marginBottom: 6,
                  color: isToday ? "#2196F3" : "#000",
                }}
              >
                {day.toDateString().slice(0, 3)} {day.getDate()}.{day.getMonth() + 1}
              </Text>

              {dayTodos.map((t) => {
                const doneToday = doneSet.has(`${t.id}_${getToday()}`);

                return (
                  <View
                    key={t.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 10,
                      backgroundColor: "#f2f2f2",
                      marginBottom: 6,
                      borderRadius: 8,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "bold", color: doneToday ? "#888" : "#000" }}>
                        {t.title}
                      </Text>

                      <View style={styles.roomTag}>
                        <Text style={styles.roomText}>🏠 {t.room}</Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => markDone(t.id)}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        borderWidth: 2,
                        borderColor: "#2196F3",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 10,
                        backgroundColor: doneToday ? "#2196F3" : "transparent",
                      }}
                    >
                      {doneToday && (
                        <Text style={{ color: "white", fontSize: 14, fontWeight: "bold" }}>
                          ✓
                        </Text>
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}