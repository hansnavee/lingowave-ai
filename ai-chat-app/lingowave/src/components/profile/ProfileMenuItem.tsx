import React from "react";


import {
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";


import AppText from "../ui/AppText";


import {
  useTheme,
  Spacing,
} from "../../theme";



interface Props {

  title: string;

  icon: string;

  onPress: () => void;

}



export default function ProfileMenuItem({

  title,

  icon,

  onPress,

}: Props) {


  const { theme } = useTheme();



  return (

    <TouchableOpacity


      style={[

        styles.container,

        {
          backgroundColor:
          theme.colors.elevated,

          borderRadius:
          theme.radius.lg,

          borderColor:
          theme.colors.border,
        },

      ]}


      onPress={onPress}


      activeOpacity={0.7}


    >



      <View

        style={[
          styles.iconContainer,
          {
            backgroundColor:
            theme.colors.primaryMuted,
          },
        ]}

      >

        <AppText size={20}>

          {icon}

        </AppText>


      </View>





      <AppText

        style={styles.title}

        color={theme.colors.textPrimary}

        weight="600"

      >

        {title}


      </AppText>





      <AppText

        color={theme.colors.textSecondary}

        size={22}

      >

        ›

      </AppText>



    </TouchableOpacity>


  );

}





const styles = StyleSheet.create({

  container: {

    flexDirection:"row",

    alignItems:"center",

    padding:Spacing.md,

    marginBottom:Spacing.sm,

    borderWidth:1,

  },


  iconContainer: {

    width:40,

    height:40,

    borderRadius:20,

    alignItems:"center",

    justifyContent:"center",

  },


  title: {

    flex:1,

    marginLeft:Spacing.md,

  },


});