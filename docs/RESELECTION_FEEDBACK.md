# Reselection bind feedback

## Why

Floor-only reselection can re-bind the same collects onto a vehicle type that
already left leftovers. Cumulative `failed_co_loads` cuts forbid that pairing
on later passes.

## Wire format

```json
{
  "reselection_feedback": {
    "failed_co_loads": [
      {
        "vehicle_id": "truck_x",
        "collect_ids": ["collect_a", "collect_b"],
        "reason": "partial_unallocated"
      }
    ]
  }
}
```

## Selector behavior

For every entry with a known `vehicle_id` and at least two known collect ids,
the MILP adds pairwise cuts so no piece of collect A shares that type with any
piece of collect B. Unknown ids and singleton lists are ignored.

## Gateway behavior

`config.algoritmo.enable_reselection_bind_feedback: true` turns feedback on.
The gateway merges new cuts into the compiled list from all earlier passes and
always forwards the full list.
