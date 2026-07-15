from __future__ import annotations

from pathlib import Path
from typing import Final

from pypdf import PdfReader
from weasyprint import HTML

ROOT: Final[Path] = Path(__file__).resolve().parents[1]
DOCS: Final[Path] = ROOT / "docs"
LETTER_WIDTH_POINTS: Final[float] = 612.0
LETTER_HEIGHT_POINTS: Final[float] = 792.0
PAGE_TOLERANCE_POINTS: Final[float] = 1.0

ARTIFACTS: Final[tuple[tuple[str, str, int], ...]] = (
    ("resume.html", "Russell-Dudek-ServiceLink-Resume.pdf", 2),
    ("cover-letter.html", "Russell-Dudek-ServiceLink-Cover-Letter.pdf", 1),
    ("interview-brief.html", "ServiceLink-AI-Product-Design-Interview-Brief.pdf", 3),
    ("90-day-plan.html", "ServiceLink-Senior-Product-Designer-AI-90-Day-Plan.pdf", 3),
    ("agent-title-review.html", "ServiceLink-Agent-Title-Review.pdf", 1),
)


def assert_letter_page(page, artifact_name: str, page_number: int) -> None:
    width = float(page.mediabox.width)
    height = float(page.mediabox.height)
    if abs(width - LETTER_WIDTH_POINTS) > PAGE_TOLERANCE_POINTS or abs(
        height - LETTER_HEIGHT_POINTS
    ) > PAGE_TOLERANCE_POINTS:
        raise RuntimeError(
            f"{artifact_name} page {page_number} is {width:.2f} x {height:.2f} pt; "
            "expected US Letter (612 x 792 pt)."
        )


def generate_pdf(source_name: str, output_name: str, expected_pages: int) -> None:
    source = ROOT / source_name
    output = DOCS / output_name
    if not source.is_file():
        raise FileNotFoundError(f"Missing source document: {source}")

    HTML(filename=str(source), base_url=str(ROOT)).write_pdf(str(output))

    if not output.is_file() or output.stat().st_size == 0:
        raise RuntimeError(f"PDF generation produced no usable file: {output}")

    reader = PdfReader(str(output))
    actual_pages = len(reader.pages)
    if actual_pages != expected_pages:
        raise RuntimeError(
            f"{output_name} has {actual_pages} pages; expected {expected_pages}."
        )

    for page_number, page in enumerate(reader.pages, start=1):
        assert_letter_page(page, output_name, page_number)

    print(f"generated {output.relative_to(ROOT)} ({actual_pages} page(s))")


def main() -> None:
    DOCS.mkdir(parents=True, exist_ok=True)
    for source_name, output_name, expected_pages in ARTIFACTS:
        generate_pdf(source_name, output_name, expected_pages)


if __name__ == "__main__":
    main()
