import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

export default function TabsLayout() {
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: {
          position: 'absolute',
          borderTopColor: colors.border,
          backgroundColor: 'rgba(248,248,250,0.94)',
          height: 84,
          paddingTop: 9,
          paddingBottom: 20,
        },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '700' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <Ionicons name="today-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="add"
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            router.push('/contact/new');
          },
        }}
        options={{
          title: '',
          tabBarLabel: '',
          tabBarIcon: () => (
            <View style={styles.addButton}>
              <Text style={styles.addText}>+</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="firms"
        options={{
          title: 'Firms',
          tabBarIcon: ({ color, size }) => <Ionicons name="business-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: colors.primary,
    marginTop: -8,
  },
  addText: { color: colors.white, fontSize: 28, fontWeight: '300', marginTop: -2 },
});
