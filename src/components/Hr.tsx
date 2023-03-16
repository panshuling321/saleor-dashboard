import { Box } from "@saleor/macaw-ui/next";
import React from "react";

export const Hr: React.FC<{
  className?: string;
}> = ({ className }) => (
  <Box
    as="hr"
    className={className}
    backgroundColor="surfaceNeutralDepressed"
    borderWidth={0}
    width="100%"
    height={1}
  />
);

Hr.displayName = "Hr";
export default Hr;
