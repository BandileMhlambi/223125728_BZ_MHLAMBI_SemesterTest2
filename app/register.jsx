import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Passwords do not match');
      return;
    }
    try {
      setSubmitting(true);
      await register(email.trim(), password);
    } catch (e) {
      const msg = (e?.code || 'register_failed').replace('auth/', '').replaceAll('-', ' ');
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Create Account</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" style={styles.input} />
        <Text style={styles.label}>Password</Text>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Enter password" style={styles.input} />
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="Repeat password" style={styles.input} />
        <Pressable onPress={onSubmit} style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]} disabled={submitting}>
          <Text style={styles.buttonText}>{submitting ? 'Creating...' : 'Register'}</Text>
        </Pressable>
        <View style={styles.row}>
          <Text>Already have an account? </Text>
          <Link href="/login"><Text style={styles.link}>Login</Text></Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#FFFFFF' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24, color: '#0F172A' },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, gap: 8, shadowColor: '#3B82F6', shadowOpacity: 0.08, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#E6F0FF' },
  label: { fontWeight: '600', color: '#0F172A' },
  input: { borderWidth: 1, borderColor: '#C7DAFF', borderRadius: 8, padding: 12, backgroundColor: '#F2F7FF' },
  button: { backgroundColor: '#3B82F6', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: 'white', fontWeight: '700' },
  row: { flexDirection: 'row', marginTop: 12 },
  link: { color: '#3B82F6', fontWeight: '700' },
});


