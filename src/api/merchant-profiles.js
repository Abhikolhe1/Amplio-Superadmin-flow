import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetMerchantProfiles() {
    const URL = endpoints.merchantProfiles.list;

    const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

    const refreshProfilesDetails = () => {
        mutate();
    };

    const memoizedValue = useMemo(
        () => ({
            merchantProfiles: data?.data?.profiles || [],
            totalCount: data?.data?.count || [],
            merchantProfilesLoading: isLoading,
            merchantProfilesError: error,
            merchantProfilesValidating: isValidating,
            merchantProfilesEmpty: !isLoading && (!data?.data?.profiles?.length),
            refreshProfilesDetails
        }),
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetMerchantProfile(id) {
    const URL = id ? [endpoints.merchantProfiles.details(id)] : null;

    const { data, isLoading, error, isValidating , mutate} = useSWR(URL, fetcher);
        const refreshProfilesDetails = () => {
        mutate();
    };

    const memoizedValue = useMemo(
        () => ({
            merchantProfile: data || [],
            merchantProfileLoading: isLoading,
            merchantProfileError: error,
            merchantProfileValidating: isValidating,
            refreshProfilesDetails
        }),
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}

// ----------------------------------------------------------------------

export function useFilterMerchantProfiles(params) {
    let URL = null;

    if (params.filter && params.status !== undefined) {
        URL = endpoints.merchantProfiles.filterStatusList(params.filter, params.status);
    }
    else if (params.filter) {
        URL = endpoints.merchantProfiles.filterList(params.filter);
    }
    else if (params.status !== undefined) {
        URL = endpoints.merchantProfiles.statusList(params.status);
    }

    const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
        keepPreviousData: true,
    });

    return useMemo(
        () => ({
            filteredMerchantProfiles: data?.data || [],
            totalCount: data?.count || {
                totalCount: 0,
                totalRejected: 0,
                totalPending: 0,
                totalUnderReview: 0,
                totalVerified: 0,
            },
            filterLoading: isLoading,
            filterError: error,
            filterValidating: isValidating,
            filterEmpty: !isLoading && (!data?.data?.length),
        }),
        [data, error, isLoading, isValidating]
    );
}

export function useGetMerchantSettlements(id) {
    const URL = id ? endpoints.merchantProfiles.settlements(id) : null;
    const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher, {
        keepPreviousData: true,
    });

    return useMemo(
        () => ({
            settlements: data?.data || { summary: {}, list: [] },
            settlementsLoading: isLoading,
            settlementsError: error,
            settlementsValidating: isValidating,
            refreshSettlements: mutate,
        }),
        [data?.data, error, isLoading, isValidating, mutate]
    );
}
