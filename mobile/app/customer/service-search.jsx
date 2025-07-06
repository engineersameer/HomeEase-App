import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts } from '../../Color/Color';
import FloatingInput from '../customer/shared/FloatingInput';
import { useTheme } from '../../context/ThemeContext';

export default function ServiceSearch() {
  const router = useRouter();
  const { theme } = useTheme();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');

  const categories = [
    'All', 'Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 
    'Painting', 'AC Services', 'Appliance Repair', 'Handyman'
  ];

  const locations = [
    'All', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 
    'Faisalabad', 'Multan', 'Peshawar', 'Quetta'
  ];

  // Mock services for demo
  const services = [
    {
      id: 1,
      name: 'Ahmed Electrician',
      category: 'Electrical',
      location: 'Karachi',
      rating: 4.8,
      price: 800,
      image: 'https://via.placeholder.com/100',
      description: 'Professional electrician with 5 years experience'
    },
    {
      id: 2,
      name: 'Ali Plumber',
      category: 'Plumbing',
      location: 'Lahore',
      rating: 4.6,
      price: 600,
      image: 'https://via.placeholder.com/100',
      description: 'Expert plumber specializing in residential services'
    },
    {
      id: 3,
      name: 'Hassan Cleaner',
      category: 'Cleaning',
      location: 'Islamabad',
      rating: 4.9,
      price: 400,
      image: 'https://via.placeholder.com/100',
      description: 'Professional cleaning services for homes and offices'
    }
  ];

  // Filtered services
  const filteredServices = services.filter(service => {
    return (
      (selectedCategory === 'All' || service.category === selectedCategory) &&
      (selectedLocation === 'All' || service.location === selectedLocation) &&
      (searchQuery === '' ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Consistent Header */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 51,
        
        paddingBottom: 24,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 22, color: theme.textDark }}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textDark, fontFamily: Fonts.heading }}>
          Search Services
        </Text>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 24 }}>
          {/* Aesthetic Floating Search Input */}
          <FloatingInput
            label="Search by service or provider..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ marginBottom: 24 }}
          />
          {/* Aesthetic Filters Section */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, color: theme.textLight, fontFamily: Fonts.body, marginBottom: 8 }}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 18,
                    borderRadius: 20,
                    backgroundColor: selectedCategory === cat ? theme.primary : theme.card,
                    borderWidth: 1,
                    borderColor: selectedCategory === cat ? theme.primary : theme.border,
                    marginRight: 10,
                  }}
                >
                  <Text style={{ color: selectedCategory === cat ? '#fff' : theme.textDark, fontSize: 14, fontFamily: Fonts.body }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={{ fontSize: 14, color: theme.textLight, fontFamily: Fonts.body, marginBottom: 8 }}>Location</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {locations.map(loc => (
                <TouchableOpacity
                  key={loc}
                  onPress={() => setSelectedLocation(loc)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 18,
                    borderRadius: 20,
                    backgroundColor: selectedLocation === loc ? theme.primary : theme.card,
                    borderWidth: 1,
                    borderColor: selectedLocation === loc ? theme.primary : theme.border,
                    marginRight: 10,
                  }}
                >
                  <Text style={{ color: selectedLocation === loc ? '#fff' : theme.textDark, fontSize: 14, fontFamily: Fonts.body }}>
                    {loc}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {/* Minimalist Service List */}
          <View style={{ marginTop: 8 }}>
            {filteredServices.length === 0 ? (
              <Text style={{ color: theme.textLight, fontFamily: Fonts.body, textAlign: 'center', marginTop: 40 }}>
                No services found.
              </Text>
            ) : (
              filteredServices.map(service => (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => router.push({ pathname: '/service-detail', params: { serviceId: service.id } })}
                  style={{
                    borderBottomWidth: 1,
                    borderColor: theme.border,
                    paddingVertical: 18,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                  }}
                >
                  <Image
                    source={{ uri: service.image }}
                    style={{ width: 54, height: 54, borderRadius: 27, marginRight: 16, backgroundColor: theme.card }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textDark, fontFamily: Fonts.subheading }}>
                      {service.name}
                    </Text>
                    <Text style={{ fontSize: 13, color: theme.textLight, fontFamily: Fonts.body, marginBottom: 2 }}>
                      {service.category} • {service.location}
                    </Text>
                    <Text style={{ fontSize: 13, color: theme.textLight, fontFamily: Fonts.body }}>
                      {service.description}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', minWidth: 60 }}>
                    <Text style={{ fontSize: 15, color: theme.primary, fontWeight: 'bold', fontFamily: Fonts.body }}>
                      PKR {service.price}
                    </Text>
                    <Text style={{ fontSize: 13, color: theme.textLight, fontFamily: Fonts.body }}>
                      ⭐ {service.rating}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
            <View style={{ height: 40 }} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 