import { Route } from 'react-router-dom';
import { lazy } from 'react';

const FoKabelOdcs = lazy(
    () => import('$app/pages/fo-kabel-tube-odcs/index/FoKabelTubeOdcs')
);
const Create = lazy(
    () => import('$app/pages/fo-kabel-tube-odcs/create/Create')
);
const Edit = lazy(() => import('$app/pages/fo-kabel-tube-odcs/edit/Edit'));
const Show = lazy(() => import('$app/pages/fo-kabel-tube-odcs/show/Show'));

export const foKabelTubeOdcRoutes = (
    <Route path="fo-kabel-tube-odcs">
        <Route path="" element={<FoKabelOdcs />} />
        <Route path="create" element={<Create />} />
        <Route path=":id" element={<Show />} />
        <Route path=":id/edit" element={<Edit />} />
    </Route>
);
