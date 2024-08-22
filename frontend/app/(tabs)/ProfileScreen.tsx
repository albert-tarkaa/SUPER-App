import CustomAvatar from '@/components/CustomAvatar';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Card, Title, Paragraph, List } from 'react-native-paper';
import { useSelector } from 'react-redux';

const ProfileScreen = () => {
  const { isLoading, error, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('(tabs)');
    }
  });

  return (
    <View style={styles.container}>
      <Card style={styles.nameCard}>
        <Card.Content>
          <View style={styles.header}>
            <CustomAvatar
              size={60}
              source={require('@/assets/images/icon.png')}
            />
            <View>
              <Paragraph>Name</Paragraph>
              <Title>
                {user?.firstName} {user?.lastName}
              </Title>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.bline}>PERSONAL INFORMATION</Title>
          {user?.gender && (
            <List.Item title="Sex" description="Male" style={styles.bline} />
          )}
          {user?.dob && (
            <List.Item
              title="Date of birth"
              description={user?.dob}
              style={styles.bline}
            />
          )}
          {user?.username && (
            <List.Item
              title="Email"
              description={user?.username}
              style={styles.bline}
            />
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: '#F7F7F8'
  },
  nameCard: {
    marginBottom: 16,
    backgroundColor: '#fff'
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    marginRight: 16,
    backgroundColor: '#E8F5E9'
  },
  bline: {
    borderBottomWidth: 1,
    marginTop: 10,
    borderStyle: 'solid',
    borderBottomColor: '#F6F6F6'
  }
});

export default ProfileScreen;
