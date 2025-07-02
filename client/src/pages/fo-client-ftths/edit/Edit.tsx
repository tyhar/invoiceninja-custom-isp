import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Default } from '$app/components/layouts/Default';
import { CreateFoClientFtth, FoClientFtthFormValues } from '../common/components/CreateFoClientFtth';
import { request } from '$app/common/helpers/request';
import { Spinner } from '$app/components/Spinner';
import { Container } from '$app/components/Container';
import { endpoint } from '$app/common/helpers2';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useQueryClient } from 'react-query';

export default function Edit() {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();

    const [values, setValues] = useState<FoClientFtthFormValues>({
        create_new_lokasi: false,
        lokasi_id: '',
        lokasi_name: '',
        lokasi_deskripsi: '',
        lokasi_latitude: '',
        lokasi_longitude: '',
        odp_id: '',
        client_id: '',
        nama_client: '',
        alamat: '',
        status: 'active',
    });
    const [errors, setErrors] = useState<ValidationBag | undefined>();
    const [loading, setLoading] = useState(true);
    const [isBusy, setIsBusy] = useState(false);
    const [dataReady, setDataReady] = useState(false);
    const [lokasis, setLokasis] = useState<any[]>([]);
    const [odps, setOdps] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            request('GET', endpoint(`/api/v1/fo-client-ftths/${id}`)),
            request('GET', endpoint('/api/v1/fo-lokasis')),
            request('GET', endpoint('/api/v1/fo-odps')),
            request('GET', endpoint('/api/v1/clients?per_page=500&status=active')),
        ]).then(([ftthRes, lokasiRes, odpRes, clientRes]) => {
            const ftth = ftthRes.data.data;

            const lokasisData = lokasiRes.data.data.map((l: any) => ({ id: l.id, nama_lokasi: l.nama_lokasi }));
            const odpsData = odpRes.data.data.map((o: any) => ({ id: o.id, nama_odp: o.nama_odp }));
            const clientsData = clientRes.data.data.map((c: any) => ({ id: c.id, name: c.name }));

            // Set the form values with proper client_id handling
            // The API now returns encoded client IDs, so we can use them directly
            setValues({
                create_new_lokasi: false,
                lokasi_id: ftth.lokasi?.id?.toString() ?? '',
                lokasi_name: '',
                lokasi_deskripsi: '',
                lokasi_latitude: '',
                lokasi_longitude: '',
                odp_id: ftth.odp?.id?.toString() ?? '',
                client_id: ftth.client?.id?.toString() ?? '',
                nama_client: ftth.nama_client ?? '',
                alamat: ftth.alamat ?? '',
                status: ftth.status ?? 'active',
            });

            setLokasis(lokasisData);
            setOdps(odpsData);
            setClients(clientsData);
            setDataReady(true);
        }).catch(() => {
            toast.error('error_refresh_page');
            navigate('/fo-client-ftths');
        }).finally(() => setLoading(false));
    }, [id, navigate]);

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsBusy(true);
        setErrors(undefined);
        toast.processing();

        const payload: Record<string, any> = {
            odp_id: parseInt(values.odp_id, 10),
            nama_client: values.nama_client,
            alamat: values.alamat,
            status: values.status,
        };

        // Handle client_id - set to null if empty string or undefined
        if (values.client_id && values.client_id.trim() !== '') {
            payload.client_id = values.client_id;
        } else {
            payload.client_id = null;
        }

        const doUpdate = (lokasi_id: number) => {
            request('PUT', endpoint(`/api/v1/fo-client-ftths/${id}`), {
                ...payload,
                lokasi_id,
            })
                .then(() => {
                    toast.success('updated_client_ftth');
                    queryClient.invalidateQueries('fo-client-ftths');
                    navigate(route('/fo-client-ftths'));
                })
                .catch((err) => {
                    if (err.response?.status === 422) {
                        setErrors(err.response.data);
                        toast.dismiss();
                    } else {
                        toast.error('error_refresh_page');
                    }
                })
                .finally(() => setIsBusy(false));
        };

        if (values.create_new_lokasi) {
            request('POST', endpoint('/api/v1/fo-lokasis'), {
                nama_lokasi: values.lokasi_name,
                deskripsi: values.lokasi_deskripsi,
                latitude: parseFloat(values.lokasi_latitude),
                longitude: parseFloat(values.lokasi_longitude),
            })
                .then((res: any) => {
                    queryClient.invalidateQueries(['/api/v1/fo-lokasis']);
                    doUpdate(res.data.data.id);
                })
                .catch((err) => {
                    if (err.response?.status === 422) {
                        setErrors(err.response.data);
                        toast.dismiss();
                    } else {
                        toast.error('error_refresh_page');
                    }
                    setIsBusy(false);
                });
        } else {
            doUpdate(parseInt(values.lokasi_id, 10));
        }
    };

    if (loading || !dataReady) return <Spinner />;

    return (
        <Default
            title={t('edit_client_ftth')}
            breadcrumbs={[
                { name: t('Client FTTH'), href: '/fo-client-ftths' },
                { name: t('edit_client_ftth'), href: '' }
            ]}
            disableSaveButton={isBusy}
            onSaveClick={handleSave}
        >
            <Container breadcrumbs={[]}>
                <form onSubmit={handleSave}>
                    <CreateFoClientFtth
                        values={values}
                        setValues={setValues}
                        errors={errors}
                        lokasis={lokasis}
                        odps={odps}
                        clients={clients}
                        isEdit
                    />
                </form>
                {isBusy && <Spinner />}
            </Container>
        </Default>
    );
}
