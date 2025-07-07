import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { Fonts } from '../../../Color/Color';
import { Ionicons } from '@expo/vector-icons';

export default function ServiceDetail({ service, onBook, onChat }) {
  const { theme } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);

  const formatCurrency = (amount) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#F59E0B" : "#D1D5DB"}
        />
      );
    }
    return stars;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* Service Header */}
      <View style={styles.header}>
        <View style={styles.providerInfo}>
          <Image
            source={{ uri: service.provider?.image || 'https://via.placeholder.com/60' }}
            style={styles.providerImage}
          />
          <View style={styles.providerDetails}>
            <Text style={[styles.providerName, { color: theme.textDark }]}>
              {service.provider?.name || 'Service Provider'}
            </Text>
            <View style={styles.ratingContainer}>
              {getRatingStars(service.rating || 0)}
              <Text style={[styles.ratingText, { color: theme.textLight }]}>
                {service.rating || 0} ({service.reviewCount || 0} reviews)
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#EF4444" : theme.textLight}
          />
        </TouchableOpacity>
      </View>

      {/* Service Details */}
      <View style={styles.serviceDetails}>
        <Text style={[styles.serviceTitle, { color: theme.textDark }]}>
          {service.title}
        </Text>
        <Text style={[styles.serviceCategory, { color: theme.primary }]}>
          {service.category}
        </Text>
        <Text style={[styles.serviceDescription, { color: theme.textDark }]}>
          {service.description}
        </Text>
        
        {/* Service Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Ionicons name="location" size={16} color={theme.textLight} />
            <Text style={[styles.featureText, { color: theme.textLight }]}>
              {service.location}
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="time" size={16} color={theme.textLight} />
            <Text style={[styles.featureText, { color: theme.textLight }]}>
              {service.availability ? 'Available' : 'Not Available'}
            </Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={[styles.priceLabel, { color: theme.textLight }]}>Price:</Text>
          <Text style={[styles.price, { color: theme.primary }]}>
            {formatCurrency(service.price)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.chatButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => onChat && onChat(service)}
        >
          <Ionicons name="chatbubble-outline" size={20} color={theme.textDark} />
          <Text style={[styles.buttonText, { color: theme.textDark }]}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: theme.primary }]}
          onPress={() => onBook && onBook(service)}
        >
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={[styles.buttonText, { color: '#fff' }]}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  providerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.subheading,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontFamily: Fonts.caption,
    marginLeft: 4,
  },
  favoriteButton: {
    padding: 8,
  },
  serviceDetails: {
    marginBottom: 20,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Fonts.heading,
    marginBottom: 8,
  },
  serviceCategory: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.subheading,
    marginBottom: 12,
  },
  serviceDescription: {
    fontSize: 14,
    fontFamily: Fonts.body,
    lineHeight: 20,
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    fontFamily: Fonts.caption,
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: Fonts.body,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Fonts.heading,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  bookButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.body,
    marginLeft: 6,
  },
}); 