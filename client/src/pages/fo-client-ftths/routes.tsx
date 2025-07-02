import { lazy } from 'react';
import { Route } from 'react-router-dom';

const FoClientFtths = lazy(() => import('$app/pages/fo-client-ftths/index/FoClientFtths'));
const Create = lazy(() => import('$app/pages/fo-client-ftths/create/Create'));
const Edit = lazy(() => import('$app/pages/fo-client-ftths/edit/Edit'));
const Show = lazy(() => import('$app/pages/fo-client-ftths/show/Show'));

export const foClientFtthRoutes = (
  <Route path="fo-client-ftths">
    <Route path="" element={<FoClientFtths />} />
    <Route path="create" element={<Create />} />
    <Route path=":id" element={<Show />} />
    <Route path=":id/edit" element={<Edit />} />
  </Route>
);
