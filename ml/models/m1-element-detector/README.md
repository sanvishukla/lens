# M1: UI element detector

Screenshot to boxes and types (button, input, icon, link, text, image). Enables screenshot-only scans.

- Base: RT-DETR or RF-DETR (Apache-2.0). Not Ultralytics YOLO (AGPL).
- Data: `rico_semantic_hf`, `rico_semantics_google` (share-alike), `lens_synthetic`.
- Deploy: browser, ONNX.
- Ship gate: mAP@0.5 ≥ 0.6 on our web test set; under 1.5 s in browser on a mid laptop.
