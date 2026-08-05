import React from "react";

import {
View,
StyleSheet,
} from "react-native";


import AppText from "../ui/AppText";


import {
Spacing,
Typography,
} from "../../theme";



export default function CallHeader(){

return (

<View style={styles.container}>


<AppText

size={Typography.h1}

weight="700"

>

📞 Calls

</AppText>


</View>

);

}



const styles=StyleSheet.create({

container:{

paddingVertical:Spacing.lg,

},

});