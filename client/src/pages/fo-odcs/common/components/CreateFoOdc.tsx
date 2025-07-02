// client/src/pages/fo-odcs/common/components/CreateFoOdc.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '$app/components/cards';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Element } from '$app/components/cards';
import { InputField, SelectField, Checkbox } from '$app/components/forms';

export interface FoOdcFormValues {
    create_new_lokasi: boolean;
    lokasi_id: string;
    lokasi_name: string;
    lokasi_deskripsi: string;
    lokasi_latitude: string;
    lokasi_longitude: string;
    nama_odc: string;
    tipe_splitter: string;
}

interface LokasiOption {
    id: number;
    nama_lokasi: string;
}

interface Props {
    values: FoOdcFormValues;
    setValues: React.Dispatch<React.SetStateAction<FoOdcFormValues>>;
    lokasis: LokasiOption[];
    errors?: ValidationBag;
}

export function CreateFoOdc({ values, setValues, lokasis, errors }: Props) {
    const [t] = useTranslation();
    const onChange = <K extends keyof FoOdcFormValues>(
        field: K,
        value: FoOdcFormValues[K]
    ) => setValues((v) => ({ ...v, [field]: value }));

    return (
        <Card
            title={t(
                values.create_new_lokasi ? 'new lokasi and odc' : 'new odc'
            )}
        >
            {/* Create New Lokasi Toggle */}
            <Element leftSide={t('create new lokasi')}>
                <Checkbox
                    checked={values.create_new_lokasi}
                    onChange={(e: { target: { checked: boolean } }) =>
                        onChange('create_new_lokasi', e.target.checked)
                    }
                />
            </Element>

            {/* Lokasi Fields */}
            {values.create_new_lokasi ? (
                <>
                    <Element leftSide={t('nama lokasi')} required>
                        <InputField
                            required
                            value={values.lokasi_name}
                            onValueChange={(v) => onChange('lokasi_name', v)}
                            errorMessage={errors?.errors.nama_lokasi}
                        />
                    </Element>
                    <Element leftSide={t('deskripsi')}>
                        <InputField
                            element="textarea"
                            value={values.lokasi_deskripsi}
                            onValueChange={(v) =>
                                onChange('lokasi_deskripsi', v)
                            }
                            errorMessage={errors?.errors.deskripsi}
                        />
                    </Element>
                    <Element leftSide={t('latitude')} required>
                        <InputField
                            required
                            type="number"
                            value={values.lokasi_latitude}
                            onValueChange={(v) =>
                                onChange('lokasi_latitude', v)
                            }
                            errorMessage={errors?.errors.latitude}
                        />
                    </Element>
                    <Element leftSide={t('longitude')} required>
                        <InputField
                            required
                            type="number"
                            value={values.lokasi_longitude}
                            onValueChange={(v) =>
                                onChange('lokasi_longitude', v)
                            }
                            errorMessage={errors?.errors.longitude}
                        />
                    </Element>
                </>
            ) : (
                <Element leftSide={t('lokasi')} required>
                    <SelectField
                        required
                        value={values.lokasi_id}
                        onValueChange={(v) => onChange('lokasi_id', v)}
                        errorMessage={errors?.errors.lokasi_id}
                    >
                        <option value="">{t('select lokasi')}</option>
                        {lokasis.map((l) => (
                            <option key={l.id} value={l.id.toString()}>
                                {l.nama_lokasi}
                            </option>
                        ))}
                    </SelectField>
                </Element>
            )}

            {/* ODC Fields */}
            <Element leftSide={t('nama odc')} required>
                <InputField
                    required
                    value={values.nama_odc}
                    onValueChange={(v) => onChange('nama_odc', v)}
                    errorMessage={errors?.errors.nama_odc}
                />
            </Element>

            <Element leftSide={t('tipe splitter')} required>
                <SelectField
                    required
                    value={values.tipe_splitter}
                    onValueChange={(v) => onChange('tipe_splitter', v)}
                    errorMessage={errors?.errors.tipe_splitter}
                >
                    {['1:2', '1:4', '1:8', '1:16', '1:32', '1:64', '1:128'].map(
                        (opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        )
                    )}
                </SelectField>
            </Element>
        </Card>
    );
}
