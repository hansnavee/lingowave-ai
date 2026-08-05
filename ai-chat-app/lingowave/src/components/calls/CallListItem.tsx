import React from "react";

import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";


import AppText from "../ui/AppText";


import {
  useTheme,
  Spacing,
} from "../../theme";



interface Props {

  name: string;

  type: string;

  time: string;

  icon: string;

  onPress: () => void;

}



export default function CallListItem({

  name,

  type,

  time,

  icon,

  onPress,

}: Props) {


  const { theme } = useTheme();



  return (

    <TouchableOpacity

      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderColor: theme.colors.border,
        },
      ]}

      onPress={onPress}

    >


      <View

        style={[
          styles.avatar,
          {
            backgroundColor: theme.colors.primary,
          },
        ]}

      >

        <AppText size={20}>

          {icon}

        </AppText>


      </View>



      <View>

        <AppText

          weight="700"

          color={theme.colors.textPrimary}

        >

          {name}


        </AppText>



        <AppText

          color={theme.colors.textSecondary}

        >

          {type} • {time}


        </AppText>


      </View>


    </TouchableOpacity>

  );

}



const styles = StyleSheet.create({

  container: {

    flexDirection: "row",

    alignItems: "center",

    padding: Spacing.md,

    marginBottom: Spacing.sm,

    borderWidth: 1,

  },


  avatar: {

    width: 45,

    height: 45,

    borderRadius: 50,

    justifyContent: "center",

    alignItems: "center",

    marginRight: Spacing.md,

  },

});