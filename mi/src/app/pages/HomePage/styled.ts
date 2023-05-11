import { Button as RawButton, Main as RawMain } from "@/app/ui";
import styled, { css } from "styled-components";
import bgUrl from "@/app/assets/home_bg.jpg";

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

export const Main = styled(RawMain)`
  background-image: url(${bgUrl});
  background-size: cover;
`;

export const UserInfo = styled.div`
  display: flex;
  gap: 1rem;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) translateY(200px);
  font-size: 4rem;
  pointer-events: none;
  line-height: 1em;
`;

export const Username = styled.span`
  font-variant: small-caps;
`;
export const Ranking = styled.span<{
  $ranking?: number;
}>`
  ${({ $ranking }) =>
    $ranking === 1 &&
    css`
      font-size: 6rem;
      color: gold;
      font-weight: bold;
    `}
  ${({ $ranking }) =>
    $ranking === 2 &&
    css`
      font-size: 5rem;
      color: silver;
      font-weight: bold;
    `}
  ${({ $ranking }) =>
    $ranking === 3 &&
    css`
      font-size: 5rem;
      color: #cd7f32;
      font-weight: bold;
    `}
`;
