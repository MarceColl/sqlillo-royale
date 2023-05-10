import capbaseLogoUrl from "@/app/assets/capchase.svg?url";
import styled from "styled-components";

const Container = styled.div<Props>`
  position: absolute;
  top: ${(props) => (props.$top ? "2rem" : "auto")};
  bottom: ${(props) => (props.$bottom ? "2rem" : "auto")};
  left: ${(props) => (props.$left ? "2rem" : "auto")};
  right: ${(props) => (props.$right ? "2rem" : "auto")};
  ${({ $white }) => ($white ? "filter: invert(1);" : "")}

  @media (max-width: 768px) {
    display: none;
  }
`;

type Props = {
  $top?: boolean;
  $bottom?: boolean;
  $left?: boolean;
  $right?: boolean;
  $white?: boolean;
};

export const Capbase = (props: Props) => {
  return (
    <Container {...props}>
      <a href="https://www.capchase.com" target="_blank">
        <img src={capbaseLogoUrl} />
      </a>
    </Container>
  );
};
