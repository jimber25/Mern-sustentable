import React, { useState } from "react";
import {
  Container,
  Segment,
  Grid,
  GridColumn,
  Divider,
} from "semantic-ui-react";
//import "./Presentation.scss";

export function Presentation() {
  return (
    <div style={{ width:"100%"}}>
     <Container style={{marginTop:"50px", width:"80%"}} text textAlign="center">
         <p style={styleText}>Tu aliado para gestionar y reducir los impactos de tus procesos</p>
         <p style={styleText}>Un paso sustentable a la vez</p>
       </Container>
    </div>
  );
}

const styleText={
  fontFamily:"Cambria",
  font:"bold",
  fontSize:"160%"
}