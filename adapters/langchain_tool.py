from pathlib import Path
from langchain_core.tools import BaseTool
from pydantic import BaseModel, Field

POLICY = (Path(__file__).parent.parent / "core" / "policy.md").read_text()


class NormalizeArgs(BaseModel):
    text: str = Field(..., description="Text to normalize to English")
    source_language: str = Field("auto", description="BCP-47 tag or 'auto'")


class NormalizeToEnglish(BaseTool):
    name: str = "normalize_to_english"
    description: str = (
        "Internal helper: translate non-English text to English before reasoning. "
        "Pass code/logs/URLs/paths/quoted text through unchanged."
    )
    args_schema: type[BaseModel] = NormalizeArgs

    def _run(self, text: str, source_language: str = "auto") -> str:
        # delegate to your translator of choice (LLM call, MT API, etc.)
        raise NotImplementedError("Implement with your preferred translation backend.")
