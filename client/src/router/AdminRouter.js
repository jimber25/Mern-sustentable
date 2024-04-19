import React from "react";
import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "../layouts";
import { Auth, Users, Blog, Courses, Menu, Newsletter, Roles, Permissions } from "../pages/admin";
import { useAuth } from "../hooks";

export function AdminRouter() {
  const { user } = useAuth();

  //console.log(user)
  const loadLayout = (Layout, Page) => {
    return (
      <Layout>
        <Page />
      </Layout>
    );
  };

  return (
    <Routes>
      {!user ? (
        <Route path="/admin/*" element={<Auth />} />
      ) : (
        <>
          {["/admin", "/admin/blog"].map((path) => (
            <Route
              key={path}
              path={path}
              element={loadLayout(AdminLayout, Blog)}
            />
          ))}
          <Route path="/admin/users" element={loadLayout(AdminLayout, Users)} />
          <Route
            path="/admin/courses"
            element={loadLayout(AdminLayout, Courses)}
          />
           <Route
            path="/admin/config/roles"
            element={loadLayout(AdminLayout, Roles)}
          />
           <Route
            path="/admin/config/permissions"
            element={loadLayout(AdminLayout, Permissions)}
          />
          <Route path="/admin/menu" element={loadLayout(AdminLayout, Menu)} />
          <Route
            path="/admin/newsletter"
            element={loadLayout(AdminLayout, Newsletter)}
          />

          <Route
            path="/admin/admin/dashboard"
            element={loadLayout(AdminLayout, Permissions)}
          />
            <Route
            path="/admin/admin/reports"
            element={loadLayout(AdminLayout, Permissions)}
          />
        </>
      )}
    </Routes>
  );
}