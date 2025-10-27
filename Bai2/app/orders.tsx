import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface OrderLines {
  id: string;
  name: string;
  price: number;
  quantity: number;
  avatar: string;
}

export default function Orders() {
  const db = useSQLiteContext();
  const [orders, setOrders] = useState<OrderLines[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const orderData = await db.getAllAsync<OrderLines>(
        "SELECT * FROM cartItems ORDER BY name"
      );
      setOrders(orderData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Alert.alert("Error", "Failed to load orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchOrders();
    setRefreshing(false);
  }, [refetchOrders]);

  const clearAllOrders = () => {
    Alert.alert(
      "Clear All Orders",
      "Are you sure you want to clear all orders? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await db.runAsync("DELETE FROM cartItems");
              await refetchOrders();
              Alert.alert("Success", "All orders have been cleared.");
            } catch (error) {
              console.error("Error clearing orders:", error);
              Alert.alert("Error", "Failed to clear orders. Please try again.");
            }
          },
        },
      ]
    );
  };

  const deleteOrder = (id: string) => {
    Alert.alert("Delete Order", "Are you sure you want to delete this order?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await db.runAsync("DELETE FROM cartItems WHERE id = ?", id);
            await refetchOrders();
            Alert.alert("Success", "Order deleted successfully.");
          } catch (error) {
            console.error("Error deleting order:", error);
            Alert.alert("Error", "Failed to delete order. Please try again.");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    refetchOrders();
  }, [refetchOrders]);

  const getTotalValue = (): number => {
    return orders.reduce(
      (total, order) => total + order.price * order.quantity,
      0
    );
  };

  const getTotalItems = (): number => {
    return orders.reduce((total, order) => total + order.quantity, 0);
  };

  const renderOrderItem = ({ item }: { item: OrderLines }) => {
    const subtotal = item.price * item.quantity;

    return (
      <View style={styles.orderItemContainer}>
        <Image
          source={{ uri: item.avatar }}
          style={styles.itemImage}
          contentFit="cover"
          placeholder="https://via.placeholder.com/80"
        />

        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)} each</Text>
          <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
          <Text style={styles.subtotal}>Subtotal: ${subtotal.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteOrder(item.id)}
        >
          <Ionicons name="trash-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading && orders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>No Orders Yet</Text>
        <Text style={styles.emptySubtitle}>
          Your order history will appear here after checkout
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Lines</Text>
        <Text style={styles.headerSubtitle}>
          {getTotalItems()} items • ${getTotalValue().toFixed(2)} total
        </Text>
        {orders.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearAllOrders}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Items</Text>
          <Text style={styles.summaryValue}>{getTotalItems()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Value</Text>
          <Text style={styles.totalValue}>${getTotalValue().toFixed(2)}</Text>
        </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  clearButtonText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  orderItemContainer: {
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
  quantity: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  subtotal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
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
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 16,
    color: "#000",
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10B981",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
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
    textAlign: "center",
    lineHeight: 24,
  },
});
