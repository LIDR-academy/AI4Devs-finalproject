# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Regression tests for the AI BPMN sanitizer.

The LLM occasionally returns BPMN XML with three classes of defects:

1. Self-closing elements written as opening-only (`<dc:Bounds ...>` with no `/>`).
2. Missing closing `</bpmndi:BPMNShape>` / `</bpmndi:BPMNEdge>` tags.
3. Truncated output cut off mid-document (max_tokens hit).

Each defect is detected and repaired in `_sanitize_bpmn_xml`. These tests
guarantee that every repaired payload is valid XML so it loads in bpmn-js
without the dreaded "unparsable content / unclosed tag" errors users saw
in the browser console.
"""
import os
import sys

# Tests run from the backend root; allow imports without installing as a pkg.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
os.environ.setdefault("MONGO_URL", "mongodb://localhost:27017")
os.environ.setdefault("DB_NAME", "test_sanitizer")

from routers.ai_generator import (  # noqa: E402
    _sanitize_bpmn_xml,
    _validate_bpmn_parses,
)


_BROKEN_BOUNDS = """<?xml version="1.0"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC">
  <bpmn:process id="P1"><bpmn:startEvent id="S"/><bpmn:endEvent id="E"/></bpmn:process>
  <bpmndi:BPMNDiagram id="D"><bpmndi:BPMNPlane id="PL" bpmnElement="P1">
    <bpmndi:BPMNShape id="_BPMNShape_S" bpmnElement="S">
      <dc:Bounds x="180" y="200" width="36" height="36">
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="_BPMNShape_E" bpmnElement="E">
      <dc:Bounds x="500" y="200" width="36" height="36">
    </bpmndi:BPMNShape>
  </bpmndi:BPMNPlane></bpmndi:BPMNDiagram>
</bpmn:definitions>"""


def test_sanitizer_fixes_unclosed_dc_bounds():
    cleaned, repairs = _sanitize_bpmn_xml(_BROKEN_BOUNDS)
    assert any("self-closing" in r for r in repairs)
    assert _validate_bpmn_parses(cleaned) is None


def test_sanitizer_balances_BPMNShape_closes():
    broken = (
        '<bpmn:definitions xmlns:bpmn="a" xmlns:bpmndi="b" xmlns:dc="c">'
        "<bpmndi:BPMNDiagram><bpmndi:BPMNPlane>"
        '<bpmndi:BPMNShape id="X"><dc:Bounds x="1" y="1" width="1" height="1"/>'
        '<bpmndi:BPMNShape id="Y">'
        '<dc:Bounds x="2" y="2" width="2" height="2"/>'
        "</bpmndi:BPMNShape>"
        "</bpmndi:BPMNPlane></bpmndi:BPMNDiagram>"
        "</bpmn:definitions>"
    )
    cleaned, repairs = _sanitize_bpmn_xml(broken)
    assert any("BPMNShape" in r for r in repairs)
    assert _validate_bpmn_parses(cleaned) is None


def test_sanitizer_appends_missing_root_close():
    broken = (
        '<bpmn:definitions xmlns:bpmn="a">'
        '<bpmn:process id="P"><bpmn:startEvent id="S"/></bpmn:process>'
    )
    cleaned, repairs = _sanitize_bpmn_xml(broken)
    assert any("definitions" in r for r in repairs)
    assert _validate_bpmn_parses(cleaned) is None


def test_sanitizer_strips_markdown_fence():
    fenced = (
        "```xml\n"
        '<bpmn:definitions xmlns:bpmn="a"><bpmn:process id="P"/></bpmn:definitions>'
        "\n```"
    )
    cleaned, repairs = _sanitize_bpmn_xml(fenced)
    assert any("fence" in r for r in repairs)
    assert _validate_bpmn_parses(cleaned) is None


def test_sanitizer_passes_through_valid_xml_unchanged():
    valid = (
        '<bpmn:definitions xmlns:bpmn="a"><bpmn:process id="P">'
        '<bpmn:startEvent id="S"/></bpmn:process></bpmn:definitions>'
    )
    cleaned, repairs = _sanitize_bpmn_xml(valid)
    assert repairs == []
    assert _validate_bpmn_parses(cleaned) is None
    assert cleaned == valid.strip()


def test_sanitizer_rejects_garbage():
    cleaned, repairs = _sanitize_bpmn_xml("Hola, no soy XML")
    assert "missing-root" in repairs
