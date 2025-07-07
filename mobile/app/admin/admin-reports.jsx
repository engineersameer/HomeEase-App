import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  TextInput,
  Modal,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../Color/Color';
import { useTheme } from '../../context/ThemeContext';
import { getApiUrl, apiCall, API_CONFIG } from '../../config/api';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function AdminReports() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState('revenue_analytics');
  const [groupBy, setGroupBy] = useState('month');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [focusField, setFocusField] = useState('');
  const startAnim = useRef(new Animated.Value(0)).current;
  const endAnim = useRef(new Animated.Value(0)).current;
  const descAnim = useRef(new Animated.Value(0)).current;
  const [exportFormat, setExportFormat] = useState('json');
  const [exportingId, setExportingId] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const result = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_REPORTS));
      if (result.success) setReports(result.reports || []);
      else setReports([]);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const body = {
        title: reportTitle,
        type: reportType,
        description,
        groupBy
      };
      const res = await apiCall(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_REPORTS), {
        method: 'POST',
        body: JSON.stringify(body)
      });
      res.success ? fetchReports() : Alert.alert('Error', res.message);
    } catch {
      Alert.alert('Error', 'Generation failed');
    }
  };

  const handleExportReport = async (id) => {
    setExportingId(id);
    // Only PDF export is allowed now
    await downloadReport(id);
  };

  const downloadReport = async (id) => {
    try {
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_REPORTS_EXPORT.replace(':reportId', id))}?format=pdf`;
      const token = await AsyncStorage.getItem('token');
      const fileUri = FileSystem.documentDirectory + `report_${id}.pdf`;
      console.log('Download URL:', url);
      console.log('Token:', token);
      console.log('File URI:', fileUri);
      const response = await FileSystem.downloadAsync(url, fileUri, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Download response:', response);
      // Check file size (valid PDFs are usually > 1KB)
      const fileInfo = await FileSystem.getInfoAsync(response.uri);
      console.log('File info:', fileInfo);
      if (!fileInfo.exists || fileInfo.size < 1000) {
        Alert.alert('Download Failed', 'The downloaded file is not a valid PDF document.');
        return;
      }
      Alert.alert(
        'PDF Saved',
        `Report PDF saved to: ${response.uri}`,
        [
          {
            text: 'Share PDF',
            onPress: async () => {
              try {
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(response.uri);
                } else {
                  Alert.alert('Sharing not available', `File saved at: ${response.uri}`);
                }
              } catch (e) {
                Alert.alert('Error', 'Could not share the PDF.');
              }
            }
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.log('Download error:', error);
      Alert.alert('Download Failed', error.message || 'Could not download PDF.');
    } finally {
      setExportingId(null);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const filteredReports = reports.filter(r => {
    const matchesType = selectedType === 'all' || r.type === selectedType;
    const matchesSearch = r.title?.toLowerCase().includes(searchQuery.toLowerCase()) || r.type?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const fadeAnims = useMemo(() => filteredReports.map(() => new Animated.Value(0)), [filteredReports.length]);
  const slideAnims = useMemo(() => filteredReports.map(() => new Animated.Value(20)), [filteredReports.length]);
  useEffect(() => {
    filteredReports.forEach((_, idx) => {
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
  }, [filteredReports.length]);

  useEffect(() => {
    Animated.timing(startAnim, {
      toValue: focusField === 'start' ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    Animated.timing(endAnim, {
      toValue: focusField === 'end' ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    Animated.timing(descAnim, {
      toValue: focusField === 'desc' ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focusField]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ marginTop: 16, color: theme.textDark, fontFamily: Fonts.body, fontSize: 16 }}>
            Loading reports...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      {/* Header */}
      <View style={{
        backgroundColor: theme.card,
        paddingTop: 45,
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
          Reports & Analytics
        </Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 24 }}>
          {/* Search Input with Icon */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.card,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: theme.border,
            paddingHorizontal: 16,
            marginBottom: 18,
            height: 44,
          }}>
            <Ionicons name="search" size={20} color={theme.textLight} style={{ marginRight: 8 }} />
            <TextInput
              style={{
                flex: 1,
                color: theme.textDark,
                fontFamily: Fonts.body,
                fontSize: 16,
                backgroundColor: 'transparent',
                paddingVertical: 0,
              }}
              placeholder="Search reports by title or type..."
              placeholderTextColor={theme.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              underlineColorAndroid="transparent"
            />
          </View>
          {/* Filter Buttons */}
          <View style={{ marginBottom: 18 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {[
                { key: 'all', label: `All (${reports.length})` },
                { key: 'revenue', label: `Revenue` },
                { key: 'users', label: `Users` },
                { key: 'providers', label: `Providers` },
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
          {/* Generate Report Button */}
          <View style={{ alignItems: 'flex-start', marginBottom: 18 }}>
            <TouchableOpacity onPress={() => setShowDialog(true)} style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.primary, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20 }}>
              <Ionicons name="add" size={18} color="#111" />
              <Text style={{ marginLeft: 6, color: '#111', fontWeight: '600', fontSize: 15 }}>Generate Report</Text>
            </TouchableOpacity>
          </View>
          {/* Section Heading */}
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.textDark,
            fontFamily: Fonts.subheading,
            marginBottom: 12
          }}>
            Generated Reports ({filteredReports.length})
          </Text>
          {/* Reports List */}
          {filteredReports.map((report, idx) => (
            <Animated.View
              key={report._id}
              style={{
                opacity: fadeAnims[idx],
                transform: [{ translateY: slideAnims[idx] }],
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 14,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: theme.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  minHeight: 70,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: theme.textDark,
                    fontFamily: Fonts.heading,
                    marginBottom: 1,
                  }}>{report.title || report.type}</Text>
                  <Text style={{
                    fontSize: 13,
                    color: theme.textLight,
                    fontFamily: Fonts.body,
                    marginBottom: 1,
                  }}>{formatDate(report.createdAt)}</Text>
                  <Text style={{
                    fontSize: 11,
                    color: theme.textLight,
                    fontFamily: Fonts.body,
                  }}>Status: {report.status}</Text>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#F3F4F6',
                    borderRadius: 20,
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: theme.primary,
                    marginLeft: 8,
                  }}
                  activeOpacity={0.8}
                  onPress={() => handleExportReport(report._id)}
                >
                  <Ionicons name="download-outline" size={18} color={theme.primary} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))}
          {filteredReports.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{
                fontSize: 16,
                color: theme.textLight,
                fontFamily: Fonts.body,
              }}>
                No reports found
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      {/* Generate Report Modal */}
      <Modal visible={showDialog} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000066' }}>
          <View style={{ backgroundColor: theme.card, padding: 20, borderRadius: 14, width: '90%', maxWidth: 400 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textDark, marginBottom: 14, fontFamily: Fonts.heading }}>Generate New Report</Text>
            {/* Report Title */}
            <Text style={{ fontSize: 14, color: theme.textDark, marginBottom: 4, fontWeight: '600' }}>Report Title</Text>
            <Animated.View style={[inputStyle(theme), { marginBottom: 10 }]}> 
              <TextInput
                placeholder="Enter report title"
                placeholderTextColor={theme.textLight}
                value={reportTitle}
                onChangeText={setReportTitle}
                style={{ color: theme.textDark, fontSize: 14, fontFamily: Fonts.body, padding: 0, backgroundColor: 'transparent' }}
              />
            </Animated.View>
            {/* Report Type */}
            <Text style={{ fontSize: 14, color: theme.textDark, marginBottom: 4, fontWeight: '600' }}>Report Type</Text>
            <View style={[inputStyle(theme), { marginBottom: 10, flexDirection: 'row', alignItems: 'center', paddingVertical: 0 }]}> 
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {[
                  { key: 'revenue_analytics', label: 'Revenue Analytics' },
                  { key: 'booking_analytics', label: 'Booking Analytics' },
                  { key: 'user_growth', label: 'User Growth' },
                  { key: 'provider_performance', label: 'Provider Performance' },
                  { key: 'complaint_analytics', label: 'Complaint Analytics' },
                  { key: 'custom', label: 'Custom' },
                ].map(item => (
                  <TouchableOpacity
                    key={item.key}
                    style={{
                      backgroundColor: reportType === item.key ? theme.primary : theme.card,
                      borderRadius: 16,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderWidth: 1,
                      borderColor: reportType === item.key ? theme.primary : theme.border,
                      minWidth: 60,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => setReportType(item.key)}
                  >
                    <Text style={{ color: reportType === item.key ? '#fff' : theme.textDark, fontFamily: Fonts.body, fontSize: 13 }}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {/* Description */}
            <Text style={{ fontSize: 14, color: theme.textDark, marginBottom: 4, fontWeight: '600' }}>Description</Text>
            <Animated.View style={[inputStyle(theme), { minHeight: 40, marginBottom: 10 }]}> 
              <TextInput
                placeholder="Describe the purpose of this report (optional)"
                placeholderTextColor={theme.textLight}
                value={description}
                onChangeText={setDescription}
                style={{ color: theme.textDark, fontSize: 14, fontFamily: Fonts.body, padding: 0, backgroundColor: 'transparent' }}
                multiline
              />
            </Animated.View>
            {/* Group By */}
            <Text style={{ fontSize: 14, color: theme.textDark, marginBottom: 4, fontWeight: '600' }}>Group By</Text>
            <View style={[inputStyle(theme), { marginBottom: 10, flexDirection: 'row', alignItems: 'center', paddingVertical: 0 }]}> 
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {[
                  { key: 'day', label: 'Day' },
                  { key: 'week', label: 'Week' },
                  { key: 'month', label: 'Month' },
                  { key: 'quarter', label: 'Quarter' },
                  { key: 'year', label: 'Year' },
                ].map(item => (
                  <TouchableOpacity
                    key={item.key}
                    style={{
                      backgroundColor: groupBy === item.key ? theme.primary : theme.card,
                      borderRadius: 16,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderWidth: 1,
                      borderColor: groupBy === item.key ? theme.primary : theme.border,
                      minWidth: 60,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => setGroupBy(item.key)}
                  >
                    <Text style={{ color: groupBy === item.key ? '#fff' : theme.textDark, fontFamily: Fonts.body, fontSize: 13 }}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
              <TouchableOpacity onPress={() => {
                setShowDialog(false);
                setReportTitle('');
                setReportType('revenue_analytics');
                setDescription('');
                setGroupBy('month');
              }} style={{ marginRight: 10 }}><Text style={{ color: theme.textDark, fontSize: 15 }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={async () => {
                await handleGenerateReport();
                setShowDialog(false);
                setReportTitle('');
                setReportType('revenue_analytics');
                setDescription('');
                setGroupBy('month');
              }}><Text style={{ color: theme.primary, fontSize: 15 }}>Generate</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const inputStyle = (theme) => ({
  backgroundColor: theme.background,
  borderColor: theme.border,
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  marginBottom: 10,
});
