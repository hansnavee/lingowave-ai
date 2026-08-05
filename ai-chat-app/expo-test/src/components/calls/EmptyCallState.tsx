import React from "react";


import {
  View,
  StyleSheet,
} from "react-native";


import AppText from "../ui/AppText";


import {
  useTheme,
} from "../../theme";



export default function EmptyCallState(){


  const { theme } = useTheme();



  return (


    <View style={styles.container}>


      <AppText size={40}>

        📞

      </AppText>



      <AppText

        weight="700"

        color={theme.colors.textPrimary}

      >

        No calls yet


      </AppText>




      <AppText

        color={theme.colors.textSecondary}

      >

        Your recent calls will appear here.


      </AppText>



    </View>


  );


}





const styles = StyleSheet.create({


  container:{


    flex:1,


    justifyContent:"center",


    alignItems:"center",


  },


});