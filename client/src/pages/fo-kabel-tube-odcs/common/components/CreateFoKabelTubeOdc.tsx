// client/src/pages/fo-kabel-tube-odcs/common/components/CreateFoKabelTubeOdc.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '$app/components/cards';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import {
    // InputField,
    SelectField,
} from '$app/components/forms';

interface FoKabelTubeOdcCreate {
    kabel_odc_id: number;
    warna_tube: string;
}

interface KabelOdcOption {
    id: number;
    nama_kabel: string;
}

interface Props {
    form: FoKabelTubeOdcCreate;
    setForm: React.Dispatch<React.SetStateAction<FoKabelTubeOdcCreate>>;
    errors?: ValidationBag;
    odcs: KabelOdcOption[];
}

const TUBE_COLORS = [
    'biru',
    'jingga',
    'hijau',
    'coklat',
    'abu_abu',
    'putih',
    'merah',
    'hitam',
    'kuning',
    'ungu',
    'merah_muda',
    'aqua',
];

export function CreateFoKabelTubeOdc({ form, setForm, errors, odcs }: Props) {
    const [t] = useTranslation();

    const change = <K extends keyof FoKabelTubeOdcCreate>(
        field: K,
        value: FoKabelTubeOdcCreate[K]
    ) => {
        setForm((f) => ({ ...f, [field]: value }));
    };

    return (
        <Card title={t('new tube odc')}>
            <Element leftSide={t('kabel_odc')} required>
                <SelectField
                    required
                    value={form.kabel_odc_id || ''}
                    onValueChange={(v) => change('kabel_odc_id', parseInt(v))}
                    errorMessage={errors?.errors.kabel_odc_id}
                >
                    <option value="">{t('select_kabel_odc')}</option>
                    {odcs.map((o) => (
                        <option key={o.id} value={o.id}>
                            {o.nama_kabel}
                        </option>
                    ))}
                </SelectField>
            </Element>

            <Element leftSide={t('warna_tube')} required>
                <SelectField
                    required
                    value={form.warna_tube}
                    onValueChange={(v) => change('warna_tube', v)}
                    errorMessage={errors?.errors.warna_tube}
                >
                    <option value="">{t('select_warna_tube')}</option>
                    {TUBE_COLORS.map((color) => (
                        <option key={color} value={color}>
                            {t(color)}
                        </option>
                    ))}
                </SelectField>
            </Element>
        </Card>
    );
}
