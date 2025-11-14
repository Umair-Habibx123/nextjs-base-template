"use client";
import React from "react";
import UserLayout from "./(pages)/(user)/layout";
import UserRootPage from "./(pages)/(user)/page";

const RootPage = () => (
  <UserLayout>
    <UserRootPage />
  </UserLayout>
);

export default RootPage;
