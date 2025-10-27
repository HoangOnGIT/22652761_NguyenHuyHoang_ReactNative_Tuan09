import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import { router } from "expo-router";

const API_URL = "https://68fee919e02b16d1753bc821.mockapi.io/shops";

interface Shop {
  id: string;
  name: string;
  avatar: string;
  acceptingOrders: boolean;
}

export default function Shops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchShops = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setShops(data);
    } catch (err) {
      console.error("Error fetching shops:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setShops(data);
    } catch (err) {
      console.error("Error refreshing shops:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const renderItem = ({ item }: { item: Shop }) => {
    return (
      <TouchableOpacity onPress={() => router.replace("/drinks")}>
        <View style={styles.itemContainer}>
          <Image
            source={{ uri: item.avatar }}
            style={styles.image}
            contentFit="cover"
          />

          <View style={styles.infoContainer}>
            <View style={styles.tagsContainer}>
              {item.acceptingOrders ? (
                <View style={[styles.tag, styles.tagAccepting]}>
                  <Text style={styles.tagTextGreen}>Accepting Order</Text>
                </View>
              ) : (
                <View style={[styles.tag, styles.tagUnavailable]}>
                  <Text style={styles.tagTextRed}>Temporarily Unavailable</Text>
                </View>
              )}
              <View style={[styles.tag, styles.tagTime]}>
                <Text style={styles.tagTextRed}>5 - 10 minutes</Text>
              </View>
            </View>
            <Text style={styles.shopName}>{item.name}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#689F38" />
        <Text style={styles.loadingText}>Loading shops...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={shops}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#9Bd35A", "#689F38"]}
            tintColor="#689F38"
            title="Pull to refresh"
            titleColor="#689F38"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No shops available</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContent: {
    padding: 10,
  },
  itemContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 120,
    backgroundColor: "#f0f0f0",
  },
  infoContainer: {
    padding: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagAccepting: {
    backgroundColor: "#E8F5E9",
  },
  tagUnavailable: {
    backgroundColor: "#FFEBEE",
  },
  tagTime: {
    backgroundColor: "#FFF3E0",
  },
  tagTextGreen: {
    color: "#2E7D32",
    fontSize: 12,
    fontWeight: "600",
  },
  tagTextRed: {
    color: "#C62828",
    fontSize: 12,
    fontWeight: "600",
  },
  shopName: {
    fontWeight: "700",
    fontSize: 16,
    color: "#333",
  },
  separator: {
    height: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
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
  },
});
