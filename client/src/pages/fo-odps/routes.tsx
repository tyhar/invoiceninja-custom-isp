import { Route } from 'react-router-dom';
import { lazy } from 'react';

const FoOdps = lazy(() => import('$app/pages/fo-odps/index/FoOdps'));
const Create = lazy(() => import('$app/pages/fo-odps/create/Create'));
const Edit = lazy(() => import('$app/pages/fo-odps/edit/Edit'));
const Show = lazy(() => import('$app/pages/fo-odps/show/Show'));

export const foOdpRoutes = (
    <Route path="fo-odps">
        <Route path="" element={<FoOdps />} />
        <Route path="create" element={<Create />} />
        <Route path=":id" element={<Show />} />
        <Route path=":id/edit" element={<Edit />} />
    </Route>
);
