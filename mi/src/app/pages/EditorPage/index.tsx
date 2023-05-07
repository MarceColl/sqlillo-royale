import { useState } from "react";
import { Button } from "grommet";
import { Editor } from "@monaco-editor/react";
import { useMutation } from "react-query";

import * as API from "@/app/API";
import * as S from "./styled";

const EditorPage = () => {
  const [value, setValue] = useState("");
  const { mutate: save, isLoading } = useMutation(API.saveCode);
  const handleBack = () => window.history.back();
  const handleSave = () => {
    save({ value });
  };
  const handleChange = (value: string | undefined) => {
    setValue(value || "");
  };
  return (
    <S.Container>
      <S.Header>
        <Button secondary onClick={handleBack}>
          Go back
        </Button>
        <Button primary onClick={handleSave} busy={isLoading}>
          Save code
        </Button>
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
