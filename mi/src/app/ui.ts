import {
  Card as GrommetCard,
  Button as GrommetButon,
  CardBody as GrommetCardBody,
  CardHeader as GrommetCardHeader,
  Form as GrommetForm,
  FormField as GrommetFormField,
  Main as GrommetMain,
  Box as GrommetBox,
  Anchor as GrommetAnchor,
  Heading as GrommetHeading,
} from "grommet";
import styled, { css } from "styled-components";
import { theme } from "./theme";

export const Card = styled(GrommetCard)`
  position: relative;
  border-radius: 0;
  box-shadow: none;
  border: thin solid #333;
  padding: 2rem;
  background-color: ${theme.global.colors.background.dark};
`;

export const Box = styled(GrommetBox)``;
export const Button = styled(GrommetButon)`
  border-radius: 0;
`;
export const CardBody = styled(GrommetCardBody)``;
export const CardHeader = styled(GrommetCardHeader)``;
export const CardFooter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  margin: 4rem -2rem -2rem;
  background: #191919;
`;
export const Form = styled(GrommetForm)``;
export const Heading = styled(GrommetHeading)``;

export const Main = styled(GrommetMain)``;

export const Space = styled.div<{
  $size?: string;
  small?: boolean;
  medium?: boolean;
  big?: boolean;
  spring?: boolean;
}>`
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  ${({ small }) => small && "width: 1rem; height: 1rem;"}
  ${({ medium }) => medium && "width: 2rem; height: 2rem;"}
  ${({ big }) => big && "width: 4rem; height: 4rem;"}
  ${({ spring }) => spring && "flex: 1;"}
`;

export const Anchor = styled(GrommetAnchor).attrs(() => ({
  color: "brand-tertiary",
}))``;
export const FormField = styled(GrommetFormField)`
  label {
    margin: 0;
  }
`;

export const ShiftBy = styled.div<{ $x?: number; $y?: number }>`
  transform: ${({ $x, $y }) => css`translate(${$x}px, ${$y}px);`};
`;
