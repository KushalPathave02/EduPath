import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProgressChart = () => {
  return (
    <View style={styles.container}>
      <Text>Progress Chart</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
});

export default ProgressChart;
