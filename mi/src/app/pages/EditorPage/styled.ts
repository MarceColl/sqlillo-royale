import { Button as RawButton } from "@/app/ui";
import { Transaction } from "grommet-icons";
import styled, { css } from "styled-components";

export const Container = styled.div`
  flex: 1;
  display: flex;
  height: 100%;
  overflow-x: hidden;
`;

export const EditorContainer = styled.div<{ $right: boolean }>`
  position: relative;
  flex: 2;
  resize: horizontal;
  ${({ $right }) =>
    $right &&
    css`
      order: 1;
    `}
`;

export const DocsContainer = styled.div`
  flex: 1;
  min-width: 100px;
  overflow: auto;
  height: 100%;
`;

export const WithMargin = styled.div`
  padding: 0.5rem 1rem;
`;

export const Header = styled.div`
  position: absolute;
  right: 1rem;
  display: flex;
  gap: 1rem;
  padding: 1rem;
  z-index: 1;
`;

export const Button = styled(RawButton)`
  font-size: 2rem;
  line-height: 2rem;
  padding: 0.5rem 1rem;
`;

export const ChangeIcon = styled(Transaction)``;
