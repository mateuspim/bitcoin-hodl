import React from "react";

function Logout({ onLogout }) {
  return (
    <button
      onClick={() => {
        localStorage.removeItem("token");
        onLogout();
      }}
    >
      Logout
    </button>
  );
}

export default Logout;