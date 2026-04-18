import { Box } from "@mui/material";

function BrandImage({ width = 170, alt = "Hostezy", sx = {} }) {
  return (
    <Box
      component="img"
      src="/hostezy_logo.svg"
      alt={alt}
      sx={{
        width,
        maxWidth: "100%",
        height: "auto",
        display: "block",
        ...sx,
      }}
    />
  );
}

export default BrandImage;
