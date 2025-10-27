import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "@/context/CartContext";
import { router } from "expo-router";

const API_URL = "https://68fee919e02b16d1753bc821.mockapi.io/foods";

export interface Food {
  id: string;
  name: string;
  price: string;
  avatar: string;
}

export default function Drinks() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart, cart } = useCart();

  const fetchFoods = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setFoods(data);
    } catch (err) {
      console.error("Error fetching foods:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFoods();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const getTotalItems = (): number => {
    return cart.reduce((sum: number, cartItem) => sum + cartItem.quantity, 0);
  };

  const getTotalPrice = (): number => {
    return cart.reduce((total: number, cartItem) => {
      return total + parseFloat(cartItem.item.price) * cartItem.quantity;
    }, 0);
  };

  const filteredFoods = foods.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Food }) => {
    const cartItem = cart.find((c) => c.item.id === item.id);
    const quantity = cartItem?.quantity || 0;
    return (
      <View style={styles.itemContainer}>
        <Image
          source={{ uri: item.avatar }}
          style={styles.itemImage}
          contentFit="cover"
          placeholder="https://via.placeholder.com/80"
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.priceContainer}>
            <Ionicons name="play" size={12} color="#666" />
            <Text style={styles.itemPrice}>
              ${parseFloat(item.price).toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => addToCart(item)}
          >
            <Text style={styles.buttonText}>Add To Cart</Text>
          </TouchableOpacity>
          {quantity > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{quantity}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading drinks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Drinks</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={28} color="#10B981" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search drinks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filteredFoods}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10B981"]}
            tintColor="#10B981"
            title="Pull to refresh"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No drinks found</Text>
            {searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text style={styles.clearSearch}>Clear search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Go to Cart Button */}
      <View style={styles.cartButtonContainer}>
        <TouchableOpacity
          style={[
            styles.cartButton,
            getTotalItems() === 0 && styles.cartButtonDisabled,
          ]}
          onPress={() => router.replace("/cart")}
        >
          <View style={styles.cartButtonContent}>
            <View>
              <Text style={styles.cartButtonText}>GO TO CART</Text>
              {getTotalItems() > 0 && (
                <Text style={styles.cartButtonSubtext}>
                  {getTotalItems()} items • ${getTotalPrice().toFixed(2)}
                </Text>
              )}
            </View>
            {getTotalItems() > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{getTotalItems()}</Text>
              </View>
            )}
          </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#F5F5F5",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
  },
  searchButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  itemInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemPrice: {
    fontSize: 16,
    color: "#666",
    marginLeft: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  buttonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0.1,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    minWidth: 24,
    textAlign: "center",
  },
  cartButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#F5F5F5",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  cartButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  cartButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0.1,
  },
  cartButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  cartButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  cartButtonSubtext: {
    color: "#fff",
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
  },
  badge: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    minWidth: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
  },
  clearSearch: {
    fontSize: 14,
    color: "#10B981",
    marginTop: 8,
    fontWeight: "600",
  },
});
