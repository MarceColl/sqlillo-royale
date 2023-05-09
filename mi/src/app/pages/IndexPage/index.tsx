import { Main, Space } from "@/app/ui";

import royaleLogoUrl from "@/app/assets/royale.png?url";
import * as S from "./styled";
import { Capbase } from "@/app/components/Capbase";
import { Link } from "@/modules/Router";
import { Routes } from "@/app/constants";

export const IndexPage = () => {
  return (
    <Main align="center" justify="center" overflow="auto">
      <Capbase $top $left $white />
      <S.Container>
        <h1>SQLILLO</h1>
        <img src={royaleLogoUrl} />
        <Space big />
        <S.Heading
          size="xsmall"
          weight="normal"
          textAlign="center"
          color={"#FFFA"}
        >
          <div>Fight everyone. Only one bot can remain.</div>
        </S.Heading>
        <S.Heading size="xsmall" textAlign="center">
          Will it be yours?
        </S.Heading>
        <Space spring />
        <S.JoinContainer>
          <S.Dots />
          <Link to={Routes.login}>
            <S.JoinButton primary>Join the challenge</S.JoinButton>
          </Link>
        </S.JoinContainer>
        <Space spring />
      </S.Container>
    </Main>
  );
};
