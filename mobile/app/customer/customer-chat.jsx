import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';
import { getApiUrl, getApiUrlWithParams, apiCall, API_CONFIG } from '../../config/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function CustomerChat() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef();
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadUserData();
    if (params.chatId) {
      fetchChatMessages();
    }
  }, [params.chatId]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const url = getApiUrlWithParams(API_CONFIG.ENDPOINTS.CUSTOMER_CHAT_MESSAGES, { chatId: params.chatId });
      const data = await apiCall(url);
      setMessages(data.messages || []);
      setProvider(data.provider);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      content: newMessage.trim(),
      senderId: user._id,
      receiverId: provider._id,
      timestamp: new Date().toISOString()
    };

    setSending(true);
    try {
      const url = getApiUrlWithParams(API_CONFIG.ENDPOINTS.CUSTOMER_CHAT_SEND, { chatId: params.chatId });
      await apiCall(url, {
        method: 'POST',
        body: JSON.stringify(messageData)
      });

      // Add message to local state
      setMessages(prev => [...prev, { ...messageData, _id: Date.now().toString() }]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isMyMessage = (message) => {
    return message.senderId === user?._id;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.textDark, fontFamily: Fonts.body }}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 45,
        paddingBottom: 15,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color={theme.textDark} />
        </TouchableOpacity>
        <Image
          source={{ uri: provider?.image || 'https://via.placeholder.com/40' }}
          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
            {provider?.name || 'Service Provider'}
          </Text>
          <Text style={{ fontSize: 12, color: theme.textLight, fontFamily: Fonts.caption }}>
            {provider?.service?.title || 'Service'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/customer/customer-support')}>
          <Ionicons name="ellipsis-vertical" size={24} color={theme.textDark} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, padding: 16 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="chatbubble-outline" size={48} color={theme.textLight} />
              <Text style={{ color: theme.textLight, fontFamily: Fonts.body, marginTop: 12, textAlign: 'center' }}>
                No messages yet.{'\n'}Start a conversation with your service provider.
              </Text>
            </View>
          ) : (
            messages.map((message) => (
              <View
                key={message._id}
                style={{
                  marginBottom: 12,
                  alignItems: isMyMessage(message) ? 'flex-end' : 'flex-start'
                }}
              >
                <View style={{
                  backgroundColor: isMyMessage(message) ? theme.primary : theme.card,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 18,
                  maxWidth: '80%',
                  borderWidth: isMyMessage(message) ? 0 : 1,
                  borderColor: theme.border
                }}>
                  <Text style={{
                    color: isMyMessage(message) ? '#fff' : theme.textDark,
                    fontFamily: Fonts.body,
                    fontSize: 14,
                    lineHeight: 20
                  }}>
                    {message.content}
                  </Text>
                  <Text style={{
                    color: isMyMessage(message) ? 'rgba(255,255,255,0.7)' : theme.textLight,
                    fontFamily: Fonts.caption,
                    fontSize: 10,
                    marginTop: 4,
                    alignSelf: 'flex-end'
                  }}>
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Message Input */}
        <View style={{
          backgroundColor: theme.card,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: theme.background,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              color: theme.textDark,
              fontFamily: Fonts.body,
              fontSize: 14,
              marginRight: 8,
              maxHeight: 100
            }}
            placeholder="Type a message..."
            placeholderTextColor={theme.textLight}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={{
              backgroundColor: theme.primary,
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: sending || !newMessage.trim() ? 0.5 : 1
            }}
            onPress={sendMessage}
            disabled={sending || !newMessage.trim()}
          >
            {sending ? (
              <Ionicons name="hourglass-outline" size={20} color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 