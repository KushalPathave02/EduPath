import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../api/apiService';

interface UserProfile {
  name: string;
  email: string;
}

const ProfileScreen = () => {
  const { logout } = useContext(AuthContext);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        setProfile(response.data);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5e4de2" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        {profile && (
          <View style={styles.profileInfo}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{profile.name}</Text>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{profile.email}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f4f8' },
  container: { flex: 1, padding: 20, alignItems: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: '#333', marginTop: 30 },
  profileInfo: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 30,
  },
  label: { fontSize: 16, color: '#666', marginBottom: 5 },
  value: { fontSize: 18, fontWeight: '500', color: '#333', marginBottom: 15 },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ProfileScreen;
