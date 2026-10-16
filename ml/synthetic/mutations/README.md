# synthetic/mutations

Take accessible HTML, inject known violations (drop alt, remove labels, break heading order, lower contrast),
and keep the original as the fix. Produces (broken, fixed) pairs for the patch model (M5).
Verify each pair with axe-core: the broken version must fail the targeted rule and the fixed one must pass.
