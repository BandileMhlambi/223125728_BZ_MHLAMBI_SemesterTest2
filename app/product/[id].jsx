import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '@/firebase/firebase';
import { ref, get, set, update } from 'firebase/database';
import { useAuth } from '@/context/AuthContext';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`https://fakestoreapi.com/products/${id}`);
        const json = await res.json();
        if (!cancelled) setProduct(json);
      } catch (e) {
        if (!cancelled) setError('Failed to load product');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function addToCart() {
    if (!user) {
      Alert.alert('Login required', 'Please login to add items to your cart.');
      return;
    }
    if (!product) return;
    try {
      const itemRef = ref(db, `carts/${user.uid}/${product.id}`);
      const snap = await get(itemRef);
      if (snap.exists()) {
        const { quantity = 0 } = snap.val();
        await update(itemRef, { quantity: quantity + 1, price: product.price, title: product.title, image: product.image });
      } else {
        await set(itemRef, { quantity: 1, price: product.price, title: product.title, image: product.image });
      }
      Alert.alert(
        'Added to Cart',
        'This item was added to your cart.',
        [
          { text: 'Keep Browsing', onPress: () => router.back(), style: 'default' },
          { text: 'Go to Cart', onPress: () => router.push('/(tabs)/explore') },
        ]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to add to cart. Check your internet and database rules.');
    }
  }

  if (loading) {
    return (
      <View style={styles.center}><ActivityIndicator /></View>
    );
  }
  if (error || !product) {
    return (
      <View style={styles.center}><Text>{error || 'Not found'}</Text></View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: '#FFFFFF' }}>
      <Image source={{ uri: product.image }} style={{ width: '100%', height: 280 }} resizeMode="contain" />
      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      <Text style={styles.desc}>{product.description}</Text>
      <Pressable onPress={addToCart} style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}>
        <Text style={styles.buttonText}>Add to Cart</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', marginTop: 12, color: '#0F172A' },
  price: { fontSize: 16, fontWeight: '700', marginVertical: 8, color: '#0F172A' },
  desc: { color: '#0F172A', marginBottom: 16 },
  button: { backgroundColor: '#3B82F6', padding: 14, alignItems: 'center', borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: '700' },
});


