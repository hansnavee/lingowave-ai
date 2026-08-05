import React from "react";

import {
  TouchableOpacity,
  StyleSheet,
} from "react-native";


import AppText from "../ui/AppText";


import {
  useTheme,
  Spacing,
} from "../../theme";



interface Props {

  onPress: () => void;

}



export default function LogoutButton({

  onPress,

}: Props) {


  const { theme } = useTheme();



  return (

    <TouchableOpacity

      style={[
        styles.button,
        {
          backgroundColor: theme.colors.danger,
          borderRadius: theme.radius.lg,
        },
      ]}

      onPress={onPress}

    >

      <AppText

        color={theme.colors.white}

        weight="700"

      >

        Logout


      </AppText>


    </TouchableOpacity>


  );

}



const styles = StyleSheet.create({

  button: {

    padding: Spacing.md,

    alignItems: "center",

    marginTop: Spacing.lg,

  },

});