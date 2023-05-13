import styled from "styled-components";
import { MatchPlayer as RawMatchPlayer } from "@/app/components";

export const Container = styled.div`
  flex: 1;
  display: flex;
`;

export const MatchPlayer = styled(RawMatchPlayer)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex: 1;
`;

export const MatchTitle = styled.div`
  position: absolute;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
`;
