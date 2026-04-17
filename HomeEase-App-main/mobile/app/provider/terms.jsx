import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../Color/Color';
import ProviderFooter from './shared/Footer';

export default function ProviderTerms() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
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
          Terms & Conditions
        </Text>
      </View>
      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        <View style={{ marginTop: 24, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textDark, marginBottom: 12, fontFamily: Fonts.heading }}>
            Provider Terms and Conditions
          </Text>
          <Text style={{ fontSize: 14, color: theme.textLight, marginBottom: 18, fontFamily: Fonts.body }}>
            Please read these terms and conditions carefully before offering your services on HomeEase. By registering as a provider, you agree to abide by the following terms:
          </Text>

          {/* Section 1: Service Obligations */}
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.textDark, marginBottom: 6, fontFamily: Fonts.subheading }}>
            1. Service Obligations
          </Text>
          <Text style={{ fontSize: 14, color: theme.textLight, marginBottom: 14, fontFamily: Fonts.body }}>
            - You must provide accurate information about your skills, experience, and qualifications.
            {'\n'}- You agree to deliver services professionally, on time, and as described in your profile.
            {'\n'}- You are responsible for maintaining the quality and safety of your services.
          </Text>

          {/* Section 2: Bookings & Cancellations */}
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.textDark, marginBottom: 6, fontFamily: Fonts.subheading }}>
            2. Bookings & Cancellations
          </Text>
          <Text style={{ fontSize: 14, color: theme.textLight, marginBottom: 14, fontFamily: Fonts.body }}>
            - Accept or decline bookings promptly. Repeated cancellations may result in suspension.
            {'\n'}- Notify customers and HomeEase support in case of unavoidable delays or issues.
          </Text>

          {/* Section 3: Payments & Fees */}
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.textDark, marginBottom: 6, fontFamily: Fonts.subheading }}>
            3. Payments & Fees
          </Text>
          <Text style={{ fontSize: 14, color: theme.textLight, marginBottom: 14, fontFamily: Fonts.body }}>
            - All payments must be processed through the HomeEase platform.
            {'\n'}- Platform fees and payout schedules are subject to change. Check your dashboard for updates.
            {'\n'}- You are responsible for any taxes or legal obligations related to your earnings.
          </Text>

          {/* Section 4: Conduct & Communication */}
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.textDark, marginBottom: 6, fontFamily: Fonts.subheading }}>
            4. Conduct & Communication
          </Text>
          <Text style={{ fontSize: 14, color: theme.textLight, marginBottom: 14, fontFamily: Fonts.body }}>
            - Treat all customers with respect and courtesy.
            {'\n'}- Do not share personal contact details outside the platform.
            {'\n'}- Abusive, fraudulent, or illegal behavior will result in immediate removal.
          </Text>

          {/* Section 5: Legal & Platform Policies */}
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.textDark, marginBottom: 6, fontFamily: Fonts.subheading }}>
            5. Legal & Platform Policies
          </Text>
          <Text style={{ fontSize: 14, color: theme.textLight, marginBottom: 14, fontFamily: Fonts.body }}>
            - You must comply with all applicable laws and HomeEase policies.
            {'\n'}- HomeEase reserves the right to update these terms at any time. Continued use constitutes acceptance.
          </Text>

          {/* Section 6: Support & Disputes */}
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.textDark, marginBottom: 6, fontFamily: Fonts.subheading }}>
            6. Support & Disputes
          </Text>
          <Text style={{ fontSize: 14, color: theme.textLight, marginBottom: 14, fontFamily: Fonts.body }}>
            - For questions or disputes, contact HomeEase support through the app.
            {'\n'}- We aim to resolve all issues fairly and promptly.
          </Text>
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
      <ProviderFooter theme={theme} router={router} current={''} hideOptions={true} />
    </SafeAreaView>
  );
} 