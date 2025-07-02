// client/src/pages/fo-lokasis/common/components/CreateFoLokasi.tsx

import React, { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '$app/components/cards';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';

interface FoLokasi {
    nama_lokasi: string;
    deskripsi?: string;
    latitude: number;
    longitude: number;
    city?: string;
    province?: string;
    country?: string;
    geocoded_at?: string;
}

interface Props {
    foLokasi: FoLokasi;
    errors?: ValidationBag;
    setFoLokasi: Dispatch<SetStateAction<FoLokasi>>;
    setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
}

export function CreateFoLokasi(props: Props) {
    const [t] = useTranslation();
    const { foLokasi, setFoLokasi, errors, setErrors } = props;

    const handleChange = <K extends keyof FoLokasi>(
        field: K,
        value: FoLokasi[K]
    ) => {
        setErrors(undefined);
        setFoLokasi((f) => ({ ...f, [field]: value }));
    };

    return (
        <Card title={t('New Lokasi')}>
            <Element leftSide={t('nama lokasi')} required>
                <InputField
                    required
                    value={foLokasi.nama_lokasi}
                    onValueChange={(value) =>
                        handleChange('nama_lokasi', value)
                    }
                    errorMessage={errors?.errors.nama_lokasi}
                />
            </Element>

            <Element leftSide={t('deskripsi')}>
                <InputField
                    element="textarea"
                    value={foLokasi.deskripsi || ''}
                    onValueChange={(value: string) =>
                        handleChange('deskripsi', value)
                    }
                    errorMessage={errors?.errors.deskripsi}
                />
            </Element>

            <Element leftSide={t('latitude')} required>
                <InputField
                    required
                    type="number"
                    value={foLokasi.latitude}
                    onValueChange={(value) =>
                        handleChange('latitude', parseFloat(value))
                    }
                    errorMessage={errors?.errors.latitude}
                />
            </Element>

            <Element leftSide={t('longitude')} required>
                <InputField
                    required
                    type="number"
                    value={foLokasi.longitude}
                    onValueChange={(value) =>
                        handleChange('longitude', parseFloat(value))
                    }
                    errorMessage={errors?.errors.longitude}
                />
            </Element>

            {/* Geocoding Note */}
            <Element leftSide={t('Note')}>
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                    <p>
                        <strong>Geocoding:</strong> Geographic information (city, province, country) is not automatically retrieved.
                        After saving, you can click the &quot;Force Geocode&quot; or &quot;Re-geocode&quot; button in the location list to get geographic information from coordinates.
                    </p>
                </div>
            </Element>

            {/* Geographic Information Display */}
            {(foLokasi.city || foLokasi.province || foLokasi.country) && (
                <Element leftSide={t('Geographic Information')}>
                    <div className="space-y-2">
                        {foLokasi.city && (
                            <div className="text-sm">
                                <span className="font-medium">City:</span> {foLokasi.city}
                            </div>
                        )}
                        {foLokasi.province && (
                            <div className="text-sm">
                                <span className="font-medium">Province:</span> {foLokasi.province}
                            </div>
                        )}
                        {foLokasi.country && (
                            <div className="text-sm">
                                <span className="font-medium">Country:</span> {foLokasi.country}
                            </div>
                        )}
                        {foLokasi.geocoded_at && (
                            <div className="text-xs text-gray-500">
                                Geocoded: {new Date(foLokasi.geocoded_at).toLocaleString()}
                            </div>
                        )}
                    </div>
                </Element>
            )}
        </Card>
    );
}
