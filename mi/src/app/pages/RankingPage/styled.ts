import { Heading as RawHeading } from "@/app/ui";
import { FormPreviousLink } from "grommet-icons";
import styled, { css } from "styled-components";

export const Heading = styled(RawHeading)`
  z-index: 10;
`;

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
  margin-top: 4rem;
  width: 100%;
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

export const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;
export const Tab = styled.div<{ $active: boolean }>`
  padding: 1rem;
  cursor: pointer;
  ${({ $active }) =>
    $active &&
    css`
      border-bottom: 2px solid white;
    `}
`;

export const Content = styled.div`
  max-width: 90vw;
  margin: auto;
`;
