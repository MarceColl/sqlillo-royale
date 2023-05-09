import { Queries } from "@/app/constants";
import { useQuery } from "react-query";
import { useState, useEffect } from "react";
import { Button } from "@/app/ui";
import { Editor } from "@monaco-editor/react";
import { useMutation } from "react-query";

import * as API from "@/app/API";
import * as S from "./styled";

const EditorPage = () => {
  const { data, isLoading } = useQuery(
    [Queries.code],
    () => {
      return API.getLastCode();
    },
    { refetchOnWindowFocus: false }
  );
  const [value, setValue] = useState<string | null>(null);
  const { mutate: save, isLoading: isMutationLoading } = useMutation(
    API.saveCode
  );
  const handleBack = () => window.history.back();
  const handleSave = () => {
    value && save({ value });
  };
  const handleChange = (value: string | undefined) => {
    setValue(value || "");
  };

  useEffect(() => {
    setValue(data?.code || "");
  }, [data, setValue]);

  if (isLoading || value === null) {
    return <>Loading...</>;
  }

  return (
    <S.Container>
      <S.Header>
        <S.Button secondary onClick={handleBack}>
          Go back
        </S.Button>
        <S.Button primary onClick={handleSave} busy={isMutationLoading}>
          Save code
        </S.Button>
      </S.Header>
      <Editor
        language="lua"
        theme="vs-dark"
        value={value}
        onChange={handleChange}
      />
    </S.Container>
  );
};

export { EditorPage };
