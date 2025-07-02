import { route } from '$app/common/helpers/route';
import { Navigate, useParams } from 'react-router-dom';

export default function Show() {
    const { id } = useParams();

    return <Navigate to={route('/fo-odcs/:id/edit', { id })} />;
}
