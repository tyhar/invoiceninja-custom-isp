import React from 'react';
import { Route, Navigate } from 'react-router';
import { lazy } from 'react';

const FTTHReportsIndex = lazy(() => import('./index'));
const Overview = lazy(() => import('./Overview'));
const Utilization = lazy(() => import('./Utilization'));
const Status = lazy(() => import('./Status'));
const Details = lazy(() => import('./Details'));

export const foReportRoutes = (
  <Route path="/fo-reports" element={<FTTHReportsIndex />}>
    <Route index element={<Navigate to="overview" replace />} />
    <Route path="overview" element={<Overview />} />
    <Route path="utilization" element={<Utilization />} />
    <Route path="status" element={<Status />} />
    <Route path="details" element={<Details />} />
  </Route>
);

// TypeScript module declaration for import resolution
export type { };
