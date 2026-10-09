# Conflict Explanation for PR: "Add multilingual health assistant and emergency detection"

This PR does not introduce a **Git merge conflict**.  
The "conflicts" here are **functional/logic conflicts** between requirements:

1. **Multilingual output vs safety consistency**  
   - Requirement: answer in English/Hindi/Marathi.  
   - Conflict risk: safety language can become inconsistent across languages.  
   - Reason: language selection is applied at LLM prompt level, while safety checks are regex-based and mostly English-focused for generated output.

2. **Emergency detection vs normal answer generation**  
   - Requirement: detect urgent cases and immediately return emergency guidance.  
   - Conflict risk: emergency questions could still go through retrieval/LLM flow.  
   - Reason: both paths start from the same question input; emergency logic must run first to short-circuit the pipeline.

3. **Source fidelity vs translated response**  
   - Requirement: translated answers but trusted source references preserved.  
   - Conflict risk: model may translate or alter source labels/URLs.  
   - Reason: translation instructions can unintentionally affect citation text unless explicitly constrained.

## Why these conflicts happen

They happen because one feature set (language adaptation) changes how text is generated, while another feature set (safety + emergency handling) relies on deterministic checks and strict behavior. Combining both in one flow needs clear precedence and guardrails.
