import React from "react";
import { Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

function Logout({ onLogout }) {
  return (
    <Button
      variant="outlined"
      color="warning"
      startIcon={<LogoutIcon />}
      onClick={() => {
        localStorage.removeItem("token");
        onLogout();
      }}
      sx={{
        fontWeight: "bold",
        borderRadius: 2,
        borderColor: "#f7931a",
        color: "#f7931a",
        "&:hover": {
          background: "#232526",
          borderColor: "#f7931a",
        },
      }}
    >
      Logout
    </Button>
  );
}

export default Logout;