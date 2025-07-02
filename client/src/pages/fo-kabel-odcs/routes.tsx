import { Route } from 'react-router-dom';
import { lazy } from 'react';

const FoKabelOdcs = lazy(
    () => import('$app/pages/fo-kabel-odcs/index/FoKabelOdcs')
);
const Create = lazy(() => import('$app/pages/fo-kabel-odcs/create/Create'));
const Edit = lazy(() => import('$app/pages/fo-kabel-odcs/edit/Edit'));
const Show = lazy(() => import('$app/pages/fo-kabel-odcs/show/Show'));

export const foKabelOdcRoutes = (
    <Route path="fo-kabel-odcs">
        <Route path="" element={<FoKabelOdcs />} />
        <Route path="create" element={<Create />} />
        <Route path=":id" element={<Show />} />
        <Route path=":id/edit" element={<Edit />} />
    </Route>
);
