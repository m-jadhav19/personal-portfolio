import React, { useEffect, useState } from "react";
import AnimatedCursor from "react-animated-cursor";
import { useTheme } from "next-themes";

const Cursor = () => {
  const theme = useTheme();
  const [mount, setMount] = useState();

  const getCursorColor = () => {
    if (theme.theme === "dark") {
      return "#fff";
    } else if (theme.theme === "light") {
      return "#000";
    }
    return "#000"; // fallback
  };

  useEffect(() => {
    setMount(true);
  }, []);

  return (
    <>
      {mount && (
        <AnimatedCursor
          innerSize={8}
          outerSize={30}
          color={getCursorColor().replace("#", "").split("").map((c, i, arr) => {
            // Convert hex to rgb array
            if (arr.length === 6) {
              return parseInt(getCursorColor().substring(i * 2 + 1, i * 2 + 3), 16);
            }
            return 0;
          })}
          outerAlpha={0.2}
          innerScale={1}
          outerScale={2}
          clickables={[".link"]}
        />
      )}
    </>
  );
};

export default Cursor;
