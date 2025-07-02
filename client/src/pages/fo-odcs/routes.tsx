import { Route } from 'react-router-dom';
import { lazy } from 'react';

const FoOdcs = lazy(() => import('$app/pages/fo-odcs/index/FoOdcs'));
const Create = lazy(() => import('$app/pages/fo-odcs/create/Create'));
const Edit = lazy(() => import('$app/pages/fo-odcs/edit/Edit'));
const Show = lazy(() => import('$app/pages/fo-odcs/show/Show'));

export const foOdcRoutes = (
    <Route path="fo-odcs">
        <Route path="" element={<FoOdcs />} />
        <Route path="create" element={<Create />} />
        <Route path=":id" element={<Show />} />
        <Route path=":id/edit" element={<Edit />} />
    </Route>
);
