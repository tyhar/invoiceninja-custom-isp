import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Default } from '$app/components/layouts/Default';
import { Container } from '$app/components/Container';
import {
    CreateFoClientFtth,
    FoClientFtthFormValues,
} from '../common/components/CreateFoClientFtth';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers2';
import { Spinner } from '$app/components/Spinner';
import { toast } from '$app/common/helpers/toast/toast';
import { useQueryClient } from 'react-query';

export default function Create() {
    const [t] = useTranslation();
    const navigate = useNavigate();
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
    const [loading, setLoading] = useState(false);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [lokasis, setLokasis] = useState<any[]>([]);
    const [odps, setOdps] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);

    useEffect(() => {
        setOptionsLoading(true);
        Promise.all([
            request('GET', endpoint('/api/v1/fo-lokasis')),
            request('GET', endpoint('/api/v1/fo-odps')),
            request(
                'GET',
                endpoint('/api/v1/clients?per_page=500&status=active')
            ),
        ])
            .then(([lokasiRes, odpRes, clientRes]) => {
                setLokasis(
                    lokasiRes.data.data.map((l: any) => ({
                        id: l.id,
                        nama_lokasi: l.nama_lokasi,
                    }))
                );
                setOdps(
                    odpRes.data.data.map((o: any) => ({
                        id: o.id,
                        nama_odp: o.nama_odp,
                    }))
                );
                setClients(
                    clientRes.data.data.map((c: any) => ({
                        id: c.id,
                        name: c.name,
                    }))
                );
            })
            .finally(() => setOptionsLoading(false));
    }, []);

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
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

        const postClientFtth = (lokasi_id: number) => {
            request('POST', endpoint('/api/v1/fo-client-ftths'), {
                ...payload,
                lokasi_id,
            })
                .then(() => {
                    toast.success('created_client_ftth');
                    queryClient.invalidateQueries('fo-client-ftths');
                    navigate('/fo-client-ftths');
                })
                .catch((err) => {
                    if (err.response?.status === 422) {
                        setErrors(err.response.data);
                        toast.dismiss();
                    } else {
                        toast.error('error_refresh_page');
                    }
                })
                .finally(() => setLoading(false));
        };

        if (values.create_new_lokasi) {
            request('POST', endpoint('/api/v1/fo-lokasis'), {
                nama_lokasi: values.lokasi_name,
                deskripsi: values.lokasi_deskripsi,
                latitude: parseFloat(values.lokasi_latitude),
                longitude: parseFloat(values.lokasi_longitude),
            })
                .then((res: any) => {
                    // Invalidate lokasi queries as well
                    queryClient.invalidateQueries(['/api/v1/fo-lokasis']);
                    postClientFtth(res.data.data.id);
                })
                .catch((err) => {
                    if (err.response?.status === 422) {
                        setErrors(err.response.data);
                        toast.dismiss();
                    } else {
                        toast.error('error_refresh_page');
                    }
                    setLoading(false);
                });
        } else {
            postClientFtth(parseInt(values.lokasi_id, 10));
        }
    };

    return (
        <Default
            title={t('new_client_ftth')}
            breadcrumbs={[
                { name: t('Client FTTH'), href: '/fo-client-ftths' },
                { name: t('new_client_ftth'), href: '' },
            ]}
            disableSaveButton={loading || optionsLoading}
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
                        isEdit={false}
                    />
                </form>
                {(loading || optionsLoading) && <Spinner />}
            </Container>
        </Default>
    );
}
