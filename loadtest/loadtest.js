// A k6 reproduction of the report's JMeter mix: mostly GETs with some POSTs,
// ramped up gradually so the Auto Scaling group has time to react.
import http from "k6/http";
import { check, sleep, group } from "k6";

const BASE = __ENV.BASE_URL || "https://enpm818n-grp21.online";

export const options = {
  scenarios: {
    ramp: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 500 },
        { duration: "3m", target: 2000 },
        { duration: "3m", target: 4000 },
        { duration: "2m", target: 0 },
      ],
    },
  },
  thresholds: {
    // The report's Apdex targets: satisfied under 500ms, tolerating under 1.5s.
    http_req_duration: ["p(95)<500", "p(99)<1500"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  group("browse (GET)", () => {
    check(http.get(`${BASE}/`), { "home 200": (r) => r.status === 200 });
    check(http.get(`${BASE}/products`), { "list 200": (r) => r.status === 200 });
    check(http.get(`${BASE}/products?category=electronics`), {
      "category 200": (r) => r.status === 200,
    });
  });
  group("transact (POST)", () => {
    check(http.post(`${BASE}/cart`, { productId: "1", qty: "1" }), {
      "cart ok": (r) => r.status < 500,
    });
    check(http.post(`${BASE}/checkout`, { pay: "test" }), {
      "checkout ok": (r) => r.status < 500,
    });
  });
  sleep(1);
}
