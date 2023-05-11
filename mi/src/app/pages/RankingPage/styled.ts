import { FormPreviousLink } from "grommet-icons";
import styled from "styled-components";

export const Container = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10rem 0;
  box-sizing: border-box;
  overflow: auto;
`;

export const List = styled.table`
  margin: 1rem;
  width: 300px;
  max-width: 90vw;
  margin: auto;
`;
export const Match = styled.tr`
  text-align: center;
  th {
    text-align: center;
  }
  td {
    padding: 1rem 0;
  }
`;

export const Back = styled.div`
  position: absolute;
  top: 3rem;
  left: 3rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
  &:hover {
    opacity: 1;
  }
`;

export const BackIcon = styled(FormPreviousLink)``;
