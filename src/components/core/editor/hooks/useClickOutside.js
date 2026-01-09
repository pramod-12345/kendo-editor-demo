import { useEffect, useCallback } from "react";

const isRefArray = (r) => {
  return "length" in r;
};

const isTarget = (ref, event) => {
  return ref && ref.current && ref.current.contains(event.target);
};

const trueForAny = (array, condition) => {
  return array.reduce((conditionAlreadyMet, value) => {
    return conditionAlreadyMet || condition(value);
  }, false);
};

const useClickOutside = (ref, onclick) => {
  const handleClick = useCallback(
    (click) => {
      if (isRefArray(ref)) {
        if (trueForAny(ref, (ref1) => isTarget(ref1, click))) {
          return;
        }
      } else {
        if (isTarget(ref, click)) {
          return;
        }
      }
      onclick();
    },
    [onclick, ref]
  );

  useEffect(() => {
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [handleClick]);

  return ref;
};

export default useClickOutside;
