import { Button as RawButton } from "@/app/ui";
import styled from "styled-components";

export const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const Split = styled.div`
  height: 100%;
  position: fixed;
  z-index: 1;
  top: 0;
  overflow-x: hidden;
`;

export const Left = styled(Split)`
  left: 0;
  width: 60%;
`;

export const Right = styled(Split)`
  right: 0;
  width: 40%;
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
