import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function ProductsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [prodRes, catRes] = await Promise.all([
          fetch('https://fakestoreapi.com/products'),
          fetch('https://fakestoreapi.com/products/categories'),
        ]);
        const prodJson = await prodRes.json();
        const catJson = await catRes.json();
        if (!cancelled) {
          setProducts(prodJson);
          setCategories(['all', ...catJson]);
        }
      } catch (e) {
        if (!cancelled) setError('Failed to load products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  if (loading) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={styles.header}>
        <Text style={styles.title}>ShopEZ Products</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Link href="/(tabs)/explore"><Text style={styles.link}>Cart</Text></Link>
          <Pressable onPress={async () => {
            try {
              if (!user) {
                router.push('/login');
                return;
              }
              await logout();
              router.replace('/login');
            } catch {}
          }}>
            <Text style={styles.link}>Logout</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.categories}>
        {categories.map((c) => (
          <Pressable key={c} onPress={() => setSelectedCategory(c)} style={[styles.catBtn, selectedCategory === c && styles.catBtnActive]}>
            <Text style={[styles.catText, selectedCategory === c && styles.catTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/product/[id]', params: { id: String(item.id) } }} asChild>
            <Pressable style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.99 }] }]}>
              <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={2} style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              </View>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#E6F0FF' },
  title: { fontSize: 22, fontWeight: '700', color: '#0F172A' },
  link: { color: '#3B82F6', fontWeight: '700' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, paddingBottom: 8 },
  catBtn: { borderWidth: 1, borderColor: '#C7DAFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F2F7FF' },
  catBtnActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  catText: { color: '#0F172A' },
  catTextActive: { color: 'white' },
  card: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, gap: 12, alignItems: 'center', shadowColor: '#3B82F6', shadowOpacity: 0.08, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#E6F0FF' },
  image: { width: 64, height: 64 },
  productTitle: { fontWeight: '600', marginBottom: 4, color: '#0F172A' },
  price: { fontWeight: '700', color: '#0F172A' },
});


