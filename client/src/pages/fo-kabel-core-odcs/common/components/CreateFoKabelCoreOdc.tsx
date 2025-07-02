// client/src/pages/fo-kabel-core-odcs/common/components/CreateFoKabelCoreOdc.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '$app/components/cards';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { SelectField } from '$app/components/forms';

interface FoKabelCoreOdcCreate {
    kabel_tube_odc_id: number;
    warna_core: string;
}

interface TubeOdcOption {
    id: number;
    warna_tube: string;
    kabel_odc_id: number;
    nama_kabel: string;
}

interface Props {
    form: FoKabelCoreOdcCreate;
    setForm: React.Dispatch<React.SetStateAction<FoKabelCoreOdcCreate>>;
    errors?: ValidationBag;
    tubes: TubeOdcOption[];
    selectedCable?: number;
    setSelectedCable?: React.Dispatch<React.SetStateAction<number>>;
}

const CORE_COLORS = [
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

export function CreateFoKabelCoreOdc({
    form,
    setForm,
    errors,
    tubes,
    selectedCable: selectedCableProp,
    setSelectedCable: setSelectedCableProp,
}: Props) {
    const [t] = useTranslation();
    // internal state for create mode
    const [internalCable, setInternalCable] = useState<number>(0);
    const selectedCable = selectedCableProp ?? internalCable;
    const setSelectedCable = setSelectedCableProp ?? setInternalCable;

    // derive unique cable options
    const cableOptions = Array.from(
        new Map(
            tubes.map((tub) => [tub.kabel_odc_id, tub.nama_kabel])
        ).entries()
    ).map(([id, name]) => ({ id, name }));

    // filter tube options for selected cable
    const filteredTubes = tubes.filter(
        (tub) => tub.kabel_odc_id === selectedCable
    );

    // when selectedCable changes, reset tube selection if no prop (create mode)
    useEffect(() => {
        if (!selectedCableProp) {
            setForm((f) => ({ ...f, kabel_tube_odc_id: 0 }));
        }
    }, [selectedCable, selectedCableProp, setForm]);

    // ensure initial internalCable picks up form.kabel_tube_odc_id on edit
    useEffect(() => {
        if (selectedCableProp === undefined && form.kabel_tube_odc_id) {
            // find parent cable of existing tube
            const existing = tubes.find((t) => t.id === form.kabel_tube_odc_id);
            if (existing) {
                setInternalCable(existing.kabel_odc_id);
            }
        }
    }, [form.kabel_tube_odc_id, tubes, selectedCableProp]);

    const change = <K extends keyof FoKabelCoreOdcCreate>(
        field: K,
        value: FoKabelCoreOdcCreate[K]
    ) => setForm((f) => ({ ...f, [field]: value }));

    return (
        <Card title={t('new_core_odc')}>
            {/* Select parent cable */}
            <Element leftSide={t('kabel_odc')} required>
                <SelectField
                    required
                    value={selectedCable || ''}
                    onValueChange={(v) => setSelectedCable(parseInt(v))}
                >
                    <option value="">{t('select_kabel_odc')}</option>
                    {cableOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                            {opt.name}
                        </option>
                    ))}
                </SelectField>
            </Element>

            {/* Select tube under chosen cable */}
            <Element leftSide={t('warna_tube')} required>
                <SelectField
                    required
                    value={form.kabel_tube_odc_id || ''}
                    onValueChange={(v) =>
                        change('kabel_tube_odc_id', parseInt(v))
                    }
                    errorMessage={errors?.errors.kabel_tube_odc_id}
                >
                    <option value="">{t('select_warna_tube')}</option>
                    {filteredTubes.map((tub) => (
                        <option key={tub.id} value={tub.id}>
                            {tub.warna_tube}
                        </option>
                    ))}
                </SelectField>
            </Element>

            {/* Select core color */}
            <Element leftSide={t('warna_core')} required>
                <SelectField
                    required
                    value={form.warna_core}
                    onValueChange={(v) => change('warna_core', v)}
                    errorMessage={errors?.errors.warna_core}
                >
                    <option value="">{t('select_warna_core')}</option>
                    {CORE_COLORS.map((color) => (
                        <option key={color} value={color}>
                            {t(color)}
                        </option>
                    ))}
                </SelectField>
            </Element>
        </Card>
    );
}
