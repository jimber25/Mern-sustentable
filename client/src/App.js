import React from "react";
import { BrowserRouter } from "react-router-dom";
import { WebRouter, AdminRouter } from "./router";
import { AuthProvider, SiteProvider, LanguageProvider } from "./contexts";

export default function App() {
  return (
    <AuthProvider>
      {/* <SiteProvider> */}
      <LanguageProvider>
      <BrowserRouter>
        {/* <WebRouter /> */}
        <AdminRouter />
      </BrowserRouter>
      </LanguageProvider>
      {/* </SiteProvider> */}
    </AuthProvider>
  );
}