"""Consistency checks for the translation files.

`en.json` is the reference; every other language is compared against it.

Missing keys are reported as warnings only: Home Assistant loads English as the
base and layers the selected language on top, so an incomplete translation
degrades to English instead of breaking. Everything that does bite at runtime --
orphan keys, placeholder drift, wrong value types, ICU plurals that hassfest
rejects -- fails the test.
"""

from __future__ import annotations

import json
import re
import warnings
from pathlib import Path

import pytest

COMPONENT_DIR = (
    Path(__file__).resolve().parents[1] / "custom_components" / "advanced_cover"
)
TRANSLATIONS_DIR = COMPONENT_DIR / "translations"
FRONTEND_SRC_DIR = COMPONENT_DIR / "frontend" / "src"
REFERENCE = "en"

# `t(hass, "config_panel.tab_today")` -- the literal keys used by the panel.
T_CALL_RE = re.compile(r"""\bt\(\s*[\w.?]+\s*,\s*["']([^"']+)["']""")
# `this._t("card_next_up")` -- the card's own shorthand for the same lookup.
CARD_T_CALL_RE = re.compile(r"""\b_t\(\s*["']([\w]+)["']""")
CARD_SRC_DIR = FRONTEND_SRC_DIR / "card"
PLACEHOLDER_RE = re.compile(r"\{\s*(\w+)")
# hassfest rejects ICU plurals in translation files, `hass.localize` accepts them.
ICU_PLURAL_RE = re.compile(r"\{\s*\w+\s*,\s*(plural|select|selectordinal)\s*,")


def _flatten(data: dict, prefix: str = "") -> dict[str, str]:
    """Flatten nested translation dicts into `a.b.c` -> value."""
    flat: dict[str, str] = {}
    for key, value in data.items():
        path = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            flat.update(_flatten(value, path))
        else:
            flat[path] = value
    return flat


def _load(language: str) -> dict[str, str]:
    """Flattened translations for one language."""
    return _flatten(
        json.loads((TRANSLATIONS_DIR / f"{language}.json").read_text(encoding="utf-8"))
    )


def _languages() -> list[str]:
    """Every shipped language except the reference."""
    return sorted(
        p.stem for p in TRANSLATIONS_DIR.glob("*.json") if p.stem != REFERENCE
    )


LANGUAGES = _languages()
ALL_LANGUAGES = [REFERENCE, *LANGUAGES]


@pytest.mark.parametrize("language", LANGUAGES)
def test_no_orphan_keys(language: str) -> None:
    """Keys that no longer exist in `en` are dead weight and must be removed."""
    orphans = sorted(set(_load(language)) - set(_load(REFERENCE)))
    assert not orphans, (
        f"{language}.json has {len(orphans)} key(s) missing from {REFERENCE}.json: "
        + ", ".join(orphans)
    )


@pytest.mark.parametrize("language", LANGUAGES)
def test_placeholders_match_reference(language: str) -> None:
    """A dropped or renamed placeholder renders as literal text in the panel."""
    reference = _load(REFERENCE)
    mismatches = []
    for key, value in _load(language).items():
        if key not in reference:
            continue
        expected = set(PLACEHOLDER_RE.findall(str(reference[key])))
        actual = set(PLACEHOLDER_RE.findall(str(value)))
        if expected != actual:
            mismatches.append(
                f"{key}: expected {sorted(expected)}, got {sorted(actual)}"
            )
    assert not mismatches, f"{language}.json placeholder mismatches:\n" + "\n".join(
        mismatches
    )


@pytest.mark.parametrize("language", ALL_LANGUAGES)
def test_values_are_non_empty_strings(language: str) -> None:
    """Structure drift (a dict where `en` has a string) breaks `hass.localize`."""
    reference = _load(REFERENCE)
    bad = [
        key
        for key, value in _load(language).items()
        if not isinstance(value, str)
        or not value.strip()
        # A nested dict flattens away, so a key present in `en` but absent here
        # after flattening is caught by the coverage report instead.
        or (key in reference and not isinstance(reference[key], str))
    ]
    assert not bad, f"{language}.json has empty or non-string values: {sorted(bad)}"


@pytest.mark.parametrize("language", ALL_LANGUAGES)
def test_no_icu_plurals(language: str) -> None:
    """hassfest fails the CI on ICU plural/select syntax -- catch it before the push."""
    offenders = [
        key
        for key, value in _load(language).items()
        if ICU_PLURAL_RE.search(str(value))
    ]
    assert not offenders, (
        f"{language}.json uses ICU plural/select syntax, which hassfest "
        f"rejects: {sorted(offenders)}"
    )


def test_frontend_keys_exist_in_reference() -> None:
    """Every literal `t()` key must resolve, otherwise it renders its own path."""
    reference = set(_load(REFERENCE))
    used: set[str] = set()
    for path in FRONTEND_SRC_DIR.rglob("*.ts"):
        used.update(T_CALL_RE.findall(path.read_text(encoding="utf-8")))
    unknown = sorted(used - reference)
    assert not unknown, f"frontend uses keys missing from {REFERENCE}.json: {unknown}"


def test_card_keys_exist_in_reference() -> None:
    """The card resolves `_t("key")` against `config_panel`, bundled at build time."""
    reference = set(_load(REFERENCE))
    used: set[str] = set()
    for path in CARD_SRC_DIR.rglob("*.ts"):
        used.update(CARD_T_CALL_RE.findall(path.read_text(encoding="utf-8")))
    assert used, "no card keys found -- did the card's `_t` helper change?"
    unknown = sorted(key for key in used if f"config_panel.{key}" not in reference)
    assert not unknown, f"card uses keys missing from {REFERENCE}.json: {unknown}"


def test_translation_coverage() -> None:
    """Report incomplete languages without failing -- they fall back to English."""
    reference = set(_load(REFERENCE))
    for language in LANGUAGES:
        missing = sorted(reference - set(_load(language)))
        if missing:
            warnings.warn(
                f"{language}.json is missing {len(missing)} of {len(reference)} "
                f"keys ({100 * len(missing) / len(reference):.1f}% untranslated, "
                f"English is used instead): {', '.join(missing)}",
                UserWarning,
                stacklevel=1,
            )
