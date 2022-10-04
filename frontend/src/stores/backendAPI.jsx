import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const backendAPI = createApi({
    reducerPath: 'backend',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8080/'
    }),
    endpoints: (builder) => ({
        getRandomPassword: builder.query({
            query: () => ({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: '/random',
                method: 'GET'
            }),
        }),
        getDefaultAvatar: builder.query({
            query: () => ({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: '/default_avatar',
                method: 'GET'
            }),
        }),
        createUser: builder.mutation({
            query: (data) => ({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: '/register',
                method: 'POST',
                body: JSON.stringify(data),
            })
        }),
        loginUser: builder.mutation({
            query: (data) => ({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: '/login',
                method: 'POST',
                body: JSON.stringify(data),

            })
        }),
        getUser: builder.query({
            query: (data) => ({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: '/getUser',
                method: 'POST',
                body: JSON.stringify(data),
            })
        }),
        updateUser: builder.mutation({
            query: (data) => ({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: '/updateUser',
                method: 'POST',
                body: data
            })
        }),
        addPasslist: builder.mutation({
            query: (data) => ({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: '/addPasslist',
                method: 'POST',
                body: JSON.stringify(data),
            })
        }),
        getPasslist: builder.query({
            query: (data) => ({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: '/getPasslist',
                method: 'POST',
                body: JSON.stringify(data),
            })
        }),
        deletePasslist: builder.mutation({
            query: (data) => ({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: '/deletePasslist',
                method: 'POST',
                body: JSON.stringify(data),
            })
        })
    })
})

export const {
    useGetRandomPasswordQuery,
    useCreateUserMutation,
    useLoginUserMutation,
    useGetUserQuery,
    useUpdateUserMutation,
    useGetDefaultAvatarQuery,
    useAddPasslistMutation,
    useGetPasslistQuery,
    useDeletePasslistMutation
} = backendAPI