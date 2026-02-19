import {
    createSearchParamsCache,
    parseAsBoolean
} from 'nuqs/server'

export const leaderboardSearchParams = {
    isActive: parseAsBoolean,
    isPublic: parseAsBoolean,
}

export const loadLeaderboardSearchParams = createSearchParamsCache(leaderboardSearchParams)
