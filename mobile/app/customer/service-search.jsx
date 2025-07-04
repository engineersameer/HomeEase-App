import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../Color/Color';

export default function ServiceSearch() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [minRating, setMinRating] = useState(0);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  // Results state
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    'All', 'Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 
    'Painting', 'AC Services', 'Appliance Repair', 'Handyman'
  ];

  const locations = [
    'All', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 
    'Faisalabad', 'Multan', 'Peshawar', 'Quetta'
  ];

  const priceRanges = [
    { label: 'Any Price', min: 0, max: 10000 },
    { label: 'Under PKR 500', min: 0, max: 500 },
    { label: 'PKR 500 - 1000', min: 500, max: 1000 },
    { label: 'PKR 1000 - 2000', min: 1000, max: 2000 },
    { label: 'Over PKR 2000', min: 2000, max: 10000 },
  ];

  const ratings = [
    { label: 'Any Rating', value: 0 },
    { label: '4+ Stars', value: 4 },
    { label: '4.5+ Stars', value: 4.5 },
    { label: '5 Stars', value: 5 },
  ];

  useEffect(() => {
    loadThemePreference();
    searchServices();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      setIsDarkMode(savedTheme === 'dark');
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const searchServices = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockServices = [
        {
          id: 1,
          name: 'Ahmed Electrician',
          category: 'Electrical',
          location: 'Karachi',
          rating: 4.8,
          reviews: 127,
          price: 800,
          available: true,
          image: 'https://via.placeholder.com/100',
          description: 'Professional electrician with 5 years experience'
        },
        {
          id: 2,
          name: 'Ali Plumber',
          category: 'Plumbing',
          location: 'Lahore',
          rating: 4.6,
          reviews: 89,
          price: 600,
          available: true,
          image: 'https://via.placeholder.com/100',
          description: 'Expert plumber specializing in residential services'
        },
        {
          id: 3,
          name: 'Hassan Cleaner',
          category: 'Cleaning',
          location: 'Islamabad',
          rating: 4.9,
          reviews: 203,
          price: 400,
          available: false,
          image: 'https://via.placeholder.com/100',
          description: 'Professional cleaning services for homes and offices'
        }
      ];

      // Apply filters
      let filteredServices = mockServices;

      if (selectedCategory !== 'All') {
        filteredServices = filteredServices.filter(service => 
          service.category === selectedCategory
        );
      }

      if (selectedLocation !== 'All') {
        filteredServices = filteredServices.filter(service => 
          service.location === selectedLocation
        );
      }

      if (showAvailableOnly) {
        filteredServices = filteredServices.filter(service => 
          service.available
        );
      }

      filteredServices = filteredServices.filter(service => 
        service.price >= priceRange[0] && service.price <= priceRange[1]
      );

      if (minRating > 0) {
        filteredServices = filteredServices.filter(service => 
          service.rating >= minRating
        );
      }

      if (searchQuery) {
        filteredServices = filteredServices.filter(service => 
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setServices(filteredServices);
      setLoading(false);
    }, 1000);
  };

  const renderServiceCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push({ 
        pathname: '/service-detail', 
        params: { serviceId: item.id } 
      })}
      style={{
        backgroundColor: theme.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: theme.textDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={{ uri: item.image }}
          style={{ width: 60, height: 60, borderRadius: 30, marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: 'bold', 
            color: theme.textDark,
            fontFamily: Fonts.subheading,
            marginBottom: 4
          }}>
            {item.name}
          </Text>
          <Text style={{ 
            color: theme.textLight, 
            fontFamily: Fonts.caption,
            marginBottom: 2
          }}>
            {item.category} • {item.location}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#FFD700', marginRight: 4 }}>⭐</Text>
            <Text style={{ 
              color: theme.textDark, 
              fontFamily: Fonts.body,
              marginRight: 8
            }}>
              {item.rating} ({item.reviews} reviews)
            </Text>
            <Text style={{ 
              color: theme.primary, 
              fontFamily: Fonts.body,
              fontWeight: 'bold'
            }}>
              PKR {item.price}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{
            backgroundColor: item.available ? theme.primary : theme.error,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12
          }}>
            <Text style={{ 
              color: '#fff', 
              fontSize: 12,
              fontFamily: Fonts.caption
            }}>
              {item.available ? 'Available' : 'Busy'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: theme.primary,
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: '#fff',
            fontFamily: Fonts.heading
          }}>
            Search Services
          </Text>
          <TouchableOpacity onPress={toggleTheme}>
            <Text style={{ fontSize: 24, color: '#fff' }}>
              {isDarkMode ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for services..."
            placeholderTextColor={theme.textLight}
            style={{
              flex: 1,
              backgroundColor: theme.card,
              borderRadius: 25,
              paddingHorizontal: 20,
              paddingVertical: 12,
              color: theme.textDark,
              fontFamily: Fonts.body,
              fontSize: 16
            }}
          />
          <TouchableOpacity
            onPress={searchServices}
            style={{
              backgroundColor: theme.accent,
              marginLeft: 10,
              padding: 12,
              borderRadius: 25
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18 }}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Filters */}
        <View style={{ padding: 20 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: theme.textDark,
            fontFamily: Fonts.subheading,
            marginBottom: 15
          }}>
            Filters
          </Text>

          {/* Category Filter */}
          <Text style={{ 
            color: theme.textLight, 
            fontFamily: Fonts.caption,
            marginBottom: 8
          }}>
            Category
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={{
                  backgroundColor: selectedCategory === category ? theme.primary : theme.card,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: theme.border
                }}
              >
                <Text style={{ 
                  color: selectedCategory === category ? '#fff' : theme.textDark,
                  fontFamily: Fonts.body
                }}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Location Filter */}
          <Text style={{ 
            color: theme.textLight, 
            fontFamily: Fonts.caption,
            marginBottom: 8
          }}>
            Location
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
            {locations.map((location) => (
              <TouchableOpacity
                key={location}
                onPress={() => setSelectedLocation(location)}
                style={{
                  backgroundColor: selectedLocation === location ? theme.accent : theme.card,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: theme.border
                }}
              >
                <Text style={{ 
                  color: selectedLocation === location ? '#fff' : theme.textDark,
                  fontFamily: Fonts.body
                }}>
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Price Range */}
          <Text style={{ 
            color: theme.textLight, 
            fontFamily: Fonts.caption,
            marginBottom: 8
          }}>
            Price Range
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
            {priceRanges.map((range) => (
              <TouchableOpacity
                key={range.label}
                onPress={() => setPriceRange([range.min, range.max])}
                style={{
                  backgroundColor: priceRange[0] === range.min ? theme.primary : theme.card,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: theme.border
                }}
              >
                <Text style={{ 
                  color: priceRange[0] === range.min ? '#fff' : theme.textDark,
                  fontFamily: Fonts.body
                }}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Rating Filter */}
          <Text style={{ 
            color: theme.textLight, 
            fontFamily: Fonts.caption,
            marginBottom: 8
          }}>
            Minimum Rating
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
            {ratings.map((rating) => (
              <TouchableOpacity
                key={rating.label}
                onPress={() => setMinRating(rating.value)}
                style={{
                  backgroundColor: minRating === rating.value ? theme.primary : theme.card,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: theme.border
                }}
              >
                <Text style={{ 
                  color: minRating === rating.value ? '#fff' : theme.textDark,
                  fontFamily: Fonts.body
                }}>
                  {rating.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Available Only Toggle */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: theme.card,
            padding: 15,
            borderRadius: 12,
            marginBottom: 20
          }}>
            <Text style={{ 
              color: theme.textDark, 
              fontFamily: Fonts.body
            }}>
              Show Available Only
            </Text>
            <Switch
              value={showAvailableOnly}
              onValueChange={setShowAvailableOnly}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={showAvailableOnly ? '#fff' : theme.textLight}
            />
          </View>

          {/* Apply Filters Button */}
          <TouchableOpacity
            onPress={searchServices}
            style={{
              backgroundColor: theme.accent,
              paddingVertical: 15,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 20
            }}
          >
            <Text style={{ 
              color: '#fff', 
              fontFamily: Fonts.body,
              fontWeight: '600'
            }}>
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: theme.textDark,
            fontFamily: Fonts.subheading,
            marginBottom: 15
          }}>
            Results ({services.length})
          </Text>

          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ color: theme.textLight, fontFamily: Fonts.body }}>
                Searching...
              </Text>
            </View>
          ) : services.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ color: theme.textLight, fontFamily: Fonts.body }}>
                No services found matching your criteria
              </Text>
            </View>
          ) : (
            <FlatList
              data={services}
              renderItem={renderServiceCard}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
} 