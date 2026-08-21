# load test

The report drove the platform with Apache JMeter, ramping to 4,000 virtual
users, each doing 3 GETs and 2 POSTs per cycle, up to ~20,000 concurrent
requests. `loadtest.js` reproduces that shape with [k6](https://k6.io), which is
a single portable binary and easier to run than a JMeter GUI.

```
BASE_URL=https://enpm818n-grp21.online k6 run loadtest/loadtest.js
```

It is a stand-in for the report's JMeter plan, not the original `.jmx`. The
measured results in the report, APDEX 1.0, ~19.66 ms average, 50.32 tx/s, zero
errors, scaling 1 → 3 instances, came from the real run.
