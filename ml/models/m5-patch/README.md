# M5: Accessibility patch model

(violation + HTML) to patched HTML.

- Base: SmolLM3-3B (Apache-2.0) or Qwen2.5-Coder-1.5B-Instruct (Apache-2.0).
- Data: `accessguru`, `a11ybench`, `lens_synthetic` (mutation pairs, see `ml/synthetic/mutations`), W3C ACT test cases. `weba11ybench` is eval only.
- Deploy: server CPU (quantized GGUF) or Ollama for self-hosting.
- Ship gate: output passes axe on ≥ 85% of test cases with no visible rendering change.
