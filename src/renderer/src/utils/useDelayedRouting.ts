import { createSignal, createEffect } from "solid-js";
import { useIsRouting } from "@solidjs/router";
import { createScheduled, throttle } from "@solid-primitives/scheduled";

export function useDelayedRoutingIndicator(delay = 200) {
  const isRouting = useIsRouting();
  const [isDelayedRouting, setIsDelayedRouting] = createSignal(false);

  const scheduled = createScheduled(fn => throttle(fn, delay));

  createEffect(() => {
    console.log('OG isRouting', isRouting())
  })
  createEffect(() => {

    if (isRouting()) {
      if (scheduled()) {
        setIsDelayedRouting(true);
      }
    } else {
      setIsDelayedRouting(false);
    }
  });

  return isDelayedRouting;
}