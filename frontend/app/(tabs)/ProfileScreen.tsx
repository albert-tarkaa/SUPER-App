import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Card, Title, Paragraph, List } from 'react-native-paper';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Card style={styles.nameCard}>
        <Card.Content>
          <View style={styles.header}>
            <Avatar.Icon size={64} icon="account" style={styles.avatar} />
            <View>
              <Paragraph>Owner</Paragraph>
              <Title>Albert Tarkaa</Title>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.bline}>PERSONAL INFORMATION</Title>
          <List.Item title="Sex" description="Male" style={styles.bline} />
          <List.Item
            title="Date of Birth"
            description="11/12/98"
            style={styles.bline}
          />
          <List.Item
            title="Phone"
            description="08134345335"
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            style={styles.bline}
          />
          <List.Item
            title="Email"
            description="Agonsi.onyedikachi@gmail.com"
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
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
