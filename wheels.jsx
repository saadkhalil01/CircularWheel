import { View, StyleSheet, SafeAreaView, StatusBar, Text, Image, Platform } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import WheelSelector from './WheelSelector';
import React, { useEffect, useState } from 'react';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { FontStyles } from '../../constants/fontStyles';
import CustomHeader from '../../components/CustomHeader';


export const Wheels = () => {
  const angle = useSharedValue(0);
  const [score, setScore] = useState(1);
  const [color, setColor] = useState('white');

  useEffect(() => {
    setColor(score == 3 ? '#cd5e80'
      : score == 2 ? '#e05d65'
        : score == 1 ? '#ee3a64'
          : score == 10 ? '#3585ea'
            : score == 9 ? '#3099e8'
              : score == 8 ? '#37b6ff'
                : score == 7 ? '#24cce3'
                  : score == 4 ? '#8725d0'
                    : score == 5 ? '#a939a9' :
                      '#c1488c');
  }, [score])

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: '#0b192c',
    }}>

      <StatusBar barStyle={'dark-content'} backgroundColor={'white'} />

      <View style={styles.root}>
        <CustomHeader title={"Partner's Name"} />
        <Image
          source={require('../../assets/images/textLogo.png')}
          style={styles.logoTextStyle}
        />
        <Text style={[FontStyles.title, {
          fontSize: 100,
          color: color
        }]} >{score}</Text>
        <View style={{ marginBottom: -hp(20) }} >
          <WheelSelector angle={angle} setScore={setScore} setColor={setColor} />
        </View>
      </View>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  root: {
    paddingTop: Platform.OS == 'android' ? hp(4) : hp(0),
    backgroundColor: '#0b192c',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'space-between',
  },
  logoTextStyle: {
    width: '70%',
    height: hp(10),
  },
});