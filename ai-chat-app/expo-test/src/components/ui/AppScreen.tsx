import React from "react";

import {
  SafeAreaView,
  StyleSheet,
  ViewStyle,
  StyleProp,
  StatusBar,
} from "react-native";


import {
  useTheme,
} from "../../theme";


import AppBackground from "./AppBackground";



interface AppScreenProps {

  children: React.ReactNode;

  style?: StyleProp<ViewStyle>;

}



export default function AppScreen({

  children,

  style,

}: AppScreenProps) {


  const { theme } = useTheme();



  return (

    <AppBackground>


      <SafeAreaView

        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
          },
          style,
        ]}

      >


        <StatusBar

          barStyle={
            theme.dark === true
              ? "light-content"
              : "dark-content"
          }

          backgroundColor="transparent"

          translucent

        />


        {children}


      </SafeAreaView>


    </AppBackground>

  );

}



const styles = StyleSheet.create({

  container: {

    flex: 1,

  },

});