import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function CustomerChatList() {
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/customer/chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setChats(data.chats);
      }
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const renderChat = ({ item }) => {
    const other = (item.participants || []).find(p => p.role !== 'customer');
    return (
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}
        onPress={() => router.push({ pathname: '/customer/customer-chat', params: { chatId: item._id } })}
      >
        <Image source={{ uri: other?.image || 'https://via.placeholder.com/40' }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>{other?.name || 'Provider'}</Text>
          <Text style={{ color: theme.textLight, fontFamily: Fonts.body }} numberOfLines={1}>{item.messages?.slice(-1)[0]?.content || 'No messages yet.'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <View style={{ backgroundColor: theme.card, padding: 24, borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>Inbox</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : chats.length === 0 ? (
        <Text style={{ color: theme.textLight, textAlign: 'center', marginTop: 40, fontFamily: Fonts.body }}>No chats yet.</Text>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={item => item._id}
          renderItem={renderChat}
        />
      )}
    </SafeAreaView>
  );
} 