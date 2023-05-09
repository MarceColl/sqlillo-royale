import { Button, Heading as RawHeading } from "@/app/ui";
import styled from "styled-components";

import dotsUrl from "@/app/assets/dots.webp?url";

export const JoinButton = styled(Button)`
  position: absolute;
  width: max-content;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  line-height: 1em;
  font-size: 5rem;
  padding: 3rem;
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 60vw;
  max-height: 1200px;
  text-align: center;
  padding: 5rem 0;
`;

export const JoinContainer = styled.div`
  position: relative;
`;

export const Dots = styled.img.attrs(() => ({
  src: dotsUrl,
}))`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(10);
  filter: blur(1px);
  image-rendering: pixelated;

  @keyframes dots {
    0% {
      transform: translate(-50%, -50%) scale(5) rotate(0deg);
      opacity: 0;
      filter: blur(1px) hue-rotate(0deg);
      animation-timing-function: ease-in-out;
    }
    50% {
      transform: translate(-50%, -50%) scale(10) rotate(90deg);
      opacity: 0.5;
      filter: blur(1px) hue-rotate(45deg);
      animation-timing-function: ease-in-out;
    }
    100% {
      transform: translate(-50%, -50%) scale(5) rotate(180deg);
      opacity: 0.8;
      filter: blur(1px) hue-rotate(0deg);
      opacity: 0;
    }
  }

  animation-name: dots;
  animation-duration: 10s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  animation-direction: alternate;
`;

export const Heading = styled(RawHeading)`
  z-index: 10;
`;
