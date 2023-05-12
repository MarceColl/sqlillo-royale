import * as S from "./styled";

type Props = {
  completion: number;
};

export const Bar = ({ completion }: Props) => {
  return (
    <S.Container>
      <S.Filling $completion={completion} />
    </S.Container>
  );
};
