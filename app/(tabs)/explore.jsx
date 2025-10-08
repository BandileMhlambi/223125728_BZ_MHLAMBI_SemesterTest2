import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { db } from '@/firebase/firebase';
import { onValue, ref, remove, update } from 'firebase/database';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CartScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub;
    async function init() {
      if (!user) {
        // Not logged in: show empty cart instead of infinite spinner
        setItems({});
        setLoading(false);
        return;
      }
      const cacheKey = `cart:${user.uid}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        try {
          setItems(JSON.parse(cached));
        } catch {}
      }
      setLoading(false);
      const cartRef = ref(db, `carts/${user.uid}`);
      unsub = onValue(cartRef, async (snap) => {
        const val = snap.val() || {};
        setItems(val);
        await AsyncStorage.setItem(cacheKey, JSON.stringify(val));
      });
    }
    init();
    return () => {
      if (unsub) unsub();
    };
  }, [user]);

  async function updateQty(id, delta) {
    const current = items[id]?.quantity || 0;
    const next = current + delta;
    const itemRef = ref(db, `carts/${user?.uid}/${id}`);
    if (next <= 0) {
      remove(itemRef);
    } else {
      update(itemRef, { quantity: next });
    }
    const updated = { ...items };
    if (next <= 0) {
      delete updated[id];
    } else {
      updated[id] = { ...(updated[id] || {}), quantity: next };
    }
    setItems(updated);
    if (user?.uid) await AsyncStorage.setItem(`cart:${user.uid}`, JSON.stringify(updated));
  }

  const total = useMemo(() => Object.entries(items).reduce((sum, [, it]) => sum + it.price * it.quantity, 0), [items]);

  if (loading) {
    return (
      <View style={styles.center}><ActivityIndicator /></View>
    );
  }

  const entries = Object.entries(items);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Cart</Text>
      </View>
      <FlatList
        data={entries}
        keyExtractor={([id]) => id}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        renderItem={({ item: [id, it] }) => (
          <View style={styles.card}>
            <Image source={{ uri: it.image }} style={styles.image} resizeMode="contain" />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={2} style={styles.productTitle}>{it.title}</Text>
              <Text style={styles.price}>${it.price.toFixed(2)}</Text>
              <View style={styles.row}>
                <Pressable onPress={() => updateQty(id, -1)} style={({ pressed }) => [styles.qtyBtn, pressed && { opacity: 0.8 }]}><Text style={styles.qtyText}>-</Text></Pressable>
                <Text style={styles.qty}>Qty: {it.quantity}</Text>
                <Pressable onPress={() => updateQty(id, 1)} style={({ pressed }) => [styles.qtyBtn, pressed && { opacity: 0.8 }]}><Text style={styles.qtyText}>+</Text></Pressable>
              </View>
            </View>
            <Pressable onPress={() => remove(ref(db, `carts/${user?.uid}/${id}`))} style={({ pressed }) => [pressed && { opacity: 0.8 }]}><Text style={styles.remove}>Remove</Text></Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 24 }}>Your cart is empty.</Text>}
      />
      <View style={styles.totalBar}>
        <Text style={styles.totalText}>Total: ${total.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#E6F0FF' },
  title: { fontSize: 22, fontWeight: '700', color: '#0F172A' },
  card: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, gap: 12, alignItems: 'center', shadowColor: '#3B82F6', shadowOpacity: 0.08, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#E6F0FF' },
  image: { width: 64, height: 64 },
  productTitle: { fontWeight: '600', marginBottom: 4, maxWidth: 200, color: '#0F172A' },
  price: { fontWeight: '700', marginBottom: 6, color: '#0F172A' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 6 },
  qtyText: { fontWeight: '700' },
  qty: { minWidth: 64, textAlign: 'center' },
  remove: { color: '#dc2626', fontWeight: '700' },
  totalBar: { padding: 16, borderTopWidth: 1, borderTopColor: '#E6F0FF', backgroundColor: '#FFFFFF' },
  totalText: { fontSize: 18, fontWeight: '800', textAlign: 'right', color: '#0F172A' },
});


