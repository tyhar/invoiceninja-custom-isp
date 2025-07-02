import { Route } from 'react-router-dom';
import { lazy } from 'react';

const FoLokasis = lazy(() => import('$app/pages/fo-lokasis/index/FoLokasis'));
const Create = lazy(() => import('$app/pages/fo-lokasis/create/Create'));
const Edit = lazy(() => import('$app/pages/fo-lokasis/edit/Edit'));
const Show = lazy(() => import('$app/pages/fo-lokasis/show/Show'));

export const foLokasiRoutes = (
    <Route path="fo-lokasis">
        <Route path="" element={<FoLokasis />} />
        <Route path="create" element={<Create />} />
        <Route path=":id" element={<Show />} />
        <Route path=":id/edit" element={<Edit />} />
    </Route>
);
