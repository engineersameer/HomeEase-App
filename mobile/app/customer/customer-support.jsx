import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../Color/Color';
import Footer from '../shared/Footer';
import { useTheme } from '../../context/ThemeContext';

export default function CustomerSupport() {
  const router = useRouter();
  const { theme } = useTheme();

  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'How do I book a service?',
      answer: 'To book a service, go to "Search Services" from the home screen, select your desired service category, choose a provider, and follow the booking process. You can also specify your requirements and preferred time.'
    },
    {
      id: 2,
      question: 'How do I cancel a booking?',
      answer: 'You can cancel a booking from the "My Bookings" section. Select the booking you want to cancel and tap the "Cancel" button. Note that cancellation policies may vary by provider.'
    },
    {
      id: 3,
      question: 'How do I pay for services?',
      answer: 'We support multiple payment methods including cash on delivery, bank transfer, and digital wallets. Payment options will be shown during the booking process.'
    },
    {
      id: 4,
      question: 'What if I\'m not satisfied with the service?',
      answer: 'If you\'re not satisfied with the service, please contact our support team immediately. We have a satisfaction guarantee and will work to resolve any issues.'
    },
    {
      id: 5,
      question: 'How do I rate and review a service?',
      answer: 'After a service is completed, you can rate and review the provider from the "My Bookings" section. Select the completed booking and tap "Review" to share your experience.'
    },
    {
      id: 6,
      question: 'Are the service providers verified?',
      answer: 'Yes, all service providers on our platform are thoroughly verified. We check their credentials, experience, and conduct background checks to ensure quality and reliability.'
    }
  ];

  const supportOptions = [
    {
      title: 'Live Chat',
      icon: '💬',
      description: 'Chat with our support team',
      action: () => Alert.alert('Live Chat', 'Live chat feature coming soon!')
    },
    {
      title: 'Call Support',
      icon: '📞',
      description: 'Call our support hotline',
      action: () => Linking.openURL('tel:+923001234567')
    },
    {
      title: 'Email Support',
      icon: '📧',
      description: 'Send us an email',
      action: () => Linking.openURL('mailto:support@homeease.com')
    },
    {
      title: 'WhatsApp',
      icon: '📱',
      description: 'Message us on WhatsApp',
      action: () => Linking.openURL('whatsapp://send?phone=923001234567&text=Hello, I need help with HomeEase')
    }
  ];

  const helpResources = [
    {
      title: 'User Guide',
      icon: '📖',
      description: 'Learn how to use the app',
      action: () => Alert.alert('User Guide', 'User guide will be available soon!')
    },
    {
      title: 'Privacy Policy',
      icon: '🔒',
      description: 'Read our privacy policy',
      action: () => Alert.alert('Privacy Policy', 'Privacy policy will be available soon!')
    },
    {
      title: 'Terms of Service',
      icon: '📋',
      description: 'Read our terms of service',
      action: () => Alert.alert('Terms of Service', 'Terms of service will be available soon!')
    },
    {
      title: 'Report Issue',
      icon: '⚠️',
      description: 'Report a bug or issue',
      action: () => Alert.alert('Report Issue', 'Issue reporting feature coming soon!')
    }
  ];

  const renderFAQ = (faq) => (
    <View key={faq.id} style={{
      backgroundColor: theme.card,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden'
    }}>
      <TouchableOpacity
        onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
        style={{
          padding: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Text style={{
          flex: 1,
          fontSize: 14,
          fontWeight: '600',
          color: theme.textDark,
          fontFamily: Fonts.subheading
        }}>
          {faq.question}
        </Text>
        <Text style={{
          fontSize: 16,
          color: theme.primary,
          transform: [{ rotate: expandedFAQ === faq.id ? '180deg' : '0deg' }]
        }}>
          ▼
        </Text>
      </TouchableOpacity>
      
      {expandedFAQ === faq.id && (
        <View style={{
          paddingHorizontal: 16,
          paddingBottom: 16,
          borderTopWidth: 1,
          borderTopColor: theme.border
        }}>
          <Text style={{
            fontSize: 13,
            color: theme.textLight,
            lineHeight: 20,
            fontFamily: Fonts.body
          }}>
            {faq.answer}
          </Text>
        </View>
      )}
    </View>
  );

  const renderSupportOption = (option) => (
    <TouchableOpacity
      key={option.title}
      onPress={option.action}
      style={{
        backgroundColor: theme.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: theme.textDark,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, marginRight: 12 }}>{option.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.textDark,
            fontFamily: Fonts.subheading
          }}>
            {option.title}
          </Text>
          <Text style={{
            fontSize: 13,
            color: theme.textLight,
            fontFamily: Fonts.body
          }}>
            {option.description}
          </Text>
        </View>
        <Text style={{ color: theme.primary, fontSize: 16 }}>→</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHelpResource = (resource) => (
    <TouchableOpacity
      key={resource.title}
      onPress={resource.action}
      style={{
        backgroundColor: theme.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: theme.textDark,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, marginRight: 12 }}>{resource.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.textDark,
            fontFamily: Fonts.subheading
          }}>
            {resource.title}
          </Text>
          <Text style={{
            fontSize: 13,
            color: theme.textLight,
            fontFamily: Fonts.body
          }}>
            {resource.description}
          </Text>
        </View>
        <Text style={{ color: theme.primary, fontSize: 16 }}>→</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 20
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.textDark,
            fontFamily: Fonts.heading
          }}>
            Support & Help
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 24, color: theme.textDark }}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Contact Support */}
        <View style={{ marginTop: 20, marginBottom: 24 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.textDark,
            marginBottom: 12,
            fontFamily: Fonts.heading
          }}>
            Contact Support
          </Text>
          {supportOptions.map(renderSupportOption)}
        </View>

        {/* Help Resources */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.textDark,
            marginBottom: 12,
            fontFamily: Fonts.heading
          }}>
            Help Resources
          </Text>
          {helpResources.map(renderHelpResource)}
        </View>

        {/* FAQ */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.textDark,
            marginBottom: 12,
            fontFamily: Fonts.heading
          }}>
            Frequently Asked Questions
          </Text>
          {faqs.map(renderFAQ)}
        </View>

        {/* App Info */}
        <View style={{
          backgroundColor: theme.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: theme.border
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.textDark,
            marginBottom: 8,
            fontFamily: Fonts.subheading
          }}>
            App Information
          </Text>
          <Text style={{
            fontSize: 13,
            color: theme.textLight,
            fontFamily: Fonts.body,
            marginBottom: 4
          }}>
            Version: 1.0.0
          </Text>
          <Text style={{
            fontSize: 13,
            color: theme.textLight,
            fontFamily: Fonts.body,
            marginBottom: 4
          }}>
            Build: 2024.1.1
          </Text>
          <Text style={{
            fontSize: 13,
            color: theme.textLight,
            fontFamily: Fonts.body
          }}>
            © 2024 HomeEase. All rights reserved.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
      <Footer theme={theme} router={router} current="home" />
    </View>
  );
} 