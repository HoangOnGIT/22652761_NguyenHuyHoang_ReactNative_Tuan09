import CustomerHeader from "@/components/CustomerHeader";
import { CartProvider } from "@/context/CartContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <SQLiteProvider databaseName="db.db" onInit={migrateDbIfNeeded}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <CartProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <Stack
                initialRouteName="welcome"
                screenOptions={{
                  header: (props) => <CustomerHeader {...props} />,
                }}
              >
                <Stack.Screen
                  name="welcome"
                  options={{ headerShown: false, title: "Welcome" }}
                />
                <Stack.Screen
                  name="orders"
                  options={{ headerShown: false, title: "Welcome" }}
                />
                <Stack.Screen name="drinks" options={{ headerShown: false }} />
                <Stack.Screen
                  name="shops"
                  options={{ title: "Shops Near You" }}
                />
                <Stack.Screen name="cart" options={{ title: "Your orders" }} />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </CartProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </SQLiteProvider>
  );
}

async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  try {
    console.log("Starting database migration...");

    // Check if database is accessible
    await db.getFirstAsync("SELECT 1");
    console.log("Database connection verified");

    let result = await db.getFirstAsync<{ user_version: number }>(
      "PRAGMA user_version"
    );
    let currentDbVersion = result?.user_version ?? 0;
    console.log(`Current database version: ${currentDbVersion}`);

    if (currentDbVersion >= DATABASE_VERSION) {
      console.log("Database is up to date");
      return;
    }

    if (currentDbVersion === 0) {
      console.log("Creating cartItems table...");
      await db.execAsync(`
        PRAGMA journal_mode = 'wal';
        CREATE TABLE IF NOT EXISTS cartItems (
          id TEXT PRIMARY KEY NOT NULL, 
          quantity INTEGER NOT NULL, 
          avatar TEXT NOT NULL, 
          name TEXT NOT NULL, 
          price REAL NOT NULL
        );
      `);

      // Verify table was created
      const tableCheck = await db.getFirstAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='cartItems'"
      );
      console.log("Table creation verification:", tableCheck);

      currentDbVersion = 1;
    }

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    console.log("Database migration completed successfully");
  } catch (error) {
    console.error("Database migration error:", error);
    throw error;
  }
}
