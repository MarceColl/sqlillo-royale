import * as S from "./styled";
import { mapTracesToFrontend } from "@/app/components/MatchPlayer/utils";
import { ChangeEvent } from "react";
import { useMatchStore } from "@/app/components/MatchPlayer/matchStore";

const TraceMatchPage = () => {
  const { setState } = useMatchStore.getState();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    console.log('File selected changed');
    console.log(e.target.files);
    if (e.target.files) {
      const content = await e.target.files[0]?.text();
      if (!content) {
          alert("No content found in file");
          return;
      }
      const mappedMatch = mapTracesToFrontend(JSON.parse(content));
      setState({match: mappedMatch});
    }
  }


  return (
    <S.Container>
      <S.MatchPlayer />
      <S.Container>
        <S.FileChooser>
        <form>
          <input type="file" onChange={handleFileChange} />
        </form> 
        </S.FileChooser>
    </S.Container>
    </S.Container>
  );
};

export { TraceMatchPage };
