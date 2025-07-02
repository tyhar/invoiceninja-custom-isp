// client/src/pages/fo-odps/edit/Edit.tsx
import React, { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Default } from '$app/components/layouts/Default';
import { Container } from '$app/components/Container';
import { Spinner } from '$app/components/Spinner';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { useNavigate, useParams } from 'react-router-dom';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { CreateFoOdp, FoOdpFormValues } from '../common/components/CreateFoOdp';

interface CoreOption {
    id: number;
    warna_core: string;
    kabel_odc_id: number;
    nama_kabel: string;
    kabel_tube_odc_id: number;
    warna_tube: string;
}
interface LokasiOpt {
    id: number;
    nama_lokasi: string;
}

export default function Edit() {
    useTitle('Edit FO ODP');
    const [t] = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const initial: FoOdpFormValues = {
        create_new_lokasi: false,
        lokasi_id: '',
        lokasi_name: '',
        lokasi_deskripsi: '',
        lokasi_latitude: '',
        lokasi_longitude: '',
        kabel_odc_id: '',
        kabel_tube_odc_id: '',
        kabel_core_odc_id: '',
        nama_odp: '',
    };

    const [values, setValues] = useState<FoOdpFormValues>(initial);
    const [lokasis, setLokasis] = useState<LokasiOpt[]>([]);
    const [cores, setCores] = useState<CoreOption[]>([]);
    const [errors, setErrors] = useState<ValidationBag>();
    const [isBusy, setIsBusy] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            request('GET', endpoint(`/api/v1/fo-odps/${id}`)),
            request('GET', endpoint('/api/v1/fo-lokasis')),
            request('GET', endpoint('/api/v1/fo-kabel-core-odcs')),
        ])
            .then(([odpRes, lokRes, coreRes]: any) => {
                const odp = odpRes.data.data;
                const core = odp.kabel_core_odc;
                setValues({
                    create_new_lokasi: false,
                    lokasi_id: odp.lokasi.id?.toString() ?? '',
                    lokasi_name: '',
                    lokasi_deskripsi: '',
                    lokasi_latitude: '',
                    lokasi_longitude: '',
                    kabel_odc_id: core?.kabel_odc?.id.toString() ?? '',
                    kabel_tube_odc_id:
                        core?.kabel_tube_odc?.id.toString() ?? '',
                    kabel_core_odc_id: core?.id.toString() ?? '',
                    nama_odp: odp.nama_odp ?? '',
                });
                setLokasis(
                    lokRes.data.data.map((l: any) => ({
                        id: l.id,
                        nama_lokasi: l.nama_lokasi,
                    }))
                );
                setCores(
                    coreRes.data.data.map((c: any) => ({
                        id: c.id,
                        warna_core: c.warna_core,
                        kabel_odc_id: c.kabel_odc.id,
                        nama_kabel: c.kabel_odc.nama_kabel,
                        kabel_tube_odc_id: c.kabel_tube_odc.id,
                        warna_tube: c.kabel_tube_odc.warna_tube,
                    }))
                );
            })
            .catch(() => {
                toast.error('error_refresh_page');
                navigate('/fo-odps');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    if (loading) return <Spinner />;

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        if (isBusy) return;
        setIsBusy(true);
        toast.processing();

        const payload: Record<string, any> = {
            lokasi_id: parseInt(values.lokasi_id, 10),
            nama_odp: values.nama_odp,
            // always send core ID explicitly, null if unset
            kabel_core_odc_id:
                values.kabel_core_odc_id === ''
                    ? null
                    : parseInt(values.kabel_core_odc_id, 10),
        };
        if (values.kabel_core_odc_id !== '') {
            payload.kabel_core_odc_id = parseInt(values.kabel_core_odc_id, 10);
        }

        const doUpdate = (lokasi_id: number) => {
            request('PUT', endpoint(`/api/v1/fo-odps/${id}`), {
                ...payload,
                lokasi_id,
            })
                .then(() => toast.success('updated_odp'))
                .catch((err) => {
                    if (err.response?.status === 422) {
                        setErrors(err.response.data);
                        const validation = err.response.data.errors;
                        if (validation.kabel_core_odc_id) {
                            toast.error(
                                validation.kabel_core_odc_id[0] +
                                    ' Please disable or unset the existing ODP before assigning this core.'
                            );
                        } else {
                            toast.dismiss();
                        }
                    } else toast.error('error_refresh_page');
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
                .then((res: any) => doUpdate(res.data.data.id))
                .catch((err) => {
                    if (err.response?.status === 422) {
                        setErrors(err.response.data);
                        toast.dismiss();
                    } else toast.error('error_refresh_page');
                    setIsBusy(false);
                });
        } else doUpdate(parseInt(values.lokasi_id, 10));
    };

    const pages = [
        { name: t('FO ODP')!, href: '/fo-odps' },
        { name: t('edit_odp')!, href: `/fo-odps/${id}/edit` },
    ];

    return (
        <Default
            title={t('edit_odp')!}
            breadcrumbs={pages}
            disableSaveButton={isBusy}
            onSaveClick={handleSave}
        >
            <Container breadcrumbs={[]}>
                <form onSubmit={handleSave}>
                    <CreateFoOdp
                        values={values}
                        setValues={setValues}
                        lokasis={lokasis}
                        cores={cores}
                        errors={errors}
                    />
                </form>
                {isBusy && <Spinner />}
            </Container>
        </Default>
    );
}
