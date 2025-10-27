import { CartItem, useCart } from "@/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Cart() {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart();
  const router = useRouter();
  const db = useSQLiteContext();
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    async function checkDatabase() {
      try {
        console.log("Checking database readiness...");

        // First check if database is accessible
        await db.getFirstAsync("SELECT 1");
        console.log("Database connection verified");

        // Verify the table exists
        const tableExists = await db.getFirstAsync(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='cartItems'"
        );

        if (tableExists) {
          console.log("cartItems table found");
          setIsDbReady(true);
        } else {
          console.log("cartItems table not found, attempting to create it...");
          try {
            await db.execAsync(`
              CREATE TABLE IF NOT EXISTS cartItems (
                id TEXT PRIMARY KEY NOT NULL, 
                quantity INTEGER NOT NULL, 
                avatar TEXT NOT NULL, 
                name TEXT NOT NULL, 
                price REAL NOT NULL
              );
            `);
            console.log("cartItems table created successfully");
            setIsDbReady(true);
          } catch (createError) {
            console.error("Failed to create cartItems table:", createError);
            setIsDbReady(false);
          }
        }
      } catch (error) {
        console.error("Database check error:", error);
        setIsDbReady(false);
      }
    }
    checkDatabase();
  }, [db]);

  const getTotalPrice = (): number => {
    return cart.reduce((total: number, cartItem) => {
      return total + parseFloat(cartItem.item.price) * cartItem.quantity;
    }, 0);
  };

  const getTotalItems = (): number => {
    return cart.reduce((sum: number, cartItem) => sum + cartItem.quantity, 0);
  };

  const handleCheckout = async (items: CartItem[]) => {
    if (!isDbReady) {
      console.error("Database is not ready yet");
      return;
    }

    try {
      for (const cartItem of items) {
        await db.runAsync(
          "INSERT INTO cartItems (id, quantity, avatar, name, price) VALUES (?, ?, ?, ?, ?)",
          cartItem.item.id,
          cartItem.quantity,
          cartItem.item.avatar,
          cartItem.item.name,
          parseFloat(cartItem.item.price)
        );
      }
      console.log("Checkout successful!");

      // Clear the cart after successful checkout
      clearCart();

      Alert.alert(
        "Checkout Successful!",
        "Your order has been placed successfully.",
        [
          {
            text: "View Orders",
            onPress: () => router.push("/orders"),
          },
          {
            text: "Continue Shopping",
            onPress: () => router.push("/drinks"),
          },
        ]
      );
    } catch (error) {
      console.error("Checkout error:", error);
      // You can show an error message to the user here
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const subtotal = parseFloat(item.item.price) * item.quantity;

    return (
      <View style={styles.cartItemContainer}>
        <Image
          source={{ uri: item.item.avatar }}
          style={styles.itemImage}
          contentFit="cover"
          placeholder="https://via.placeholder.com/80"
        />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.item.name}
          </Text>
          <Text style={styles.itemPrice}>
            ${parseFloat(item.item.price).toFixed(2)} each
          </Text>
          <Text style={styles.subtotal}>Subtotal: ${subtotal.toFixed(2)}</Text>
        </View>

        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => {
              if (item.quantity === 1) {
                removeFromCart(item.item.id);
              } else {
                decreaseQuantity(item.item);
              }
            }}
          >
            <Ionicons
              name={item.quantity === 1 ? "trash-outline" : "remove"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => increaseQuantity(item.item)}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => removeFromCart(item.item.id)}
        >
          <Ionicons name="close-circle" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  };

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add some items to get started</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push("/drinks")}
        >
          <Ionicons name="storefront-outline" size={20} color="#fff" />
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <Text style={styles.headerSubtitle}>{getTotalItems()} items</Text>
      </View>

      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${getTotalPrice().toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>$5.00</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (10%)</Text>
          <Text style={styles.summaryValue}>
            ${(getTotalPrice() * 0.1).toFixed(2)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            ${(getTotalPrice() + 5 + getTotalPrice() * 0.1).toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => handleCheckout(cart)}
          disabled={!isDbReady}
        >
          <Text style={styles.checkoutButtonText}>
            {isDbReady ? "Proceed to Checkout" : "Loading..."}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  cartItemContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#E5E5E5",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  subtotal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
  },
  quantityControls: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginVertical: 4,
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  summaryContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10B981",
  },
  checkoutButton: {
    backgroundColor: "#FFA500",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  shopButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
