# M2: Icon and element namer

Crop plus context to an accessible name ("Search", "Close menu"). Config: `ml/configs/m2-icon-namer.yaml`.

- Base: Florence-2-base (MIT) or SmolVLM-256M (Apache-2.0).
- Data: `widget_captioning`, `rico_semantics_google` (share-alike, so weights are CC BY-SA 4.0), `lens_feedback`.
- Deploy: browser, ONNX int8.
- Ship gate: ≥ 70% rated usable as-is, and beats the prompted baseline.
