import React from "react";

import {
View,
StyleSheet,
} from "react-native";


import AISuggestionChip from "./AISuggestionChip";


const prompts=[

"Write an email",

"Generate ideas",

"Explain code",

"Summarize text",

];


interface Props {

onSelectPrompt:(text:string)=>void;

}



export default function AIPromptList({

onSelectPrompt,

}:Props){


return (

<View style={styles.container}>


{

prompts.map(prompt=>(


<AISuggestionChip

key={prompt}

title={prompt}

onPress={()=>onSelectPrompt(prompt)}

/>


))

}


</View>

);

}



const styles=StyleSheet.create({

container:{

flexDirection:"row",

flexWrap:"wrap",

marginVertical:10,

},

});