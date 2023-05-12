import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  
  ::-webkit-scrollbar {
  width: 2px;
}
 
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}
 
::-webkit-scrollbar-thumb {
  background-color: darkgrey;
  outline: 1px solid slategrey;
}
`;
