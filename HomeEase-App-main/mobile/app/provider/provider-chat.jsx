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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ProviderFooter from './shared/Footer';

export default function ProviderChat() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef();
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
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
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'provider') {
          Alert.alert('Access Denied', 'You do not have provider privileges.');
          router.replace('/');
          return;
        }
        setUser(parsedUser);
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const url = getApiUrlWithParams(API_CONFIG.ENDPOINTS.PROVIDER_CHAT_MESSAGES, { chatId: params.chatId });
      const data = await apiCall(url);
      setMessages(data.messages || []);
      setCustomer(data.customer);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    console.log('sendMessage called');
    console.log('newMessage value:', newMessage);
    const messageData = {
      content: newMessage.trim(),
      senderId: user?._id,
      receiverId: customer?._id,
      timestamp: new Date().toISOString()
    };
    console.log('messageData:', messageData);
    console.log('user:', user);
    console.log('customer:', customer);
    if (!newMessage.trim()) {
      console.log('Early return: newMessage is empty after trim');
      return;
    }
    setSending(true);
    try {
      const url = getApiUrlWithParams(API_CONFIG.ENDPOINTS.PROVIDER_CHAT_SEND, { chatId: params.chatId });
      console.log('Sending message to:', url);
      const response = await apiCall(url, {
        method: 'POST',
        body: JSON.stringify(messageData)
      });
      console.log('Send message response:', response);
      // Add message to local state
      setMessages(prev => [
        ...prev,
        {
          ...messageData,
          sender: { _id: user._id || user.id },
          senderId: user._id || user.id,
          _id: Date.now().toString()
        }
      ]);
      setNewMessage('');
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.log('Error after messageData:', error);
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
    const myId = user?._id?.toString() || user?.id?.toString();
    const senderId = message.senderId?.toString();
    const senderObjId = message.sender?._id?.toString();
    const senderStr = typeof message.sender === 'string' ? message.sender : undefined;
    console.log('isMyMessage check:', { myId, senderId, senderObjId, senderStr });
    return (
      (senderId && senderId === myId) ||
      (senderObjId && senderObjId === myId) ||
      (senderStr && senderStr === myId)
    );
  };

  if (loading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.textDark, fontFamily: Fonts.body }}>Loading chat...</Text>
      </View>
    );
  }

  // Add a log in render to confirm state updates
  console.log('Rendering messages:', messages);

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
          source={{ uri: customer?.image || 'https://via.placeholder.com/40' }}
          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
            {customer?.name || 'Customer'}
          </Text>
          <Text style={{ fontSize: 12, color: theme.textLight, fontFamily: Fonts.caption }}>
            {customer?.booking?.service?.title || 'Service Request'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/provider/complaint')}>
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
                No messages yet.{'\n'}Start a conversation with your customer.
              </Text>
            </View>
          ) : (
            messages.map((message) => {
              const isMine = isMyMessage(message);
              console.log('isMine:', isMine, 'message:', message, 'user:', user);
              return (
                <View
                  key={message._id}
                  style={{
                    marginBottom: 10,
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                  }}
                >
                  <View style={{
                    backgroundColor: isMine ? '#128C7E' : '#F4F6F8', // WhatsApp dark green for outgoing, soft gray for incoming
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 18,
                    maxWidth: '80%',
                    borderTopRightRadius: isMine ? 6 : 18,
                    borderTopLeftRadius: isMine ? 18 : 6,
                    borderBottomRightRadius: isMine ? 6 : 18,
                    borderBottomLeftRadius: isMine ? 18 : 6,
                    borderWidth: isMine ? 0 : 1,
                    borderColor: isMine ? '#128C7E' : '#e0e0e0',
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                    shadowColor: isMine ? '#128C7E' : '#000',
                    shadowOpacity: 0.10,
                    shadowRadius: 3,
                    elevation: 2,
                    marginBottom: 2,
                  }}>
                    <Text style={{
                      color: isMine ? '#fff' : '#222',
                      fontFamily: Fonts.body,
                      fontSize: 16,
                      lineHeight: 22,
                      letterSpacing: 0.1,
                    }}>
                      {message.content}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 8, gap: 2 }}>
                      <Text style={{
                        color: isMine ? 'rgba(255,255,255,0.85)' : '#888',
                        fontFamily: Fonts.caption,
                        fontSize: 12,
                        fontWeight: '500',
                        marginRight: 4,
                        letterSpacing: 0.2,
                      }}>
                        {formatTime(message.timestamp || message.createdAt)}
                      </Text>
                      {isMine && (
                        message.isRead ? (
                          <MaterialCommunityIcons name="check-all" size={18} color="#34B7F1" style={{ marginLeft: 1 }} />
                        ) : (
                          message.delivered ? (
                            <MaterialCommunityIcons name="check-all" size={18} color="#bbb" style={{ marginLeft: 1 }} />
                          ) : (
                            <MaterialCommunityIcons name="check" size={18} color="#bbb" style={{ marginLeft: 1 }} />
                          )
                        )
                      )}
                    </View>
                  </View>
                </View>
              );
            })
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

      <ProviderFooter theme={theme} router={router} current="chat" />
    </SafeAreaView>
  );
} 