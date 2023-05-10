import { Button as RawButton } from "@/app/ui";
import styled from "styled-components";

export const Menu = styled.div`
  position: absolute;
  bottom: 3rem;
  left: 3rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Button = styled(RawButton)`
  opacity: 0.8;
  font-size: 2rem;
  line-height: 2rem;
  padding: 0.5rem 1rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;
