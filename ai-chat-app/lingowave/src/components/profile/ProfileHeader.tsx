import React from "react";

import {
  View,
  StyleSheet,
} from "react-native";


import AppText from "../ui/AppText";

import ProfileAvatar from "./ProfileAvatar";


import {
  useTheme,
  Spacing,
} from "../../theme";



interface Props {

  name: string;

  email: string;

}



export default function ProfileHeader({

  name,

  email,

}: Props) {


  const { theme } = useTheme();



  return (

    <View style={styles.container}>


      <ProfileAvatar

        name={name}

      />



      <AppText

        weight="700"

        style={styles.name}

        color={theme.colors.textPrimary}

      >

        {name}


      </AppText>




      <AppText

        color={theme.colors.textSecondary}

      >

        {email}


      </AppText>


    </View>


  );

}





const styles = StyleSheet.create({

  container: {

    alignItems: "center",

    paddingVertical: Spacing.xl,

  },


  name: {

    marginTop: Spacing.md,

  },

});