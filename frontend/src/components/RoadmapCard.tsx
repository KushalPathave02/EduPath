import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RoadmapCard = () => {
  return (
    <View style={styles.container}>
      <Text>Roadmap Card</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
  },
});

export default RoadmapCard;
