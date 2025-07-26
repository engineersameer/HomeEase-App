import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
  RefreshControl
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';
import { getApiUrl, getApiUrlWithParams, apiCall, API_CONFIG, API_BASE_URL } from '../../config/api';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import ServiceDetail from './shared/service-detail';
import Footer from './shared/Footer';

export default function ServiceSearch() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingCities, setLoadingCities] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Only show search results after a search has been performed
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadUserData();
    fetchCategories();
    fetchCities();
    // searchServices(); // Remove this to prevent default search
  }, []);

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

  const searchServices = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.query = searchQuery;
      if (selectedCategory && selectedCategory !== '' && selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedLocation && selectedLocation !== '' && selectedLocation !== 'All') params.city = selectedLocation;

      const url = getApiUrlWithParams(API_CONFIG.ENDPOINTS.CUSTOMER_SERVICE_SEARCH, params);
      console.log('Service search URL:', url);
      const data = await apiCall(url); 
      console.log('Service search API response:', data);
      setSearchResults(data.services || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to search services');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.CUSTOMER_CATEGORIES));
      setCategories(data.categories || []);
    } catch (error) {
      console.log('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchCities = async () => {
    setLoadingCities(true);
    try {
      const data = await apiCall(getApiUrl('/api/customer/services/cities'));
      console.log('Fetched cities:', data); // Debug log
      // Support both array of strings and array of objects
      let cityList = [];
      if (Array.isArray(data.cities)) {
        if (typeof data.cities[0] === 'string') {
          cityList = data.cities;
        } else if (typeof data.cities[0] === 'object' && data.cities[0] !== null) {
          cityList = data.cities.map(city => city.cityName || city.name || '');
        }
      }
      setCities(cityList.filter(Boolean));
    } catch (error) {
      console.log('Error fetching cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      searchServices(),
      fetchCategories(),
      fetchCities()
    ]);
    setRefreshing(false);
  };

  const handleBookService = (service) => {
    router.push({
      pathname: '/customer/service-booking',
      params: { serviceId: service._id }
    });
  };

  const handleChatWithProvider = async (service) => {
    try {
      // Get token
      const token = await AsyncStorage.getItem('token');
      console.log('Service object:', service);
      console.log('Sending chat request:', { providerId: service.provider?._id, serviceId: service._id });
      // Call backend to find or create chat
      const res = await fetch(`${API_BASE_URL}/api/customer/chats`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: service.provider?._id, serviceId: service._id })
      });
      console.log('Chat response status:', res.status);
      const data = await res.json();
      console.log('Chat response data:', data);
      if (data.success && data.chat) {
        router.push({ pathname: '/customer/customer-chat', params: { chatId: data.chat._id } });
      } else {
        Alert.alert('Error', data.message || 'Failed to start chat');
      }
    } catch (err) {
      console.log('Chat request error:', err);
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLocation('');
    searchServices();
  };

  const formatCurrency = (amount) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const canApplyFilters = selectedCategory && selectedLocation;

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
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color={theme.textDark} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
            Find Services
          </Text>
        </View>

        {/* Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.background,
            borderRadius: 12,
            paddingHorizontal: 12,
            marginRight: 8
          }}>
            <Ionicons name="search" size={20} color={theme.textLight} />
            <TextInput
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 8,
                color: theme.textDark,
                fontFamily: Fonts.body,
                fontSize: 14
              }}
              placeholder="Search for services..."
              placeholderTextColor={theme.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={searchServices}
            />
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: theme.primary,
              padding: 12,
              borderRadius: 12
            }}
            onPress={searchServices}
          >
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Filter Toggle */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 12,
            paddingVertical: 8
          }}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={16} color={theme.textDark} />
          <Text style={{ marginLeft: 6, color: theme.textDark, fontFamily: Fonts.body }}>
            Filters
          </Text>
          <Ionicons 
            name={showFilters ? "chevron-up" : "chevron-down"} 
            size={16} 
            color={theme.textDark} 
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={{
          backgroundColor: theme.card,
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.border
        }}>
          {/* Categories */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading, marginBottom: 8 }}>
              Category
            </Text>
            {loadingCategories ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={{
                    backgroundColor: !selectedCategory || selectedCategory === 'All' ? theme.primary : theme.card,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: theme.border
                  }}
                  onPress={() => setSelectedCategory('All')}
                >
                  <Text style={{
                    color: !selectedCategory || selectedCategory === 'All' ? '#fff' : theme.textDark,
                    fontFamily: Fonts.body,
                    fontSize: 12
                  }}>
                    All
                  </Text>
                </TouchableOpacity>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={{
                      backgroundColor: selectedCategory === category ? theme.primary : theme.card,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      marginRight: 8,
                      borderWidth: 1,
                      borderColor: theme.border
                    }}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={{
                      color: selectedCategory === category ? '#fff' : theme.textDark,
                      fontFamily: Fonts.body,
                      fontSize: 12
                    }}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Location */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading, marginBottom: 8 }}>
              Location
            </Text>
            {loadingCities ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : cities.length === 0 ? (
              <Text style={{ color: theme.textLight, fontFamily: Fonts.body, fontSize: 13, paddingVertical: 8 }}>
                No cities found. Please check back later.
              </Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {/* 'All' option at the top */}
                <TouchableOpacity
                  key="all-locations"
                  style={{
                    backgroundColor: selectedLocation === '' || selectedLocation === 'All' ? theme.primary : theme.card,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: theme.border
                  }}
                  onPress={() => setSelectedLocation('')}
                >
                  <Text style={{
                    color: selectedLocation === '' || selectedLocation === 'All' ? '#fff' : theme.textDark,
                    fontFamily: Fonts.body,
                    fontSize: 12
                  }}>
                    All
                  </Text>
                </TouchableOpacity>
                {cities.map((city, idx) => (
                  <TouchableOpacity
                    key={city + idx}
                    style={{
                      backgroundColor: selectedLocation === city ? theme.primary : theme.card,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      marginRight: 8,
                      borderWidth: 1,
                      borderColor: theme.border
                    }}
                    onPress={() => setSelectedLocation(city)}
                  >
                    <Text style={{
                      color: selectedLocation === city ? '#fff' : theme.textDark,
                      fontFamily: Fonts.body,
                      fontSize: 12
                    }}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Filter Actions */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: canApplyFilters ? theme.primary : theme.card,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                opacity: canApplyFilters ? 1 : 0.5
              }}
              onPress={canApplyFilters ? searchServices : undefined}
              disabled={!canApplyFilters}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontFamily: Fonts.body }}>
                Apply Filters
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: theme.card,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.border
              }}
              onPress={clearFilters}
            >
              <Text style={{ color: theme.textDark, fontWeight: 'bold', fontFamily: Fonts.body }}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search Results */}
        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ marginTop: 16, color: theme.textDark, fontFamily: Fonts.body }}>
              Searching for services...
            </Text>
          </View>
        ) : !hasSearched ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="search-outline" size={48} color={theme.textLight} />
            <Text style={{ color: theme.textLight, fontFamily: Fonts.body, marginTop: 12, textAlign: 'center' }}>
              Search for services to get started.
            </Text>
          </View>
        ) : searchResults.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="search-outline" size={48} color={theme.textLight} />
            <Text style={{ color: theme.textLight, fontFamily: Fonts.body, marginTop: 12, textAlign: 'center' }}>
              No services found for this category and location.
            </Text>
            {(searchQuery || selectedCategory || selectedLocation) ? (
              <TouchableOpacity
                style={{
                  backgroundColor: theme.primary,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginTop: 16
                }}
                onPress={clearFilters}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontFamily: Fonts.body }}>
                  Clear Filters
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <>
            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading, marginBottom: 16 }}>
              {searchResults.length} service{searchResults.length !== 1 ? 's' : ''} found
            </Text>
            {searchResults.map((service) => (
              <ServiceDetail
                key={service._id}
                service={service}
                onBook={handleBookService}
                onChat={handleChatWithProvider}
              />
            ))}
          </>
        )}
      </ScrollView>

      <Footer theme={theme} router={router} current="search" />
    </SafeAreaView>
  );
} 