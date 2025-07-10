import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../Color/Color';
import { useTheme } from '../../context/ThemeContext';
import { getApiUrl, apiCall, API_CONFIG } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';
import { Animated } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function AdminContent() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    type: 'announcement',
    priority: 'medium'
  });

  // Filtered content for current type
  const filteredContent = content.filter(item => selectedType === 'all' || item.type === selectedType);

  // Animations for filtered content
  const fadeAnims = useMemo(() => filteredContent.map(() => new Animated.Value(0)), [filteredContent.length]);
  const slideAnims = useMemo(() => filteredContent.map(() => new Animated.Value(20)), [filteredContent.length]);

  useEffect(() => {
    fetchContent();
    filteredContent.forEach((_, idx) => {
      Animated.parallel([
        Animated.timing(fadeAnims[idx], {
          toValue: 1,
          duration: 400,
          delay: idx * 60,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnims[idx], {
          toValue: 0,
          duration: 400,
          delay: idx * 60,
          useNativeDriver: true,
        })
      ]).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredContent.length]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const result = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_CONTENT));
      console.log('fetchContent API result:', result);
      if (result.success) {
        setContent(result.content || []);
        console.log('Content fetched:', result.content?.length || 0);
      } else {
        console.log('Failed to fetch content:', result.message);
        setContent([]);
      }
    } catch (error) {
      console.log('Error fetching content:', error);
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async () => {
    if (!newContent.title.trim() || !newContent.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const result = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_CONTENT), {
        method: 'POST',
        body: JSON.stringify({
          ...newContent,
          content: newContent.description
        })
      });
      
      if (result.success) {
        Alert.alert('Success', 'Content created successfully');
        setNewContent({ title: '', description: '', type: 'announcement', priority: 'medium' });
        setShowCreateForm(false);
        fetchContent();
      } else {
        Alert.alert('Error', result.message || 'Failed to create content');
      }
    } catch (error) {
      console.error('Create content error:', error);
      Alert.alert('Error', 'Failed to create content');
    }
  };

  const handlePublishContent = async (contentId) => {
    try {
      const result = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_CONTENT_PUBLISH.replace(':contentId', contentId)), {
        method: 'PATCH'
      });
      
      if (result.success) {
        Alert.alert('Success', 'Content published successfully');
        fetchContent();
      } else {
        Alert.alert('Error', result.message || 'Failed to publish content');
      }
    } catch (error) {
      console.error('Publish content error:', error);
      Alert.alert('Error', 'Failed to publish content');
    }
  };

  const handleDeleteContent = (contentId, title) => {
    Alert.alert(
      'Delete Content',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_CONTENT.replace(':id', contentId)), {
                method: 'DELETE'
              });
              
              if (result.success) {
                Alert.alert('Success', 'Content deleted successfully');
                fetchContent();
              } else {
                Alert.alert('Error', result.message || 'Failed to delete content');
              }
            } catch (error) {
              console.error('Delete content error:', error);
              Alert.alert('Error', 'Failed to delete content');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return '#10B981';
      case 'draft':
        return '#F59E0B';
      case 'archived':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'announcement':
        return '#EF4444';
      case 'update':
        return '#3B82F6';
      case 'maintenance':
        return '#F59E0B';
      case 'news':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'announcement':
        return '📢';
      case 'update':
        return '🔄';
      case 'maintenance':
        return '🔧';
      case 'news':
        return '📰';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ 
            marginTop: 16, 
            color: theme.textDark, 
            fontFamily: Fonts.body,
            fontSize: 16
          }}>
            Loading content...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 50,
        paddingBottom: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8, padding: 6 }}>
          <Ionicons name="arrow-back" size={26} color={theme.textDark} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 22,
          fontWeight: 'bold',
          color: theme.textDark,
          fontFamily: Fonts.heading,
          flex: 1,
          textAlign: 'center',
        }}>
          Content
        </Text>
        <TouchableOpacity onPress={() => setShowCreateForm(true)} style={{ padding: 6 }}>
          <Ionicons name="add" size={26} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Create Content Modal Dialog */}
      <Modal visible={showCreateForm} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.12)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.card, borderRadius: 18, paddingVertical: 32, paddingHorizontal: 24, width: '92%', maxWidth: 420, alignItems: 'center', borderWidth: 0, elevation: 0 }}>
            <Text style={{ fontSize: 19, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading, marginBottom: 22, letterSpacing: 0.2 }}>Create New Content</Text>
            <TextInput
              style={{
                backgroundColor: theme.background,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: theme.border,
                color: theme.textDark,
                fontFamily: Fonts.body,
                fontSize: 15,
                width: '100%',
              }}
              placeholder="Content title..."
              placeholderTextColor={theme.textLight}
              value={newContent.title}
              onChangeText={(text) => setNewContent({...newContent, title: text})}
            />
            <TextInput
              style={{
                backgroundColor: theme.background,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: theme.border,
                color: theme.textDark,
                fontFamily: Fonts.body,
                fontSize: 15,
                minHeight: 80,
                textAlignVertical: 'top',
                width: '100%',
              }}
              placeholder="Content description..."
              placeholderTextColor={theme.textLight}
              value={newContent.description}
              onChangeText={(text) => setNewContent({...newContent, description: text})}
              multiline
            />
            {/* Type Dropdown */}
            <View style={{ width: '100%', marginBottom: 18, borderRadius: 14, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.background, overflow: 'hidden' }}>
              <Picker
                selectedValue={newContent.type}
                onValueChange={value => setNewContent({ ...newContent, type: value })}
                style={{ color: theme.textDark, fontFamily: Fonts.body, fontSize: 15, width: '100%' }}
                dropdownIconColor={theme.textLight}
                mode={Platform.OS === 'ios' ? 'dialog' : 'dropdown'}
              >
                <Picker.Item label="Select type..." value="" color={theme.textLight} />
                <Picker.Item label="Announcement" value="announcement" />
                <Picker.Item label="Update" value="update" />
                <Picker.Item label="Maintenance" value="maintenance" />
                <Picker.Item label="News" value="news" />
              </Picker>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginTop: 6 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.primary,
                  borderRadius: 22,
                  paddingVertical: 11,
                  flex: 1,
                  alignItems: 'center',
                }}
                onPress={handleCreateContent}
              >
                <Text style={{ color: '#fff', fontFamily: Fonts.body, fontSize: 15, fontWeight: '600', letterSpacing: 0.1 }}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.background,
                  borderRadius: 22,
                  paddingVertical: 11,
                  flex: 1,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
                onPress={() => setShowCreateForm(false)}
              >
                <Text style={{ color: theme.textDark, fontFamily: Fonts.body, fontSize: 15, fontWeight: '600', letterSpacing: 0.1 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 24 }}>
          {/* Type Filter */}
          <View style={{ marginBottom: 18 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {[
                { key: 'all', label: `All (${content.length})` },
                { key: 'announcement', label: `Announcements (${content.filter(c => c.type === 'announcement').length})` },
                { key: 'update', label: `Updates (${content.filter(c => c.type === 'update').length})` },
                { key: 'maintenance', label: `Maintenance (${content.filter(c => c.type === 'maintenance').length})` },
              ].map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={{
                    backgroundColor: selectedType === item.key ? theme.primary : theme.card,
                    borderRadius: 20,
                    paddingHorizontal: 18,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: selectedType === item.key ? theme.primary : theme.border,
                    minWidth: 80,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => setSelectedType(item.key)}
                >
                  <Text style={{
                    color: selectedType === item.key ? '#fff' : theme.textDark,
                    fontFamily: Fonts.body,
                    fontSize: 14,
                    fontWeight: '600',
                  }}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Section Heading */}
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.textDark,
            fontFamily: Fonts.subheading,
            marginBottom: 12
          }}>
            Content ({filteredContent.length})
          </Text>

          {console.log('DEBUG filteredContent:', filteredContent)}

          {/* Content List */}
          {filteredContent.map((item, idx) => (
            <Animated.View
              key={item._id}
              style={{
                opacity: fadeAnims[idx],
                transform: [{ translateY: slideAnims[idx] }],
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 8,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                  shadowColor: 'transparent',
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: theme.textDark,
                  fontFamily: Fonts.heading,
                  marginBottom: 4,
                }}>{item.title}</Text>
                <Text style={{
                  fontSize: 14,
                  color: theme.text,
                  fontFamily: Fonts.body,
                  lineHeight: 20,
                }}>{item.description || item.content}</Text>
              </View>
            </Animated.View>
          ))}
          {filteredContent.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{
                fontSize: 16,
                color: theme.textLight,
                fontFamily: Fonts.body,
              }}>
                No content found
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 