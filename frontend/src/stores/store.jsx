import {configureStore} from '@reduxjs/toolkit'
import {backendAPI} from './backendAPI'
import { setupListeners } from '@reduxjs/toolkit/dist/query'

export const store = configureStore({
    reducer: {
        [backendAPI.reducerPath]: backendAPI.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(backendAPI.middleware)
    ,
    devTools: process.env.NODE_ENV !== 'production'
})

setupListeners(store.dispatch)
