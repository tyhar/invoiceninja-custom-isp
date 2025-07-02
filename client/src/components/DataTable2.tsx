// client/src/components/DataTable2.tsx

import React, {
    ChangeEvent,
    CSSProperties,
    Dispatch,
    ReactElement,
    ReactNode,
    SetStateAction,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
    endpoint,
    // getEntityState,
    isProduction,
} from '$app/common/helpers2';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { route } from '$app/common/helpers/route';
import { Divider } from './cards/Divider';
import { Actions, SelectOption } from './datatables/Actions';
import { Dropdown } from './dropdown/Dropdown';
import { DropdownElement } from './dropdown/DropdownElement';
import { Button, Checkbox } from './forms';
import { Spinner } from './Spinner';
import {
    ColumnSortPayload,
    Pagination,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from './tables';
import { TFooter } from './tables/TFooter';
import { useQuery } from 'react-query';
import { useSetAtom } from 'jotai';
import { Icon } from './icons/Icon';
import { MdArchive, MdDelete, MdEdit, MdRestore } from 'react-icons/md';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import CommonProps from '$app/common/interfaces/common-props.interface';
import classNames from 'classnames';
import { Guard } from '$app/common/guards/Guard';
// import { EntityState } from '$app/common/enums/entity-state';
import { useDataTableOptions } from '$app/common/hooks/useDataTableOptions';
import { useDataTableUtilities } from '$app/common/hooks/useDataTableUtilities';
import { useDataTablePreferences } from '$app/common/hooks/useDataTablePreferences';
import { DateRangePicker } from './datatables/DateRangePicker';
import { emitter } from '$app';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useThemeColorScheme } from '$app/pages/settings/user/components/StatusColorTheme';

export interface DateRangeColumn {
    column: string;
    queryParameterKey: string;
}

export type DataTableColumns<T = any> = {
    id: string;
    label: string;
    format?: (field: string | number, resource: T) => unknown;
}[];

export type FooterColumns<T = any> = {
    id: string;
    label: string;
    format: (
        field: (string | number)[],
        resources: T[]
    ) => ReactNode | string | number;
}[];

type CustomBulkActionContext<T> = {
    selectedIds: string[];
    selectedResources: T[];
    setSelected: Dispatch<SetStateAction<string[]>>;
};

export type CustomBulkAction<T> = (
    ctx: CustomBulkActionContext<T>
) => ReactNode;

interface StyleOptions {
    withoutBottomBorder?: boolean;
    withoutTopBorder?: boolean;
    withoutLeftBorder?: boolean;
    withoutRightBorder?: boolean;
    headerBackgroundColor?: string;
    thChildrenClassName?: string;
    tBodyStyle?: CSSProperties;
    thClassName?: string;
    tdClassName?: string;
    addRowSeparator?: boolean;
}

export type PerPage = '10' | '50' | '100';

interface Props<T extends { id: string }> extends CommonProps {
    resource: string;
    columns: DataTableColumns<T>;
    endpoint: string;
    linkToCreate?: string;
    linkToEdit?: string;
    withResourcefulActions?: ReactNode[] | boolean;
    bulkRoute?: string;
    customActions?: ((resource: T) => ReactElement)[];
    bottomActionsKeys?: string[];
    customBulkActions?: CustomBulkAction<T>[];
    customFilters?: SelectOption[];
    customFilterPlaceholder?: string;
    withoutActions?: boolean;
    withoutPagination?: boolean;
    rightSide?: ReactNode;
    withoutPadding?: boolean;
    leftSideChevrons?: ReactNode;
    staleTime?: number;
    onTableRowClick?: (resource: T) => unknown;
    showRestore?: (resource: T) => boolean;
    showEdit?: (resource: T) => boolean;
    beforeFilter?: ReactNode;
    styleOptions?: StyleOptions;
    linkToCreateGuards?: any[];
    onBulkActionSuccess?: (
        resources: T[],
        action: 'archive' | 'delete' | 'restore'
    ) => void;
    onBulkActionCall?: (
        selectedIds: string[],
        action: 'archive' | 'restore' | 'delete'
    ) => void;
    hideEditableOptions?: boolean;
    dateRangeColumns?: DateRangeColumn[];
    excludeColumns?: string[];
    methodType?: 'GET' | 'POST';
    showArchive?: (resource: T) => boolean;
    showDelete?: (resource: T) => boolean;
    withoutDefaultBulkActions?: boolean;
    withoutStatusFilter?: boolean;
    queryIdentificator?: string;
    disableQuery?: boolean;
    footerColumns?: FooterColumns<T>;
    withoutPerPageAsPreference?: boolean;
    withoutSortQueryParameter?: boolean;
    showRestoreBulk?: (selectedResources: T[]) => boolean;
    enableSavingFilterPreference?: boolean;
}

export function DataTable2<T extends { id: string }>(props: Props<T>) {
    const [t] = useTranslation();
    const options = useDataTableOptions();
    const reactSettings = useReactSettings();
    const themeColors = useThemeColorScheme();
    const [hasVerticalOverflow, setHasVerticalOverflow] =
        useState<boolean>(false);

    // Simpan URL endpoint awal
    const [apiEndpoint, setApiEndpoint] = useState<URL>(
        new URL(endpoint(props.endpoint))
    );

    const setInvalidationQueryAtom = useSetAtom(invalidationQueryAtom);

    const {
        resource,
        columns,
        linkToCreate,
        linkToEdit,
        withResourcefulActions,
        bulkRoute,
        customActions,
        // bottomActionsKeys = [],
        customBulkActions,
        customFilters,
        customFilterPlaceholder,
        withoutActions = false,
        withoutPagination = false,
        rightSide,
        withoutPadding = false,
        leftSideChevrons,
        staleTime,
        onTableRowClick,
        showRestore,
        showEdit,
        beforeFilter,
        styleOptions,
        linkToCreateGuards,
        onBulkActionSuccess,
        onBulkActionCall,
        hideEditableOptions = false,
        dateRangeColumns = [],
        excludeColumns = [],
        methodType = 'GET',
        showArchive,
        showDelete,
        withoutDefaultBulkActions = false,
        withoutStatusFilter = false,
        queryIdentificator,
        disableQuery = false,
        footerColumns = [],
        withoutPerPageAsPreference = false,
        withoutSortQueryParameter = false,
        // showRestoreBulk,
        enableSavingFilterPreference = false,
    } = props;

    const companyUpdateTimeOut = useRef<NodeJS.Timeout>();

    // State filter/pagination/sort, dsb.
    const [filter, setFilter] = useState<string>('');
    const [customFilter, setCustomFilter] = useState<string[] | undefined>(
        undefined
    );
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<PerPage>(
        (apiEndpoint.searchParams.get('per_page') as PerPage) || '10'
    );
    const [sort, setSort] = useState<string>(
        apiEndpoint.searchParams.get('sort') || 'id|asc'
    );
    const [sortedBy, setSortedBy] = useState<string | undefined>(undefined);
    const [status, setStatus] = useState<string[]>(['active']);
    const [dateRange, setDateRange] = useState<string>('');
    const [dateRangeQueryParameter, setDateRangeQueryParameter] =
        useState<string>('');
    const [selected, setSelected] = useState<string[]>([]);
    const [selectedResources, setSelectedResources] = useState<T[]>([]);

    const [isInitialConfiguration, setIsInitialConfiguration] =
        useState<boolean>(true);
    const mainCheckbox = useRef<HTMLInputElement>(null);

    const { handleUpdateTableFilters } = useDataTablePreferences({
        apiEndpoint,
        isInitialConfiguration,
        customFilter,
        setCurrentPage,
        setCustomFilter,
        setFilter,
        setPerPage,
        setSort,
        setSortedBy,
        setStatus,
        tableKey: `${resource}s`,
        customFilters,
        withoutStoringPerPage: withoutPerPageAsPreference,
        enableSavingFilterPreference,
    });

    const {
        defaultOptions,
        defaultCustomFilterOptions,
        handleChangingCustomFilters,
    } = useDataTableUtilities({
        apiEndpoint,
        isInitialConfiguration,
        tableKey: `${resource}s`,
        customFilter,
        customFilters,
    });

    // Sync URL + query params => tiap kali state berubah
    useEffect(() => {
        if (!isInitialConfiguration) {
            clearTimeout(companyUpdateTimeOut.current!);
            const timeoutId = setTimeout(
                () =>
                    handleUpdateTableFilters(
                        filter,
                        sortedBy,
                        sort,
                        currentPage,
                        status,
                        perPage
                    ),
                1500
            );
            companyUpdateTimeOut.current = timeoutId;
        }

        apiEndpoint.searchParams.set('per_page', perPage);
        apiEndpoint.searchParams.set('page', currentPage.toString());
        apiEndpoint.searchParams.set('filter', filter);

        handleChangingCustomFilters();

        if (
            !withoutSortQueryParameter ||
            (withoutSortQueryParameter && sort !== 'id|asc')
        ) {
            apiEndpoint.searchParams.set('sort', sort);
        }

        apiEndpoint.searchParams.set('status', status as unknown as string);

        if (dateRangeColumns.length && dateRangeQueryParameter) {
            const startDate = dateRange.split(',')[0];
            const endDate = dateRange.split(',')[1];
            apiEndpoint.searchParams.set(
                dateRangeQueryParameter,
                startDate && endDate ? dateRange : ''
            );
        }

        setApiEndpoint(new URL(apiEndpoint.toString()));
        if (isInitialConfiguration) {
            setIsInitialConfiguration(false);
        }

        return () => {
            isProduction() && setInvalidationQueryAtom(undefined);
        };
    }, [
        perPage,
        currentPage,
        filter,
        sort,
        status,
        customFilter,
        dateRange,
        dateRangeQueryParameter,
    ]);

    // Fetch via React Query
    const { data, isLoading, isError } = useQuery(
        [
            ...(queryIdentificator ? [queryIdentificator] : []),
            apiEndpoint.pathname,
            props.endpoint,
            perPage,
            currentPage,
            filter,
            sort,
            status,
            customFilter,
            dateRange,
            dateRangeQueryParameter,
        ],
        () => request(methodType, apiEndpoint.href),
        {
            staleTime: staleTime ?? Infinity,
            enabled: !disableQuery,
        }
    );

    const resources: T[] = data ? (data.data.data as T[]) : [];
    const meta = data ? data.data.meta : null;

    // Bulk actions: archive / delete / restore
    const bulk = (action: 'archive' | 'restore' | 'delete', id?: string) => {
        toast.processing();
        request('POST', endpoint(bulkRoute ?? `${props.endpoint}/bulk`), {
            action,
            ids: id ? [id] : Array.from(selected),
        })
            .then((resp: any) => {
                toast.success(`${action}d_${resource}`);
                onBulkActionSuccess?.(resp.data, action);
                if (mainCheckbox.current) mainCheckbox.current.checked = false;
                window.dispatchEvent(
                    new CustomEvent('invalidate.combobox.queries', {
                        detail: { url: endpoint(props.endpoint) },
                    })
                );
            })
            .finally(() => {
                setSelected([]);
            });
    };

    // const showRestoreBulkAction = () =>
    //     selectedResources.every(
    //         (r) => getEntityState(r as any) !== EntityState.Active
    //     );

    const showCustomBulkActionDivider = useMemo(() => {
        return customBulkActions
            ? customBulkActions.some((fn) =>
                  React.isValidElement(
                      fn({
                          selectedIds: selected,
                          selectedResources,
                          setSelected,
                      })
                  )
              )
            : false;
    }, [customBulkActions, selected, selectedResources]);

    const showCustomActionDivider = (resItem: T) => {
        return customActions
            ? customActions.some((fn) => React.isValidElement(fn(resItem)))
            : false;
    };

    const handleDateRangeColumnClick = (columnId: string) => {
        const currentCol = dateRangeColumns.find(
            (dr) => dateRangeQueryParameter === dr.column
        )?.column;
        const param = dateRangeColumns.find(
            (dr) => dr.column === columnId
        )?.queryParameterKey;
        if (currentCol !== columnId && param) {
            setDateRangeQueryParameter(param);
        }
    };

    const getFooterColumn = (columnId: string) =>
        footerColumns.find((fc) => fc.id === columnId);
    const getColumnValues = (columnId: string) =>
        resources.map((r) => (r as any)[columnId]);

    useEffect(() => {
        setInvalidationQueryAtom(apiEndpoint.pathname);
    }, [apiEndpoint.pathname]);

    // Maintain selectedResources, dan checkbox behavior
    useEffect(() => {
        if (data) {
            const arr: T[] = data.data.data as T[];
            const filtered = arr.filter((r) => selected.includes(r.id));
            setSelectedResources(filtered);

            const shouldDeselect = arr.some((r) => !selected.includes(r.id));
            if (shouldDeselect && mainCheckbox.current) {
                mainCheckbox.current.checked = false;
            } else if (mainCheckbox.current && arr.length) {
                mainCheckbox.current.checked = true;
            }
        }
    }, [selected, data]);

    useEffect(() => {
        if (data && (data.data.data as T[]).length === 0) {
            setCurrentPage(1);
        }
    }, [data]);

    useEffect(() => {
        if (data) {
            const arr: T[] = data.data.data as T[];
            if (Number(perPage) <= selected.length) {
                const keep = arr
                    .map((r) => r.id)
                    .filter((id) => selected.includes(id));
                setSelected(keep);
            } else if (
                Number(perPage) > selected.length &&
                mainCheckbox.current
            ) {
                mainCheckbox.current.checked = false;
            }
        }
    }, [perPage, data]);

    useEffect(() => {
        emitter.on('bulk.completed', () => setSelected([]));
    }, []);

    // show Archive/Delete if there's at least one ACTIVE + not-deleted item
    const showArchiveBulk = () =>
        selectedResources.some(
            (r: any) => r.status === 'active' && r.deleted_at == null
        );

    const showDeleteBulk = () =>
        selectedResources.some(
            (r: any) => r.status === 'active' && r.deleted_at == null
        );

    // show Restore if there's at least one ARCHIVED or soft‑deleted item
    const showRestoreBulk = () =>
        selectedResources.some(
            (r: any) => r.status === 'archived' || r.deleted_at != null
        );

    return (
        <div data-cy="dataTable2">
            {/* === Action Bar: search / status filter / Create / Bulk === */}
            {!withoutActions && (
                <Actions
                    filter={filter}
                    onFilterChange={setFilter}
                    optionsMultiSelect={true}
                    options={options}
                    defaultOptions={defaultOptions}
                    defaultCustomFilterOptions={defaultCustomFilterOptions}
                    onStatusChange={setStatus}
                    customFilters={customFilters}
                    customFilterPlaceholder={customFilterPlaceholder}
                    onCustomFilterChange={setCustomFilter}
                    customFilter={customFilter}
                    rightSide={
                        <>
                            {rightSide}
                            {linkToCreate && (
                                <Guard
                                    type="component"
                                    guards={linkToCreateGuards || []}
                                    component={
                                        <Button to={linkToCreate!}>
                                            <span>{t(`New ${resource}`)}</span>
                                        </Button>
                                    }
                                />
                            )}
                        </>
                    }
                    beforeFilter={beforeFilter}
                    withoutStatusFilter={withoutStatusFilter}
                >
                    {!hideEditableOptions && (
                        <Dropdown
                            label={t('actions')}
                            disabled={!selected.length}
                            cypressRef="bulkActionsDropdown"
                        >
                            {customBulkActions &&
                                customBulkActions.map((bulkFn, idx) => (
                                    <div key={idx}>
                                        {bulkFn({
                                            selectedIds: selected,
                                            selectedResources,
                                            setSelected,
                                        })}
                                    </div>
                                ))}
                            {customBulkActions &&
                                showCustomBulkActionDivider && (
                                    <Divider withoutPadding />
                                )}

                            {!withoutDefaultBulkActions && (
                                <>
                                    {showArchiveBulk() && (
                                        <DropdownElement
                                            onClick={() =>
                                                onBulkActionCall
                                                    ? onBulkActionCall(
                                                          selected,
                                                          'archive'
                                                      )
                                                    : bulk('archive')
                                            }
                                            icon={<Icon element={MdArchive} />}
                                        >
                                            {t('archive')}
                                        </DropdownElement>
                                    )}

                                    {showDeleteBulk() && (
                                        <DropdownElement
                                            onClick={() =>
                                                onBulkActionCall
                                                    ? onBulkActionCall(
                                                          selected,
                                                          'delete'
                                                      )
                                                    : bulk('delete')
                                            }
                                            icon={<Icon element={MdDelete} />}
                                        >
                                            {t('delete')}
                                        </DropdownElement>
                                    )}

                                    {showRestoreBulk() && (
                                        <DropdownElement
                                            onClick={() =>
                                                onBulkActionCall
                                                    ? onBulkActionCall(
                                                          selected,
                                                          'restore'
                                                      )
                                                    : bulk('restore')
                                            }
                                            icon={<Icon element={MdRestore} />}
                                        >
                                            {t('restore')}
                                        </DropdownElement>
                                    )}
                                </>
                            )}
                        </Dropdown>
                    )}
                </Actions>
            )}

            {/* === TABEL UTAMA === */}
            <Table
                className={classNames(props.className, {
                    'pr-0': !hasVerticalOverflow,
                })}
                withoutPadding={withoutPadding}
                withoutBottomBorder={styleOptions?.withoutBottomBorder}
                withoutTopBorder={styleOptions?.withoutTopBorder}
                withoutLeftBorder={styleOptions?.withoutLeftBorder}
                withoutRightBorder={styleOptions?.withoutRightBorder}
                onVerticalOverflowChange={(hasOverflow) =>
                    setHasVerticalOverflow(hasOverflow)
                }
                isDataLoading={isLoading}
                style={props.style}
                resizable={apiEndpoint.pathname}
            >
                <Thead backgroundColor={styleOptions?.headerBackgroundColor}>
                    {/* Checkbox select-all */}
                    {!withoutActions && !hideEditableOptions && (
                        <Th
                            className={styleOptions?.thClassName}
                            resizable={`${apiEndpoint.pathname}.leftCheckbox`}
                        >
                            <Checkbox
                                innerRef={mainCheckbox}
                                onChange={(
                                    e: ChangeEvent<HTMLInputElement>
                                ) => {
                                    Array.from(
                                        document.querySelectorAll(
                                            '.child-checkbox'
                                        )
                                    ).forEach((chk: HTMLInputElement & any) => {
                                        chk.checked = e.target.checked;
                                        if (e.target.checked) {
                                            const found = selected.find(
                                                (id) => id === chk.id
                                            );
                                            if (!found) {
                                                setSelected((curr) => [
                                                    ...curr,
                                                    chk.id,
                                                ]);
                                            }
                                        } else {
                                            setSelected([]);
                                        }
                                    });
                                }}
                                cypressRef="dataTable2-checkbox"
                            />
                        </Th>
                    )}
                    {/* ← INSERTED: "No" header next to checkbox */}
                    <Th
                        className={styleOptions?.thClassName}
                        resizable={`${apiEndpoint.pathname}.noColumn`}
                    >
                        {t('No')}
                    </Th>

                    {/* Header kolom dinamis */}
                    {columns.map((col, idx) =>
                        !excludeColumns?.includes(col.id) ? (
                            <Th
                                id={col.id}
                                key={idx}
                                className={styleOptions?.thClassName}
                                isCurrentlyUsed={sortedBy === col.id}
                                onColumnClick={(data: ColumnSortPayload) => {
                                    // 1) Reset halaman ke 1
                                    setCurrentPage(1);

                                    // 2) Tandai kolom yang disort
                                    setSortedBy(data.field);

                                    // 3) Pastikan arah "desc" diubah jadi "dsc"
                                    //    ColumnSortPayload.sort biasanya "nama_lokasi|asc" atau "nama_lokasi|desc"
                                    const [field, dir] = data.sort.split('|');
                                    const diurutkan =
                                        dir === 'desc' ? 'dsc' : 'asc';
                                    setSort(`${field}|${diurutkan}`);
                                }}
                                childrenClassName={
                                    styleOptions?.thChildrenClassName
                                }
                                resizable={`${apiEndpoint.pathname}.${col.id}`}
                            >
                                <div className="flex items-center space-x-3">
                                    {dateRangeColumns.some(
                                        (dr) => dr.column === col.id
                                    ) && (
                                        <DateRangePicker
                                            setDateRange={setDateRange}
                                            onClick={() =>
                                                handleDateRangeColumnClick(
                                                    col.id
                                                )
                                            }
                                        />
                                    )}
                                    <span>{col.label}</span>
                                </div>
                            </Th>
                        ) : null
                    )}

                    {/* Kolom aksi per baris */}
                    {withResourcefulActions && !hideEditableOptions && (
                        <Th></Th>
                    )}
                </Thead>

                <Tbody style={styleOptions?.tBodyStyle}>
                    {/* Loading */}
                    {isLoading && (
                        <Tr
                            className={classNames({
                                'border-b border-gray-200':
                                    styleOptions?.addRowSeparator,
                                'last:border-b-0': hasVerticalOverflow,
                            })}
                        >
                            <Td colSpan={100}>
                                <Spinner />
                            </Td>
                        </Tr>
                    )}

                    {/* Error */}
                    {isError && (
                        <Tr
                            className={classNames({
                                'border-b border-gray-200':
                                    styleOptions?.addRowSeparator,
                                'last:border-b-0': hasVerticalOverflow,
                            })}
                        >
                            <Td className="text-center" colSpan={100}>
                                {t('error_refresh_page')}
                            </Td>
                        </Tr>
                    )}

                    {/* No data */}
                    {data &&
                        resources.length === 0 &&
                        !isLoading &&
                        !isError && (
                            <Tr
                                className={classNames({
                                    'border-b border-gray-200':
                                        styleOptions?.addRowSeparator,
                                    'last:border-b-0': hasVerticalOverflow,
                                })}
                            >
                                <Td
                                    className={styleOptions?.tdClassName}
                                    colSpan={100}
                                >
                                    {t('no_records_found')}
                                </Td>
                            </Tr>
                        )}

                    {/* Baris data */}
                    {data &&
                        resources.map((res: any, idx: number) => (
                            <Tr
                                key={idx}
                                className={classNames({
                                    'border-b border-gray-200':
                                        styleOptions?.addRowSeparator,
                                    'last:border-b-0': hasVerticalOverflow,
                                })}
                                backgroundColor={
                                    idx % 2 === 0 ? themeColors.$7 : ''
                                }
                            >
                                {/* Checkbox per baris */}
                                {!withoutActions && !hideEditableOptions && (
                                    <Td
                                        className="cursor-pointer"
                                        onClick={() =>
                                            selected.includes(res.id)
                                                ? setSelected((curr) =>
                                                      curr.filter(
                                                          (v) => v !== res.id
                                                      )
                                                  )
                                                : setSelected((curr) => [
                                                      ...curr,
                                                      res.id,
                                                  ])
                                        }
                                    >
                                        <Checkbox
                                            checked={selected.includes(res.id)}
                                            className="child-checkbox"
                                            value={res.id}
                                            id={res.id}
                                            cypressRef="dataTable2-checkbox"
                                        />
                                    </Td>
                                )}

                                {/* ← INSERTED: serial number cell next to checkbox */}
                                <Td
                                    className={styleOptions?.tdClassName}
                                    resizable={`${apiEndpoint.pathname}.noColumn`}
                                >
                                    {(currentPage - 1) * Number(perPage) +
                                        idx +
                                        1}
                                </Td>

                                {/* Data kolom dinamis */}
                                {columns.map((col, cidx) =>
                                    !excludeColumns?.includes(col.id) ? (
                                        <Td
                                            key={cidx}
                                            className={classNames(
                                                {
                                                    'cursor-pointer': cidx < 3,
                                                    'py-4': hideEditableOptions,
                                                },
                                                styleOptions?.tdClassName
                                            )}
                                            onClick={() => {
                                                if (cidx < 3) {
                                                    onTableRowClick
                                                        ? onTableRowClick(res)
                                                        : document
                                                              .getElementById(
                                                                  res.id
                                                              )
                                                              ?.click();
                                                }
                                            }}
                                            resizable={`${apiEndpoint.pathname}.${col.id}`}
                                        >
                                            {col.format
                                                ? col.format(res[col.id], res)
                                                : res[col.id] ?? ''}
                                        </Td>
                                    ) : null
                                )}

                                {/* Dropdown aksi per baris */}
                                {withResourcefulActions &&
                                    !hideEditableOptions && (
                                        <Td>
                                            <Dropdown label={t('actions')}>
                                                {/* Edit */}
                                                {linkToEdit &&
                                                    (showEdit?.(res) ??
                                                        true) && (
                                                        <DropdownElement
                                                            to={route(
                                                                linkToEdit,
                                                                { id: res.id }
                                                            )}
                                                            icon={
                                                                <Icon
                                                                    element={
                                                                        MdEdit
                                                                    }
                                                                />
                                                            }
                                                        >
                                                            {t('edit')}
                                                        </DropdownElement>
                                                    )}

                                                {/* Divider sebelum custom */}
                                                {linkToEdit &&
                                                    customActions &&
                                                    showCustomActionDivider(
                                                        res
                                                    ) &&
                                                    (showEdit?.(res) ??
                                                        true) && (
                                                        <Divider
                                                            withoutPadding
                                                        />
                                                    )}

                                                {/* Divider sebelum archive/restore/delete */}
                                                {customActions &&
                                                    (showRestore?.(res) ??
                                                        true) && (
                                                        <Divider
                                                            withoutPadding
                                                        />
                                                    )}

                                                {/* Archive */}
                                                {res.status === 'active' &&
                                                    res.deleted_at == null &&
                                                    (showArchive?.(res) ??
                                                        true) && (
                                                        <DropdownElement
                                                            onClick={() =>
                                                                bulk(
                                                                    'archive',
                                                                    res.id
                                                                )
                                                            }
                                                            icon={
                                                                <Icon
                                                                    element={
                                                                        MdArchive
                                                                    }
                                                                />
                                                            }
                                                        >
                                                            {t('archive')}
                                                        </DropdownElement>
                                                    )}

                                                {/* Delete */}
                                                {res.status === 'active' &&
                                                    res.deleted_at == null &&
                                                    (showDelete?.(res) ??
                                                        true) && (
                                                        <DropdownElement
                                                            onClick={() =>
                                                                bulk(
                                                                    'delete',
                                                                    res.id
                                                                )
                                                            }
                                                            icon={
                                                                <Icon
                                                                    element={
                                                                        MdDelete
                                                                    }
                                                                />
                                                            }
                                                        >
                                                            {t('delete')}
                                                        </DropdownElement>
                                                    )}

                                                {/* Restore */}
                                                {(res.status === 'archived' ||
                                                    res.deleted_at != null) &&
                                                    (showRestore?.(res) ??
                                                        true) && (
                                                        <DropdownElement
                                                            onClick={() =>
                                                                bulk(
                                                                    'restore',
                                                                    res.id
                                                                )
                                                            }
                                                            icon={
                                                                <Icon
                                                                    element={
                                                                        MdRestore
                                                                    }
                                                                />
                                                            }
                                                        >
                                                            {t('restore')}
                                                        </DropdownElement>
                                                    )}
                                            </Dropdown>
                                        </Td>
                                    )}
                            </Tr>
                        ))}
                </Tbody>

                {/* Footer summary (opsional) */}
                {Boolean(footerColumns.length) &&
                    Boolean(resources.length) &&
                    Boolean(reactSettings.show_table_footer) && (
                        <TFooter>
                            {!withoutActions && !hideEditableOptions && (
                                <Th></Th>
                            )}

                            {/* ← INSERTED: blank under "No." to align footer */}
                            <Td
                                resizable={`${apiEndpoint.pathname}.noColumn`}
                            ></Td>

                            {columns.map((col, fidx) =>
                                !excludeColumns?.includes(col.id) ? (
                                    <Td
                                        key={fidx}
                                        customizeTextColor
                                        resizable={`${apiEndpoint.pathname}.${col.id}`}
                                    >
                                        {getFooterColumn(col.id)
                                            ? getFooterColumn(col.id)!.format(
                                                  getColumnValues(col.id) || [],
                                                  resources
                                              ) ?? '-/-'
                                            : null}
                                    </Td>
                                ) : null
                            )}

                            {withResourcefulActions && !hideEditableOptions && (
                                <Th></Th>
                            )}
                        </TFooter>
                    )}
            </Table>

            {/* Pagination bawah */}
            {data && !withoutPagination && meta && (
                <Pagination
                    currentPerPage={perPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onRowsChange={(r) => setPerPage(r as PerPage)}
                    totalPages={meta.last_page}
                    totalRecords={meta.total}
                    leftSideChevrons={leftSideChevrons}
                />
            )}
        </div>
    );
}
