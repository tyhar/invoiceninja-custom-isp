// client/src/pages/fo-odps/common/components/CreateFoOdp.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '$app/components/cards';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { InputField, SelectField, Checkbox } from '$app/components/forms';

export interface FoOdpFormValues {
    create_new_lokasi: boolean;
    lokasi_id: string;
    lokasi_name: string;
    lokasi_deskripsi: string;
    lokasi_latitude: string;
    lokasi_longitude: string;
    kabel_odc_id: string;
    kabel_tube_odc_id: string;
    kabel_core_odc_id: string;
    nama_odp: string;
}

interface LokasiOption {
    id: number;
    nama_lokasi: string;
}

interface CoreOption {
    id: number;
    warna_core: string;
    kabel_odc_id: number;
    nama_kabel: string;
    kabel_tube_odc_id: number;
    warna_tube: string;
}

interface Props {
    values: FoOdpFormValues;
    setValues: React.Dispatch<React.SetStateAction<FoOdpFormValues>>;
    lokasis: LokasiOption[];
    cores: CoreOption[];
    errors?: ValidationBag;
}

export function CreateFoOdp({
    values,
    setValues,
    lokasis,
    cores,
    errors,
}: Props) {
    const [t] = useTranslation();
    const onChange = <K extends keyof FoOdpFormValues>(
        field: K,
        value: FoOdpFormValues[K]
    ) => setValues((v) => ({ ...v, [field]: value }));

    // derive unique kabel options
    const kabelOptions = Array.from(
        new Map(
            cores.map((c) => [
                c.kabel_odc_id,
                { id: c.kabel_odc_id, nama_kabel: c.nama_kabel },
            ])
        ).values()
    );

    // derive tube options based on selected kabel
    const tubeOptions = values.kabel_odc_id
        ? Array.from(
              new Map(
                  cores
                      .filter(
                          (c) => String(c.kabel_odc_id) === values.kabel_odc_id
                      )
                      .map((c) => [
                          c.kabel_tube_odc_id,
                          { id: c.kabel_tube_odc_id, warna_tube: c.warna_tube },
                      ])
              ).values()
          )
        : [];

    // derive core options based on selected kabel and tube
    const coreOptions = cores.filter(
        (c) =>
            String(c.kabel_odc_id) === values.kabel_odc_id &&
            String(c.kabel_tube_odc_id) === values.kabel_tube_odc_id
    );

    return (
        <Card
            title={t(
                values.create_new_lokasi ? 'new_lokasi_and_odp' : 'new_odp'
            )}
        >
            <Element leftSide={t('create_new_lokasi')}>
                <Checkbox
                    checked={values.create_new_lokasi}
                    onChange={(e: { target: { checked: boolean } }) =>
                        onChange('create_new_lokasi', e.target.checked)
                    }
                />
            </Element>

            {values.create_new_lokasi ? (
                <>
                    <Element leftSide={t('nama_lokasi')} required>
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
                        <option value="">{t('select_lokasi')}</option>
                        {lokasis.map((l) => (
                            <option key={l.id} value={l.id.toString()}>
                                {l.nama_lokasi}
                            </option>
                        ))}
                    </SelectField>
                </Element>
            )}

            <Element leftSide={t('kabel_odc')} required>
                <SelectField
                    required
                    value={values.kabel_odc_id}
                    onValueChange={(v) => {
                        onChange('kabel_odc_id', v);
                        // reset dependent
                        onChange('kabel_tube_odc_id', '');
                        onChange('kabel_core_odc_id', '');
                    }}
                    errorMessage={errors?.errors.kabel_odc_id}
                >
                    <option value="">{t('select_kabel_odc')}</option>
                    {kabelOptions.map((k) => (
                        <option key={k.id} value={k.id.toString()}>
                            {k.nama_kabel}
                        </option>
                    ))}
                </SelectField>
            </Element>

            <Element leftSide={t('kabel_tube_odc')} required>
                <SelectField
                    required
                    value={values.kabel_tube_odc_id}
                    onValueChange={(v) => {
                        onChange('kabel_tube_odc_id', v);
                        onChange('kabel_core_odc_id', '');
                    }}
                    errorMessage={errors?.errors.kabel_tube_odc_id}
                >
                    <option value="">{t('select_tube_odc')}</option>
                    {tubeOptions.map((t) => (
                        <option key={t.id} value={t.id.toString()}>
                            {t.warna_tube}
                        </option>
                    ))}
                </SelectField>
            </Element>

            <Element leftSide={t('kabel_core_odc')}>
                <SelectField
                    required
                    value={values.kabel_core_odc_id}
                    onValueChange={(v) => onChange('kabel_core_odc_id', v)}
                    errorMessage={errors?.errors.kabel_core_odc_id}
                >
                    <option value="">{t('unassigned_core') || '—'}</option>
                    {coreOptions.map((c) => (
                        <option key={c.id} value={c.id.toString()}>
                            {c.warna_core}
                        </option>
                    ))}
                </SelectField>
            </Element>

            <Element leftSide={t('nama_odp')} required>
                <InputField
                    required
                    value={values.nama_odp}
                    onValueChange={(v) => onChange('nama_odp', v)}
                    errorMessage={errors?.errors.nama_odp}
                />
            </Element>
        </Card>
    );
}
