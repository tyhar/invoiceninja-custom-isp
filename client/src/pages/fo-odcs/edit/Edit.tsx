// client/src/pages/fo-odcs/edit/Edit.tsx

import React, { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Default } from '$app/components/layouts/Default';
import { Container } from '$app/components/Container';
import { Spinner } from '$app/components/Spinner';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
// import { route } from '$app/common/helpers/route';
import { useNavigate, useParams } from 'react-router-dom';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { CreateFoOdc, FoOdcFormValues } from '../common/components/CreateFoOdc';
import { useQueryClient } from 'react-query';

interface LokasiOption {
    id: number;
    nama_lokasi: string;
}

export default function Edit() {
    useTitle('edit_odc');
    const [t] = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Default form values
    const initialValues: FoOdcFormValues = {
        create_new_lokasi: false,
        lokasi_id: '',
        lokasi_name: '',
        lokasi_deskripsi: '',
        lokasi_latitude: '',
        lokasi_longitude: '',
        nama_odc: '',
        tipe_splitter: '1:8',
    };

    const [values, setValues] = useState<FoOdcFormValues>(initialValues);
    const [lokasis, setLokasis] = useState<LokasiOption[]>([]);
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch existing ODC and Lokasi list
    useEffect(() => {
        Promise.all([
            request('GET', endpoint(`/api/v1/fo-odcs/${id}`)),
            request('GET', endpoint('/api/v1/fo-lokasis')),
        ])
            .then(([odcRes, lokRes]: any) => {
                const odc = odcRes.data.data;
                setValues({
                    ...initialValues,
                    lokasi_id: odc.lokasi.id.toString(),
                    nama_odc: odc.nama_odc,
                    tipe_splitter: odc.tipe_splitter,
                });
                setLokasis(
                    lokRes.data.data.map((l: any) => ({
                        id: l.id,
                        nama_lokasi: l.nama_lokasi,
                    }))
                );
            })
            .catch(() => {
                toast.error('error_refresh_page');
                navigate('/fo-odcs');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    if (loading) {
        return <Spinner />;
    }

    const handleSave = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isBusy) return;
        setIsBusy(true);
        toast.processing();

        const doUpdate = (lokasi_id: number) => {
            request('PUT', endpoint(`/api/v1/fo-odcs/${id}`), {
                lokasi_id,
                nama_odc: values.nama_odc,
                tipe_splitter: values.tipe_splitter,
            })
                .then(() => {
                    toast.success('updated_odc');

                    // Invalidate related queries
                    queryClient.invalidateQueries(['/api/v1/fo-odcs']);
                    queryClient.invalidateQueries(['/api/v1/fo-lokasis']);
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
                .then((res: GenericSingleResourceResponse<any>) =>
                    doUpdate(res.data.data.id)
                )
                .catch((err) => {
                    if (err.response?.status === 422) {
                        setErrors(err.response.data);
                        toast.dismiss();
                    } else {
                        toast.error('error_refresh_page');
                    }
                });
        } else {
            doUpdate(parseInt(values.lokasi_id, 10));
        }
    };

    const pages = [
        { name: t('FO ODC')!, href: '/fo-odcs' },
        { name: t('Edit ODC')!, href: `/fo-odcs/${id}/edit` },
    ];

    return (
        <Default
            title={t('Edit ODC')!}
            breadcrumbs={pages}
            disableSaveButton={isBusy}
            onSaveClick={handleSave}
        >
            <Container breadcrumbs={[]}>
                <form onSubmit={handleSave}>
                    <CreateFoOdc
                        values={values}
                        setValues={setValues}
                        lokasis={lokasis}
                        errors={errors}
                    />
                </form>
                {isBusy && <Spinner />}
            </Container>
        </Default>
    );
}
