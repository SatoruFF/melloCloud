import type { FeatureFlags } from '../types/featureFlags';
import { ApiPaths } from '../consts/localVariables';
import { rtkApi } from './rtkApi';

export const featureFlagsApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeatureFlags: builder.query<FeatureFlags, void>({
      query: () => ApiPaths.featureFlags,
    }),
  }),
});

export const { useGetFeatureFlagsQuery, useLazyGetFeatureFlagsQuery } = featureFlagsApi;
