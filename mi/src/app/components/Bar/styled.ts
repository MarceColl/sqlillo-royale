import styled from "styled-components";

export const Container = styled.div`
  position: relative;
  flex: 1;
`;

export const Filling = styled.div<{ $completion: number }>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: ${({ $completion }) => `${100 - $completion}%`};
  background-color: lime;
  height: 3px;
`;
